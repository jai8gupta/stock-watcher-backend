import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { config } from './config.js';
import { kite } from './kite-service.js';
import { analyse } from './indicators.js';
import { addPushToken } from './push.js';

const app=Fastify({logger:{level:config.NODE_ENV==='production'?'info':'debug'}});
await app.register(cors,{origin:config.APP_ORIGIN==='*'?true:config.APP_ORIGIN.split(',')});
app.addHook('onRequest',async(req,reply)=>{if(!config.API_CLIENT_TOKEN||req.url.startsWith('/health')||req.url.startsWith('/auth/zerodha'))return;if(req.headers.authorization!==`Bearer ${config.API_CLIENT_TOKEN}`)return reply.code(401).send({error:'Unauthorized'})});
app.get('/health',async()=>({ok:true,time:new Date().toISOString(),kite:kite.status()}));
app.get('/auth/zerodha',async(_req,reply)=>reply.redirect(kite.loginUrl()));
app.get('/auth/zerodha/callback',async(req,reply)=>{const parsed=z.object({request_token:z.string().min(1),status:z.string().optional()}).safeParse(req.query);if(!parsed.success)return reply.code(400).send({error:'Missing request_token'});try{const result=await kite.authenticate(parsed.data.request_token);if(config.APP_DEEP_LINK)return reply.redirect(`${config.APP_DEEP_LINK}?connected=1`);return reply.type('text/html').send(`<main style="font-family:system-ui;max-width:560px;margin:80px auto"><h1>Stock Watcher connected</h1><p>Zerodha user ${result.userId} is authenticated. You can close this tab.</p></main>`)}catch(error){req.log.error(error);return reply.code(502).send({error:'Zerodha authentication failed'})}});
app.get('/v1/status',async()=>kite.status());
app.get('/v1/quotes',async()=>({data:kite.getQuotes()}));
app.get('/v1/candles',async(req,reply)=>{const parsed=z.object({symbol:z.string().regex(/^(NSE|BSE):/),interval:z.literal('5m').default('5m'),limit:z.coerce.number().int().min(30).max(500).default(100)}).safeParse(req.query);if(!parsed.success)return reply.code(400).send({error:parsed.error.flatten()});try{return await kite.historical(parsed.data.symbol,parsed.data.limit)}catch(error){return reply.code(503).send({error:error instanceof Error?error.message:'Market data unavailable'})}});
app.get('/v1/analysis',async(req,reply)=>{const parsed=z.object({symbol:z.string().regex(/^(NSE|BSE):/)}).safeParse(req.query);if(!parsed.success)return reply.code(400).send({error:parsed.error.flatten()});try{return analyse(parsed.data.symbol,await kite.historical(parsed.data.symbol,100))}catch(error){return reply.code(503).send({error:error instanceof Error?error.message:'Analysis unavailable'})}});
app.post('/v1/scan',async(req,reply)=>{const parsed=z.object({symbols:z.array(z.string().regex(/^(NSE|BSE):/)).min(1).max(60)}).safeParse(req.body);if(!parsed.success)return reply.code(400).send({error:'Provide 1 to 60 valid NSE/BSE symbols'});try{return await kite.scan(parsed.data.symbols)}catch(error){return reply.code(503).send({error:error instanceof Error?error.message:'Market scan unavailable'})}});
app.post('/v1/devices',async(req,reply)=>{const parsed=z.object({expoPushToken:z.string().regex(/^(Exponent|Expo)PushToken\[[^\]]+\]$/)}).safeParse(req.body);if(!parsed.success)return reply.code(400).send({error:'Invalid Expo push token'});addPushToken(parsed.data.expoPushToken);return reply.code(201).send({ok:true})});
await kite.init();
await app.listen({port:config.PORT,host:config.HOST});
const memoryLog=setInterval(()=>{const memory=process.memoryUsage();app.log.info({rssMb:Math.round(memory.rss/1048576),heapUsedMb:Math.round(memory.heapUsed/1048576),kite:kite.status()},'runtime health')},60000);memoryLog.unref();
async function shutdown(signal:string){app.log.info({signal},'shutting down');clearInterval(memoryLog);await app.close();process.exit(0)}
process.once('SIGTERM',()=>void shutdown('SIGTERM'));process.once('SIGINT',()=>void shutdown('SIGINT'));
process.on('unhandledRejection',reason=>app.log.error({reason},'unhandled rejection'));
process.on('uncaughtException',error=>{app.log.fatal({error},'uncaught exception');process.exit(1)});

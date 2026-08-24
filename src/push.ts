import { config } from './config.js';
const tokens=new Set<string>();
export function addPushToken(token:string){tokens.add(token)}
export async function sendPush(title:string,body:string,data:Record<string,unknown>={}){if(!tokens.size)return;const headers:Record<string,string>={'Content-Type':'application/json'};if(config.EXPO_ACCESS_TOKEN)headers.Authorization=`Bearer ${config.EXPO_ACCESS_TOKEN}`;await fetch('https://exp.host/--/api/v2/push/send',{method:'POST',headers,body:JSON.stringify([...tokens].map(to=>({to,sound:'default',title,body,data})))})}

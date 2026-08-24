import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from './config.js';

const aliases:Record<string,string>={'BAJAJ-AUTO':'NSE:BAJAJ_AUTO','HCL-INSYS':'NSE:HCL-INSYS'};
export async function loadWatchlist(){const raw=await readFile(resolve(process.cwd(),config.WATCHLIST_PATH),'utf8');return [...new Set(raw.split(/[\s,]+/).map(x=>aliases[x]??x).filter(x=>/^(NSE|BSE):.+/.test(x)))];}

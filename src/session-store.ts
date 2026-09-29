import { mkdir,readFile,rm,writeFile } from 'node:fs/promises';
import { dirname,resolve } from 'node:path';
import { config } from './config.js';
import type { Session } from './types.js';

const path=resolve(process.cwd(),config.SESSION_PATH);
export async function loadSession():Promise<Session|null>{try{return JSON.parse(await readFile(path,'utf8'))}catch{return null}}
export async function saveSession(session:Session){await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(session,null,2),{encoding:'utf8',mode:0o600})}
export async function clearSession(){await rm(path,{force:true}).catch(()=>undefined)}

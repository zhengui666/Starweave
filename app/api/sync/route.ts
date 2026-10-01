// This endpoint is for the owner's shared board. The Site MUST remain owner-private.
// Sites dispatch enforces private access and consumes its platform service credential.
// It does not manufacture a visitor identity. No connected-source permissions are used.
import {readBoard,mutate} from '@/lib/storage';
import type {Operation} from '@/lib/board';
export async function GET(){try{return Response.json(await readBoard('primary'));}catch{return Response.json({error:'存储暂不可用'},{status:503});}}
export async function POST(req:Request){try{const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'来源无效'},{status:403});const p=await req.json() as {revision:number;operation:Operation};if(!['create','update'].includes(p?.operation?.action))throw Error('只支持新增和更新');return Response.json(await mutate('primary',p.revision,p.operation,'agent'));}catch(e){return Response.json({error:e instanceof Error?e.message:'同步失败'},{status:409});}}

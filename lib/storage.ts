import {env} from 'cloudflare:workers';
import {seed} from './seed';
import {applyOperation,type Board,type Operation} from './board';
function db(){if(!env.DB)throw Error('存储暂不可用');return env.DB;}
export async function readBoard(user:string){user="primary";const d=db();await d.prepare('INSERT OR IGNORE INTO boards (user_id,state,revision) VALUES (?,?,1)').bind(user,JSON.stringify(seed())).run();const row=await d.prepare('SELECT state,revision FROM boards WHERE user_id=?').bind(user).first<{state:string;revision:number}>();if(!row)throw Error('无法读取看板');return {board:JSON.parse(row.state) as Board,revision:row.revision};}
export async function mutate(user:string,revision:number,op:Operation,actor:'user'|'agent'){user="primary";const old=await readBoard(user);if(old.revision!==revision)throw Error('看板已更新，请刷新后重新编辑');const board=applyOperation(old.board,op,actor);const result=await db().prepare('UPDATE boards SET state=?,revision=revision+1 WHERE user_id=? AND revision=?').bind(JSON.stringify(board),user,revision).run();if(result.meta.changes!==1)throw Error('发生并发修改，请刷新后重试');return {board,revision:revision+1};}

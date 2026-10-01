export const statuses = ['pending','in_progress','blocked','paused','done'] as const;
export type Status = typeof statuses[number];
export type Task = {id:string;parentId:string|null;title:string;status:Status;detail:string;next:string;evidence:string;updatedAt:string;deletedAt:string|null;locks:string[]};
export type Board = {tasks:Task[];events:{at:string;actor:string;text:string}[]};
export type Operation = {action:'create'|'update'|'delete'|'restore'|'unlock';id:string;parentId?:string|null;patch?:Partial<Pick<Task,'title'|'status'|'detail'|'next'|'evidence'>>};
const fields=['title','status','detail','next','evidence'] as const;
export function applyOperation(original:Board,op:Operation,actor:'user'|'agent',now=new Date().toISOString()):Board {
 const board:Board=structuredClone(original);if(!op||!['create','update','delete','restore','unlock'].includes(op.action)||typeof op.id!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(op.id))throw Error('操作或任务编号无效');
 const patch=op.patch||{};for(const k of Object.keys(patch)){if(!fields.includes(k as typeof fields[number]))throw Error('不支持的字段');const v=patch[k as keyof typeof patch];if(typeof v!=='string'||v.length>(k==='title'?160:5000))throw Error('字段过长或格式错误');}
 if(patch.title!==undefined&&!patch.title.trim())throw Error('标题不能为空');if(patch.status!==undefined&&!statuses.includes(patch.status))throw Error('状态无效');
 let item=board.tasks.find(t=>t.id===op.id);
 if(op.action==='create') {if(item)throw Error('编号已存在，包括回收站中的任务；请读取并更新原记录');if(board.tasks.length>=2000)throw Error('任务数量已达上限');if(!patch.title)throw Error('请输入标题');const parent=op.parentId?board.tasks.find(t=>t.id===op.parentId):null;if(op.parentId&&(!parent||parent.deletedAt))throw Error('上级任务不存在或已删除');item={id:op.id,parentId:op.parentId||null,title:patch.title,status:'pending',detail:'',next:'',evidence:'',updatedAt:now,deletedAt:null,locks:[],...patch};board.tasks.push(item);}
 else {if(!item)throw Error('找不到任务');if(op.action==='update'){if(item.deletedAt)throw Error('任务已删除，不能自动恢复');if(actor==='agent'&&Object.keys(patch).some(k=>item!.locks.includes(k)))throw Error('这些字段由你手动修改并锁定，自动更新未覆盖');Object.assign(item,patch);if(actor==='user')item.locks=Array.from(new Set([...item.locks,...Object.keys(patch)]));}
 if(op.action==='unlock'){if(actor!=='user')throw Error('仅用户可以解除手动字段保护');item.locks=[];}
 if(op.action==='delete'||op.action==='restore'){if(actor!=='user')throw Error('删除或恢复仅可在用户明确操作时进行');const ids=new Set([item.id]);for(let i=0;i<board.tasks.length;i++)for(const t of board.tasks)if(t.parentId&&ids.has(t.parentId))ids.add(t.id);if(op.action==='restore'&&item.parentId&&board.tasks.find(t=>t.id===item!.parentId)?.deletedAt)throw Error('请先恢复上级项目');for(const t of board.tasks)if(ids.has(t.id)){t.deletedAt=op.action==='delete'?now:null;t.updatedAt=now;}}
 item.updatedAt=now;}
 board.events.unshift({at:now,actor,text:`${op.action} · ${item.title}`});board.events=board.events.slice(0,200);return board;
}

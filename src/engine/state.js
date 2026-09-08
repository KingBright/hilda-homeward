Homeward.define("engine/state", ["story"], (Story) => {
const boolFlags=new Set(('letter promise lampTaken awning crankTaken crankMounted gateOpen ropeTaken hookTaken grappleSet bridge archiveTalk planTaken filter pump lineTaken lift shadePlaced calm towerGate feltTaken bypassMounted bypass damped fridaHold davidHold heart roofAnchor davidSafe fridaSafe beacon twigSafe roofDone reunited hug ended gearSTaken gearMTaken gearLTaken gearSSet gearMSet gearLSet trail0 trail1 trail2 hood0 hood1 hood2 tea0 tea1 tea2 branchBent poleTaken pumpPrimed gearAligned').split(' '));
const numericFlags={gearIndex:[0,3],gateTurns:[0,3],bypassTurns:[0,2],ladderX:[640,1260],drive:[0,100]};
const milestones=['','promise','gateOpen','bridge','planTaken','pump','lift','calm','towerGate','heart','roofDone','reunited'];
const sketches={mountain:['妈妈画的山','画里那条小路，最后总会回到有灯的窗前。'],city:['雨里倒着一座城','灯光在水洼里摇晃，像有人把另一座城藏到了脚下。'],elf:['精灵的雨天条款','第八十二条：未经本人同意，雨滴不得落在已批准的文件上。'],oldFriends:['门上的两个手印','一个小小的人类手印，挨着一个大大的巨魔手印。时间没有把它们分开。'],dawn:['天终于亮了','害怕没有一夜之间消失。但天亮时，我们学会了牵着它继续走。'],return:['同一扇窗','昨夜世界那么大。清晨，所有的路都回到了这扇窗。']};
function fresh(){return {version:3,scene:0,inventory:[],f:{},notes:[],sketches:[],visited:[],seen:[],valves:[0,1,0],weights:[],melody:[],beaconAngle:-65,danger:0,hints:Array(12).fill(0),failures:0,heroX:660,playSeconds:0,settings:{sound:false,relaxed:false,reduced:(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false)},savedAt:null};}
function validate(v){
 if(!v||typeof v!=='object'||Array.isArray(v)||![2,3].includes(v.version))throw Error('这不是受支持的归途 V2 / V3 存档。原来的进度不会被覆盖。');
 const num=(x,a,b)=>typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b;
 const arr=(x,p,max=100)=>Array.isArray(x)&&x.length<=max&&x.every(p);
 if(!Number.isInteger(v.scene)||!num(v.scene,0,11))throw Error('存档中的场景编号无效。');
 if(!v.f||typeof v.f!=='object'||Array.isArray(v.f))throw Error('存档的剧情状态损坏。');
 const o=fresh();o.scene=v.scene;
 for(const [k,value] of Object.entries(v.f)){if(boolFlags.has(k)){if(typeof value!=='boolean')throw Error('剧情标记无效：'+k);o.f[k]=value;}else if(numericFlags[k]){if(!num(value,...numericFlags[k]))throw Error('机关位置无效：'+k);o.f[k]=value;}else throw Error('未知的剧情标记：'+k);}
 const checks={inventory:[x=>typeof x==='string'&&Object.hasOwn(Story.items,x),20],notes:[x=>typeof x==='string'&&Object.hasOwn(Story.notes,x),30],sketches:[x=>typeof x==='string'&&Object.hasOwn(sketches,x),6],visited:[x=>Number.isInteger(x)&&num(x,0,11),12],seen:[x=>Number.isInteger(x)&&num(x,0,11),12],weights:[x=>Number.isInteger(x)&&num(x,1,3),3],melody:[x=>Number.isInteger(x)&&num(x,0,2),3]};
 for(const [k,[p,max]] of Object.entries(checks)){if(!arr(v[k],p,max))throw Error('存档中的 '+k+' 列表无效。');o[k]=[...new Set(v[k])];if(k==='melody')o[k]=v[k].slice();}
 if(!arr(v.valves,x=>Number.isInteger(x)&&num(x,0,3),3)||v.valves.length!==3)throw Error('管路状态损坏。');o.valves=v.valves.slice();
 if(!arr(v.hints,x=>Number.isInteger(x)&&num(x,0,3),12)||v.hints.length!==12)throw Error('提示状态损坏。');o.hints=v.hints.slice();
 for(const [k,a,b] of [['heroX',60,1540],['beaconAngle',-180,180],['danger',0,1],['playSeconds',0,1e8],['failures',0,1e6]]){if(!num(v[k],a,b))throw Error('存档中的 '+k+' 数值无效。');o[k]=v[k];}
 if(!v.settings||['sound','relaxed','reduced'].some(k=>typeof v.settings[k]!=='boolean'))throw Error('设置状态无效。');o.settings={sound:v.settings.sound,relaxed:v.settings.relaxed,reduced:v.settings.reduced};
 for(let i=1;i<=o.scene;i++){if(!o.f[milestones[i]])throw Error('存档缺少前序章节进度，无法安全继续。');}
 if(o.f.ended&&(!o.f.reunited||!o.f.hug||![0,1,2].every(i=>o.f['tea'+i])))throw Error('结局记录不完整。');
 if(v.version===2){
   if(o.f.pump)o.f.pumpPrimed=true;
   if(o.f.towerGate){o.f.gearAligned=true;o.f.gearIndex=3;}
   // The old waterworks rewarded this reusable tool. Restore it only after the reward flag.
   if(o.f.filter){o.f.poleTaken=true;if(!o.inventory.includes('pole'))o.inventory.push('pole');}
 }
 if(o.f.gearIndex!==undefined&&!Number.isInteger(o.f.gearIndex))throw Error('齿轮刻度必须是整数。');
 if(o.f.pump&&!o.f.pumpPrimed)throw Error('水泵缺少试压记录。');
 if(o.f.towerGate&&!o.f.gearAligned)throw Error('钟楼缺少对位记录。');
 o.savedAt=typeof v.savedAt==='string'?v.savedAt:null;return o;
}

return {fresh,validate,boolFlags,numericFlags,sketches};
});

Homeward.define("scene/7/logic", ["content/mechanisms", "story/helpers", "content/catalog"], (Mechanisms, {checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'被遗忘的钟楼门',english:'THE DOOR THAT REMEMBERS',actLabel:'第三幕 · 听懂它的害怕',mood:'旧钟楼 / 每一枚齿轮都有自己的位置',start:469,ground:x=>x<870?824:x<1230?778:828,
intro:[['希尔达','门上的齿轮拆散了，却没有被带走。'],['芙丽达','也许最后一次关门的人，还以为会回来。']],
hotspots:s=>[...([['gearS',453,765,82],['gearM',612,771,112],['gearL',795,763,151]].filter(([id])=>!s.f[id+'Taken']).map(([id,x,y,w])=>I(id,'拿起'+items[id],x,y,w,w))),...Mechanisms.gears.map(d=>H(d.socket,d.label,d.x,d.y,d.hit,d.hit,{walkX:d.x-50})),H('lever','拉动开门拉杆',1370,641,79,143,{walkX:1341}),exit('next','走进钟楼',1355,463,{walkX:1290}),H('etching','辨认门上的古老纹章',1360,261,214,134,{walkX:1235})],
act(g,id,item){if(id.startsWith('gear')){set(g,id+'Taken');g.take(id);}else if(id.startsWith('socket')){const k='gear'+id.slice(-1);if(f(g,k+'Set')){
if(k==='gearM'&&!f(g,'towerGate')){if(!['gearS','gearM','gearL'].every(key=>f(g,key+'Set')))return g.toast('等三枚齿轮都装好，再慢慢转动对位轮。');
const index=((g.s.f.gearIndex||0)+1)%4;set(g,'gearIndex',index);set(g,'gearAligned',index===Mechanisms.witnessIndex);g.sound('metal');return g.toast(index===Mechanisms.witnessIndex?'轮缘的金色刻线与机架顶端重合了。现在可以拉动门柄。':'轮缘上有一条金色刻线。让它对准机架顶端的缺口。');}
return g.toast('这枚齿轮已经咬合了。');} if(!need(g,k,item,'空槽的大小与齿轮不一样。看看轮缘能否刚好咬合。'))return;if(k==='gearL'){g.work(850,'沿着石阶斜坡，借助杠杆将沉重的大齿轮推入高处轴槽...',()=>{g.consume(k);set(g,k+'Set');g.sound('metal');g.toast('大齿轮落进高处主轴，沉沉地咬合了。');book(g,'gears');});}else{g.consume(k);set(g,k+'Set');g.sound('metal');g.toast('齿轮落进轴承，轮缘彼此咬合。');book(g,'gears');}}else if(id==='lever'){if(f(g,'towerGate'))return g.toast('门已经打开。');if(!['gearS','gearM','gearL'].every(k=>f(g,k+'Set')))return one(g,'芙丽达','拉杆动了，力量却传不到门上。还有空着的齿轮轴。');if(!f(g,'gearAligned'))return one(g,'芙丽达','齿轮在转，但门闩没有归位。转动中间的轮子，让轮缘上的金线对准上面的缺口。');g.work(1150,'把尘封的门慢慢拉开',()=>{set(g,'towerGate');g.sound('wood');g.toast('门后的钟声，近得像一颗不安的心。');});}else if(id==='next')advance(g,f(g,'towerGate'),8,'开门的力量，需要经过每一枚齿轮。');else if(id==='etching')g.sketch('oldFriends','门上的两个手印','一个小小的人类手印，挨着一个大大的巨魔手印。时间没有把它们分开。');else wrong(g);},
objective:s=>!s.f.towerGate?'装好三枚齿轮，再让中轮金线对准机架缺口。':'进入水钟的机械心脏。',
hints:s=>['地上的齿轮并没有丢失，只是离开了轴承。','轮子有三种大小，空槽也一样。先拿起来，再放回对应的槽。','小齿轮放最低的小轴；中齿轮放中间；大齿轮放最高。装齐后转中轮，让金线朝上，再拉右侧拉杆。']};
});

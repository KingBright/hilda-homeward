Homeward.define("scene/1/logic", ["story/helpers", "content/catalog"], ({checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'雨中的北门',english:'THE RAIN AT NORTH GATE',actLabel:'第一幕 · 跟着回声走',mood:'雨丝落下 / 北门的齿轮卡住了',start:375,ground:x=>793,
intro:[['大卫','我只是来帮忙修门的。真的。'],['希尔达','当然。我们先修门，然后顺便看看森林。'],['大卫','你的“顺便”，听起来总是有点长。']],
hotspots:s=>[H('david','询问大卫',735,688,108,183),H('awning','拉下遮雨棚的绳圈',962,s.f.awning?677:601,72,114,{drag:'awning',walkX:936}),...(s.f.awning&&!s.f.crankTaken?[I('crank','拿起露出的黄铜曲柄',845,614,79,80)]:[]),H('wheel','操作城门转轮',1169,603,116,120),exit('gate','穿过北门',1380,611),exit('back','回家',364,651,{walkX:448}),H('puddle','观察水洼中的倒影',953,824,234,60)],
act(g,id,item){if(id==='david')one(g,'大卫',f(g,'gateOpen')?'它开了！我跟你一起去。站在你后面那种一起。':'曲柄在摊位上，但湿透的遮雨棚把它盖住了。右边有根拉绳。');else if(id==='awning'){if(f(g,'awning'))return g.toast('雨棚已经卷起来了。');g.work(950,'拉起沉重的雨棚',()=>{set(g,'awning');g.sound('rope');g.toast('遮雨棚收起，摊位上的曲柄露了出来。');});}else if(id==='crank'){set(g,'crankTaken');g.take('crank');}else if(id==='wheel'){if(f(g,'gateOpen'))return g.toast('城门已经打开了。曲柄也已经取回。');if(!f(g,'crankMounted')){if(!need(g,'crank',item,'转轴少了一根曲柄。把背包里的曲柄放上去。'))return;set(g,'crankMounted');g.consume('crank');g.toast('曲柄卡入转轴。再转动几圈。');}else{set(g,'gateTurns',(g.s.f.gateTurns||0)+1);g.sound('metal');if(g.s.f.gateTurns>=3){set(g,'gateOpen');g.take('crank',false);g.sound('metal');say(g,[['大卫','咔哒！安全棘爪落槽咬死了，闸门不会再滑下来了！'],['希尔达','曲柄也取下来了，别留在雨里，带上它以防后面还要用。']]);}else g.toast('铁门升起了一截。继续转动。');}}else if(id==='gate')advance(g,f(g,'gateOpen'),2,'铁栅栏还没升起来。先让转轮重新工作。');else if(id==='back')g.go(0);else if(id==='puddle')g.sketch('city','雨里倒着一座城','灯光在水洼里摇晃，像有人把另一座城藏到了脚下。');else wrong(g);},
drag(g,id,p){if(id==='awning'&&p.dy>55&&!f(g,'awning')){set(g,'awning');g.sound('rope');g.toast('雨棚卷起了。曲柄就在下面。');return true;}return false;},
objective:s=>!s.f.awning?'卷起摊位的遮雨棚。':!s.f.crankTaken?'拿到黄铜曲柄。':!s.f.gateOpen?'让城门转轮重新工作。':'带着大卫走进森林。',
hints:s=>['遮雨棚、曲柄和城门转轮之间有联系。','向下拖动摊位右边的绳圈，会把棚布卷起来。','拉绳圈，拿曲柄。在背包选曲柄，再点城门左侧转轮；随后再点转轮三次。']};
});

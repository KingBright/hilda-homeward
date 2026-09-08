Homeward.define("scene/10/logic", ["story/helpers", "content/catalog"], ({checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'黎明之前的山脊',english:'THE LAST LIGHTS HOME',actLabel:'终幕 · 我们一起回去',mood:'雨停了 / 还有最后一个孩子要回家',start:544,ground:x=>x<550?833:x<990?807:810,chapter:['EPILOGUE','我们一起回去','最漫长的夜，也会走到有光的地方。'],
intro:[['阿尔弗','这里！我们在这里！孩子和我都很安全。'],['芙丽达','城门就在谷对面。但是回城的桥被洪水冲断了。'],['希尔达','先把路灯点起来。至少，让它的妈妈看见它。']],
hotspots:s=>[...[0,1,2].map((i)=>H('trail'+i,['近处','中间','远处'][i]+'的避风路灯',[430,731,1025][i],[653,611,625][i],82,149,{walkX:[418,722,978][i]})),H('child','带小巨魔去找妈妈',s.f.reunited?1249:682,s.f.reunited?732:715,114,162,{walkX:s.f.reunited?1080:685}),H('alfur','确认阿尔弗平安',752,765,63,102,{walkX:790}),exit('hand','沿着巨魔妈妈的手掌回家',1045,734,{walkX:1014}),H('sunrise','看一眼正在亮起来的天',1190,180,147,139,{walkX:867})],
act(g,id,item){if(id.startsWith('trail'))lightTrail(g,id,item);else if(id==='child'){if(f(g,'reunited'))return one(g,'希尔达','它回到妈妈身边了。我们也该回到自己的妈妈身边。');if(![0,1,2].every(i=>f(g,'trail'+i)))return one(g,'阿尔弗','雾还很厚。先点亮三盏路灯，她就能看清这条小路。');g.work(1250,'陪小巨魔走完最后一段路',()=>{set(g,'reunited');g.sound('warm');say(g,[['大卫','它妈妈把手伸过来了。她是在……给我们搭桥？'],['芙丽达','不是每座桥都由石头组成。'],['希尔达','谢谢你。现在，每个孩子都能回家了。']]);});}else if(id==='alfur')one(g,'阿尔弗','已确认：同行人员全部到齐。附注：这是我最喜欢的一张表。');else if(id==='hand'){if(!f(g,'reunited'))return one(g,'希尔达','先让这个孩子回到妈妈身边。我们说好了。');book(g,'ridge');g.go(11);}else if(id==='sunrise')g.sketch('dawn','天终于亮了','害怕没有一夜之间消失。但天亮时，我们学会了牵着它继续走。');else wrong(g);},
objective:s=>![0,1,2].every(i=>s.f['trail'+i])?'转好灯罩，用提灯点亮三盏路灯。':!s.f.reunited?'陪孩子回到妈妈身边。':'沿巨魔妈妈的手掌，带着朋友回家。',
hints:s=>['风会吹灭没有遮挡的灯，但提灯里还有火。','先点击路灯，把灯罩转到背风侧；再选背包里的提灯点亮它。','每盏路灯都先点一次转灯罩，再用提灯点一次。三盏都亮后点小巨魔，最后点伸来的手掌。']};
});

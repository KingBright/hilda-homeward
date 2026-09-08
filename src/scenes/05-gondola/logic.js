Homeward.define("scene/5/logic", ["story/helpers", "content/catalog"], ({checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'悬在雾里的升降站',english:'THE GONDOLA IN THE MIST',actLabel:'第二幕 · 山里藏着什么',mood:'山风渐强 / 一条路升起，另一条路沉没',start:402,ground:x=>783,
intro:[['芙丽达','升降机的水轮已经转了。只是配重失去了平衡。'],['大卫','它下面为什么看不见底？'],['希尔达','因为有雾。先不讨论第二种可能。']],
hotspots:s=>[I('line','带上应急救援绳',336,733,90,69),...[1,2,3].map((v,i)=>H('weight'+v,(s.weights.includes(v)?'取下':'放上')+['一格','两格','三格'][i]+'配重',s.weights.includes(v)?810+v*20:425+i*113,s.weights.includes(v)?588:665,79,102,{drag:'weight',value:v,walkX:700})),H('scale','查看配重横梁',811,493,340,212,{walkX:791}),H('brake','松开升降机制动',1029,631,111,120),exit('cabin','乘上升降机',1194,603,{walkX:1129}),exit('back','返回水泵房',126,683,{walkX:198})],
act(g,id,item){if(id==='line'){if(f(g,'lineTaken'))return g.toast('救援绳已经在背包里了。');set(g,'lineTaken');g.take('line');}else if(id.startsWith('weight'))balance(g,Number(id.slice(-1)));else if(id==='scale')one(g,'芙丽达','左边刻着四格。右边的配重加起来也需要四格，横梁才会水平。');else if(id==='brake'){if(f(g,'lift'))return g.toast('轿厢停稳了。现在可以上去。');if(g.s.weights.reduce((a,b)=>a+b,0)!==4){g.effect('shake');return say(g,[['大卫','停停停！它歪了！'],['芙丽达','安全棘爪扣住了。先调平配重，再试一次。']]);}set(g,'lift');g.sound('metal');g.toast('制动解开，轿厢稳稳地靠到了站台。');}else if(id==='cabin'){if(!f(g,'lift'))return one(g,'希尔达','先调平配重，再松开站台上的制动。');if(!f(g,'lineTaken'))return one(g,'芙丽达','把左边那卷应急绳带上。这种天气，别把安全留在站台。');say(g,[['大卫','刚才那条水道……不见了。'],['芙丽达','山洪把下面的回路淹没了。升降机也不能再折返。'],['希尔达','那就往前走。找到孩子，也找到另一条回家的路。']],()=>g.go(6));}else if(id==='back')g.go(4);else wrong(g);},
drag(g,id,p){if(id.startsWith('weight')&&Math.abs(p.x-810)<210&&Math.abs(p.y-490)<220){let v=Number(id.slice(-1));if(!g.s.weights.includes(v))balance(g,v);return true;}return false;},
objective:s=>!s.f.lineTaken?'先带上应急救援绳。':!s.f.lift?'配平吊盘，让升降机稳稳靠站。':'乘坐升降机进入深山。',
hints:s=>['横梁左边的符号是四。右边不能太轻，也不能太重。','三个砝码分别是一、二、三格；只需要其中两个。','使用一格和三格配重，不要使用两格。再点轿厢左边的制动轮，带上绳索后上车。']};
});

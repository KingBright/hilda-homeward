Homeward.define("scene/3/logic", ["story/helpers", "content/catalog"], ({checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'树根下的档案室',english:'THE ARCHIVE BENEATH THE ROOTS',actLabel:'第二幕 · 山里藏着什么',mood:'纸页、树根和一百年没被打开的抽屉',start:525,ground:x=>819,chapter:['ACT II','山里藏着什么','越往深处走，钟声越不像警报。'],
intro:[['阿尔弗','你们终于来了！我申请了紧急查阅许可。只有七页。'],['希尔达','只有七页档案？'],['阿尔弗','不。七页申请。档案在上面。那本带水滴的。']],
hotspots:s=>[H('alfur','和阿尔弗交谈',406,524,104,140,{walkX:480}),H('ladder','移动书架前的梯子',s.f.ladderX||769,579,133,399,{drag:'ladder',walkX:s.f.ladderX||769}),...(!s.f.planTaken?[I('book','取出带水滴的旧档案',1170,339,76,132,{walkX:1170})]:[H('book','翻看水钟档案',1170,339,76,132)]),H('record','看看精灵公告',339,351,219,264,{walkX:480}),exit('next','通向旧水道',1460,658,{walkX:1406}),exit('back','返回森林',152,685,{walkX:210})],
act(g,id,item){if(id==='alfur'){set(g,'archiveTalk');one(g,'阿尔弗',f(g,'planTaken')?'图纸写得很清楚：先让水经过旁路，再让钟安静。顺序不能反过来。':'轮子上的梯子能沿地上的轨道移动。最右边那本，画着水滴。');}else if(id==='ladder'){g.s.f.ladderX=(g.s.f.ladderX||769)+140;if(g.s.f.ladderX>1250)g.s.f.ladderX=660;g.commit();g.sound('wood');g.toast('梯子沿着轨道滑动。也可以直接左右拖动。');}else if(id==='book'){if(f(g,'planTaken'))return one(g,'阿尔弗','水钟不是用来驱赶巨魔的。它本来是用来保护山里所有居民的。');if(Math.abs((g.s.f.ladderX||769)-1170)>75)return one(g,'希尔达','太高了。先把梯子移到这本书下面。');g.work(900,'沿梯子取出旧档案',()=>{set(g,'planTaken');g.take('plan',false);book(g,'plan');say(g,[['希尔达','这不是普通的钟楼。底下连着整座山的泄洪水道。'],['阿尔弗','很久以前，人和巨魔一起建造了它。'],['大卫','那为什么它现在只会吓人？'],['希尔达','因为有人忘了，它本来是用来帮助谁的。']]);});}else if(id==='record')g.sketch('elf','精灵的雨天条款','第八十二条：未经本人同意，雨滴不得落在已批准的文件上。');else if(id==='next')advance(g,f(g,'planTaken'),4,'先查清楚水钟的结构。我们不能一边猜，一边修。');else if(id==='back')g.go(2);else wrong(g);},
drag(g,id,p){if(id==='ladder'){g.s.f.ladderX=Math.max(640,Math.min(1260,p.x));g.commit();return true;}return false;},
objective:s=>!s.f.planTaken?'移动梯子，取出最右侧的水钟档案。':'带着图纸进入旧水道。',
hints:s=>['书很高，但梯子下面有轮子。','把梯子左右拖动，移到右侧发黄的竖放档案下。','将梯子中心拖到右边那本浅黄色书的正下方，再点书。点梯子也能逐段移动。']};
});

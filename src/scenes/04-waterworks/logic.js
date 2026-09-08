Homeward.define("scene/4/logic", ["story/helpers", "content/catalog", "engine/hydraulics"], ({checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}, Hydraulics) => {

return {
name:'沉睡的回流水泵',english:'THE SLEEPING WATERWORKS',actLabel:'第二幕 · 山里藏着什么',mood:'旧水道 / 第一件修好的东西，唤醒了另一件',start:561,ground:x=>x<460?788:x<1290?831:792,
intro:[['芙丽达','我在上面的升降站听到了水声。就顺着水道下来了。'],['希尔达','正好！你能帮我们看看这张图吗？'],['芙丽达','能。不过先别相信这台机器看起来很安静。']],
hotspots:s=>[H('filter','清理进水滤网',453,514,111,147,{walkX:514}),H('pipe0','旋转上方弯管',640,400,109,109,{walkX:640}),H('pipe1','旋转左下弯管',640,570,109,109,{walkX:640}),H('pipe2','旋转右下弯管',940,570,109,109,{walkX:940}),H('prime','拉动试压柄',1128,668,110,90,{walkX:1110}),H('gauge','查看回流压力表',1128,473,158,183),exit('next','上到升降站',1474,611,{walkX:1396}),exit('back','回档案室',142,588,{walkX:246})],
act(g,id,item){if(id==='filter'){if(f(g,'filter'))return g.toast('滤网已经畅通。');set(g,'filter');set(g,'poleTaken');g.take('pole',false);g.sound('water');say(g,[['希尔达','落叶清掉了！水流开始进来了。咦，水草堆里还卡着一根带长钩的检修挑杆！'],['芙丽达','正好！上面四米多高的弯管手够不到，用这根挑杆就能挑动活节了！']]);pipeCheck(g);}else if(id==='prime'){
if(f(g,'pump'))return g.toast('水泵正在稳定运行，接头已锁紧。');
if(!f(g,'filter'))return one(g,'芙丽达','进水口堵着。先清掉滤网上的落叶，再试压。');
if(!Hydraulics.trace(g.s.valves,true).connected)return one(g,'芙丽达','水还没有到达右上方的出口。看漏水的位置，先把管路接通。');
g.work(950,'缓缓拉下试压柄，留意压力表',()=>{set(g,'pumpPrimed');pipeCheck(g);});
}else if(id.startsWith('pipe')){if(f(g,'pump'))return g.toast('接头已经带压锁紧。不要在运行时拆动水路。');let i=Number(id.slice(-1));if(i===0&&!f(g,'poleTaken')){return say(g,[['希尔达','上方的高空活节离地面太高了，空手够不着！'],['芙丽达','水流滤网那边好像卡着不少杂物，先去清开滤网，看看有没有以前留下的长柄工具。']]);}if(i===0&&!need(g,'pole',item,'选中检修挑杆，再拨动高处的接头。'))return;g.s.valves[i]=(g.s.valves[i]+1)%4;g.commit();g.sound('metal');if(i===0)g.toast('用长柄挑杆挑动高空活节，上方弯管顺畅旋转了。');if(Hydraulics.trace(g.s.valves,!!f(g,'filter')).connected)g.toast('水路已经连通。拉下压力表下面的试压柄。');}else if(id==='gauge')one(g,'芙丽达',f(g,'pump')?'回流水压正常，但泄洪支路的压力还在升高。我们得去钟楼。':'让水从左上流入，经过三个弯管，再从右上方出去。漏水的位置就是断路的位置。接通以后，还要拉下压力表下面的试压柄。');else if(id==='next')advance(g,f(g,'pump'),5,'升降机还没有水力。先打通回流管道。');else if(id==='back')g.go(3);else wrong(g);},
objective:s=>!s.f.filter?'把堵住滤网的落叶清掉并拿取挑杆。':!s.f.pump?(Hydraulics.trace(s.valves,!!s.f.filter).connected?'水路已连通，拉下压力表下的试压柄。':'旋转三个弯管，连通回流水路。'):'升降机已恢复，尽快去山谷。',
hints:s=>[!s.f.filter?'先清理进水滤网，留意杂物中的长柄工具。':'观察水能走到哪里。漏点前的接头已经接通，不必从头乱转。','高处弯管需要选中挑杆。三个接头连成左上进、向下、向右、再向上的水路。','上方朝左下，左下朝上右，右下朝左上。接通以后，拉下压力表下面的试压柄。']};
});

Homeward.define('scene/3/logic', ['story/helpers','content/setpieces'], ({H,I,exit,f,say,one,set,advance,book}, Stage) => {
  function move(g,x) {
    if(f(g,'ladderBrake'))return one(g,'希尔达','轮子已经锁住了。先松开梯脚旁的黄铜刹车，再移动。');
    const from=Stage.ladderX(g.s),to=Stage.snapLadder(x);
    if(Math.abs(from-to)<5)return g.toast('梯子就在这个位置。水滴标记对应右侧的水钟卷宗。');
    g.work(800+Math.abs(to-from)*1.6,'握住侧杆，把梯子推到下一段轨道',()=>{
      g.s.f.ladderX=to;g.commit();g.sound('wood');
      g.toast(Stage.aligned(g.s)?'水滴刻线对齐了。锁住梯脚的刹车，再取书。':'轨道上还有其他停靠刻线。带水滴的档案在右边。');
    },{kind:'push',effect:'ladderSlide',from,to,destinationX:to-62,target:[from-31,Stage.archive.gripY]});
  }
  return {
    name:'树根下的档案室',english:'THE ARCHIVE BENEATH THE ROOTS',actLabel:'第二幕 · 山里藏着什么',mood:'纸页、树根和一百年没被打开的抽屉',start:525,ground:x=>819,
    chapter:['ACT II','山里藏着什么','越往深处走，钟声越不像警报。'],
    intro:[['阿尔弗','紧急查阅许可批准了。只用了七页申请！水钟卷宗在最右边，带水滴的那本。'],['希尔达','轨道旁也有水滴。梯子能推过去。'],['阿尔弗','先对准，再锁轮。档案室里最重要的一条规定是：借书的人，也要好好回来。']],
    hotspots:s=>[H('alfur','和阿尔弗交谈',406,524,104,140,{walkX:480}),
      H('ladder','握住侧杆，移动档案梯',Stage.ladderX(s),643,112,260,{drag:'ladder',walkX:Stage.ladderX(s)-62}),
      H('ladderBrake',s.f.ladderBrake?'松开梯脚刹车':'锁住梯脚刹车',Stage.ladderX(s)+82,777,48,54,{walkX:Stage.ladderX(s)+38}),
      I('book',s.f.planTaken?'翻看水钟档案':'爬梯取出带水滴的档案',1170,342,76,122,{walkX:Stage.ladderX(s)-17}),
      H('record','看看精灵公告',339,351,219,264,{walkX:480}),exit('next','通向旧水道',1460,658,{walkX:1406}),exit('back','返回森林',152,685,{walkX:210})],
    act(g,id) {
      if(id==='alfur'){set(g,'archiveTalk');return one(g,'阿尔弗',f(g,'planTaken')?'先让水经过旁路，再让钟安静。顺序不能反过来。':'轨道刻线和书脊图案是对应的。推到水滴刻线，踩下梯脚旁的刹车，才能上去。');}
      if(id==='ladder')return move(g,Stage.nextDock(g.s));
      if(id==='ladderBrake')return g.work(650,'踩下梯脚的黄铜锁杆',()=>{set(g,'ladderBrake',!f(g,'ladderBrake'));g.sound('metal');g.toast(f(g,'ladderBrake')?'轮子停稳了。现在可以检查梯子上方的书。':'锁杆抬起来了，梯子可以沿轨道移动。');});
      if(id==='book') {
        if(f(g,'planTaken'))return one(g,'阿尔弗','水钟本来是用来保护山里所有居民的。图纸边上写着：先稳住，再伸手。');
        if(!Stage.aligned(g.s))return one(g,'希尔达','侧着身子够不到。把梯子推到水滴刻线下，正对这本档案。');
        if(!f(g,'ladderBrake'))return one(g,'希尔达','轮子还会滑。先踩下梯脚旁的刹车，不能就这样爬上去。');
        return g.work(3800,'扶稳梯子，取出档案，再回到地面',()=>{
          set(g,'planTaken');g.take('plan',false);book(g,'plan');g.sound('paper');
          say(g,[['希尔达','这不是普通的钟楼。底下连着整座山的泄洪水道。'],['阿尔弗','很久以前，人和巨魔一起建造了它。'],['大卫','页角的字好像是后补的：先稳住，再伸手。'],['希尔达','修钟的人希望后来的人也安全回来。我们记住它。']]);
        });
      }
      if(id==='record')return g.sketch('elf','精灵的雨天条款','第八十二条：未经本人同意，雨滴不得落在已批准的文件上。');
      if(id==='next')return advance(g,f(g,'planTaken'),4,'先查清水钟的结构。我们不能一边猜，一边修。');
      if(id==='back')g.go(2);
    },
    drag(g,id,p){if(id!=='ladder')return false;move(g,p.x);return true;},
    objective:s=>s.f.planTaken?'带着图纸进入旧水道。':!Stage.aligned(s)?'把梯子推到带水滴的档案正下方。':!s.f.ladderBrake?'锁住梯脚旁的黄铜刹车。':'爬梯取出档案，并安全返回地面。',
    hints:s=>['轨道的刻线，对应书脊上的图案。','把梯子移到最右侧的水滴刻线，然后锁住右侧梯脚的刹车。','点梯子可切换停靠位，也可以左右拖动。对准水滴后，点梯脚刹车，再点高处那本浅黄色档案。']
  };
});

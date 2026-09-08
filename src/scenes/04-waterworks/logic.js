Homeward.define('scene/4/logic', ['story/helpers','engine/hydraulics','content/walkways'], ({H,exit,f,say,one,set,need,advance,pipeCheck,wrong},Hydraulics,Walkways) => ({
  name:'沉睡的回流水泵',english:'THE SLEEPING WATERWORKS',actLabel:'第二幕 · 山里藏着什么',
  mood:'旧水道 / 修好一处机关，才看见下一层真相',start:561,
  ground:Walkways.waterworksGround,
  intro:[['芙丽达','我从升降站顺着水声找下来的。你们也听到了？'],['希尔达','是的。城门、溪流，似乎都在受同一台机器影响。'],['芙丽达','先看右上角的检修牌。水安静，不代表它没有力气。']],
  hotspots:s=>[
    H('intake',s.f.intakeClosed?'打开进水闸':'关闭进水闸',350,682,86,94,{walkX:307}),
    H('filter','检查并清理进水滤网',453,640,111,147,{walkX:409}),
    H('pipe0','用挑杆旋转高处弯管',640,400,109,109,{walkX:618}),
    H('pipe1','旋转左下弯管',640,570,109,109,{walkX:617}),
    H('pipe2','旋转右下弯管',940,570,109,109,{walkX:911}),
    H('prime','缓缓拉下试压柄',1128,668,110,90,{walkX:1095}),
    H('gauge','查看压力表和检修牌',1128,473,158,183,{walkX:1110}),
    exit('next','上到升降站',1474,611,{walkX:1396}),exit('back','回档案室',142,588,{walkX:246})
  ],
  act(g,id,item){
    if(id==='intake'){
      if(f(g,'pump'))return g.toast('水泵已经接入升降机，进水闸被运行锁扣住了。');
      const closing=!f(g,'intakeClosed');
      return g.work(900,closing?'握住手轮，关闭滤网前的进水闸':'缓缓打开进水闸，观察低压试水',()=>{set(g,'intakeClosed',closing);g.sound(closing?'metal':'water');g.toast(closing?'水停了。现在可以取开滤网上的落叶。':f(g,'filter')?'低压试水开始。沿着亮起的管路，找到第一处漏点。':'进水恢复了，但滤网仍被落叶堵住。');});
    }
    if(id==='filter'){
      if(f(g,'filter'))return g.toast('滤网已经畅通，长柄挑杆收在背包里。');
      if(!f(g,'intakeClosed'))return say(g,[['希尔达','滤网被水顶住了，不能硬拉。'],['芙丽达','左下方手轮的连杆，通向滤网前面。先关进水闸。']]);
      return g.work(1250,'扶住滤网，分次取出落叶和水草',()=>{
        set(g,'filter');set(g,'poleTaken');g.take('pole',false);g.sound('wood');
        say(g,[['希尔达','里面还卡着一根检修挑杆。木柄很长，弯头也完整。'],['芙丽达','上到检修台，用它拨动最高的弯管。接好以后再开闸试水，看水实际走到哪里。']]);
      });
    }
    if(id==='prime'){
      if(f(g,'pump'))return g.toast('水泵正在稳定运行。所有接头都已锁紧。');
      if(!f(g,'filter'))return one(g,'芙丽达','先关进水闸，把滤网上的落叶清掉。');
      if(f(g,'intakeClosed'))return one(g,'芙丽达','水路接好了也得有水。先打开左下方的进水闸。');
      if(!Hydraulics.trace(g.s.valves,true).connected)return one(g,'芙丽达','水还没有到右上方出口。沿水流找第一处漏点，不必把接好的部分重来一遍。');
      return g.work(1500,'缓慢拉下试压柄，确认表针进入运行区',()=>{set(g,'pumpPrimed');pipeCheck(g);});
    }
    if(id.startsWith('pipe')){
      if(f(g,'pump'))return g.toast('已经加到工作压力。接头锁紧了，不能继续拆动。');
      const i=Number(id.slice(-1));
      if(i===0&&!f(g,'poleTaken'))return one(g,'希尔达','即使站在检修台上也够不到。滤网旁露出了一截长木柄，先去看看。');
      if(i===0&&!need(g,'pole',item,'站稳检修台，选中长柄挑杆，再拨动高处接头。'))return;
      return g.work(i===0?950:730,i===0?'站稳台阶，用挑杆拨动高处活节':'双手握住活节，旋转到下一个卡位',()=>{
        g.s.valves[i]=(g.s.valves[i]+1)%4;g.commit();g.sound('metal');
        if(Hydraulics.trace(g.s.valves,true).connected)g.toast(f(g,'intakeClosed')?'管路形状已经接通。打开进水闸，实际试水。':'水已到达出口。再拉试压柄，把机器慢慢唤醒。');
      });
    }
    if(id==='gauge')return one(g,'芙丽达',f(g,'pump')?'回流水压稳定了。但泄洪支路还在升压。这里的表，告诉不了我们整座山发生的事。':'检修牌上写着：关闸、清网、接管、开闸试压。低压试水能帮你找漏点；正式加压后接头会自动锁住。');
    if(id==='next')return advance(g,f(g,'pump'),5,'升降机还没有水力。让水到达出口，再缓缓试压。');
    if(id==='back')return g.go(3);wrong(g);
  },
  objective:s=>!s.f.filter?(s.f.intakeClosed?'清理滤网，收好露出的长柄挑杆。':'先关闭左下方进水闸，释放滤网压力。'):!s.f.pump?(s.f.intakeClosed?'连通管路，然后打开进水闸试水。':Hydraulics.trace(s.valves,true).connected?'水已到达出口，缓缓拉下试压柄。':'沿着水流找到漏点，旋转弯管。'):'水泵恢复了，但旧闸也被推开。赶往升降站。',
  hints:s=>[
    !s.f.filter?'左下方手轮连着滤网前的进水管。先把水关掉。':'先看水实际走到哪里。漏点前面已经接好的管段不用重转。',
    '清网会找到挑杆。站上检修台，用挑杆拨动最高的接头。开闸后可以边试水边调整。',
    '弯管从上到下、从左到右：左下、上右、左上。打开进水闸，再拉压力表下面的试压柄。'
  ]
}));

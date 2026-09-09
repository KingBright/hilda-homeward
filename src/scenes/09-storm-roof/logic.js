Homeward.define('scene/9/logic', ['story/helpers','content/setpieces'], ({checkBeacon,H,exit,f,say,one,set,need,book}, Stage) => {
  function aim(g,angle) {
    if(!f(g,'fridaSafe'))return one(g,'希尔达','先把朋友从危险的地方救出来。');
    if(f(g,'beacon'))return g.toast('光已经照到山脊。沃夫来了，先确认所有同伴都在。');
    g.work(750,'转动检修轮，让光轴对准山脊',()=>{g.s.beaconAngle=angle;g.commit();checkBeacon(g);},
      {kind:'turn',effect:'roofBeacon',target:Stage.roof.wheel,radius:27,from:g.s.beaconAngle,to:angle});
  }
  return {
    name:'风暴之上的约定',english:'NO ONE LEFT BEHIND',actLabel:'第四幕 · 别松开我的手',mood:'钟楼屋顶 / 谁都不能被留在风里',start:315,ground:Stage.roofGround,
    intro:[['大卫','我在这里！瓦片掉了，我过不去！'],['芙丽达','背包被横梁压住了。先固定绳子，不要跳过来！'],['希尔达','先稳住，再伸手。我们一个接一个来，谁都不会被留下。']],
    hotspots:s=>[H('anchor','把救援绳固定到近处铁环',426,652,83,115,{walkX:415}),
      H('david',!s.f.davidSafe?'把绳端送给大卫':!s.f.roofBrace?'请大卫稳住横梁支点':'与稳住支点的大卫交谈',!s.f.davidSafe?670:s.f.roofBrace?1069:466,!s.f.davidSafe?629:s.f.roofBrace?671:661,92,184,{walkX:!s.f.davidSafe?453:s.f.roofBrace?1003:421}),
      H('frida',s.f.fridaSafe?'和安全返回的芙丽达交谈':'和大卫配合，撬起压住芙丽达的横梁',s.f.fridaSafe?842:1160,s.f.fridaSafe?665:670,110,190,{walkX:s.f.fridaSafe?790:950}),
      H('beacon','转动低处检修轮，调整信标光轴',1220,657,90,105,{drag:'beacon',walkX:1169}),
      ...(!s.f.twigSafe?[H('twig','蹲下接住枝枝',929,696,106,72,{walkX:875})]:[]),
      exit('board','确认同伴齐全，一起登上沃夫',1395,644,{walkX:1326}),H('star','观察远处山脊的星标',1044,176,55,59,{walkX:1128})],
    act(g,id,item) {
      if(id==='anchor') {
        if(f(g,'roofAnchor'))return g.toast('锚点已经固定，绳头不会松开。现在把另一端送给大卫。');
        if(!need(g,'line',item,'先在背包选救援绳，再固定近处铁环。'))return;
        return g.work(1300,'绕过铁环，收紧绳结并检查锚点',()=>{g.consume('line');set(g,'roofAnchor');book(g,'rescue');g.sound('rope');g.toast('锚点固定好了。现在把绳端送给大卫。');});
      }
      if(id==='david') {
        if(!f(g,'roofAnchor'))return one(g,'大卫','别直接跳过来！先固定绳子！');
        if(!f(g,'davidSafe'))return g.work(2800,'送出绳端，扶住大卫返回稳固的屋面',()=>{set(g,'davidSafe');g.sound('rope');g.toast('大卫安全了。绳索已拉紧，可以沿着剩下的检修板通过缺口。');});
        if(f(g,'roofBrace'))return one(g,'大卫',f(g,'fridaSafe')?'大家都站稳了。快看，信标下面有检修轮！':'我守住这个支点。用长挑杆抬起横梁，芙丽达就能把背包拉出来。');
        return g.work(2400,'请大卫沿安全绳到横梁旁，稳住支点',()=>{set(g,'roofBrace');g.sound('wood');g.toast('大卫已稳住支点。现在用长挑杆帮助芙丽达。');});
      }
      if(id==='frida') {
        if(f(g,'fridaSafe'))return one(g,'芙丽达','沃夫会循光而来。转动信标下面的检修轮，让光照到左上方的山脊星标。');
        if(!f(g,'davidSafe'))return one(g,'希尔达','先救大卫，不能越过没有安全绳的缺口。');
        if(!f(g,'roofBrace'))return one(g,'希尔达','挑杆会滑。请大卫先稳住横梁的支点，我们再一起抬。');
        if(!need(g,'pole',item,'用长柄检修挑杆抬起横梁。大卫稳住支点，芙丽达抽出背包。'))return;
        return g.work(2400,'大卫稳住支点，希尔达抬梁，芙丽达脱困',()=>{set(g,'fridaSafe');g.sound('warm');g.toast('芙丽达安全了，挑杆也收回来了。让信标为我们找到归途。');});
      }
      if(id==='beacon')return aim(g,g.s.beaconAngle-21<-178?-45:g.s.beaconAngle-21);
      if(id==='twig') {
        if(!f(g,'davidSafe'))return one(g,'希尔达','枝枝，待在原地。我先把安全绳拉好。');
        return g.work(1000,'蹲下来，接住跃过瓦片的枝枝',()=>{set(g,'twigSafe');g.sound('warm');g.toast('枝枝也在这里了。一个都不能少。');});
      }
      if(id==='board') {
        if(!f(g,'beacon'))return one(g,'芙丽达','先用信标招来沃夫。转动下方检修轮，照向左上方星标。');
        if(!f(g,'twigSafe'))return one(g,'希尔达','等一下，枝枝还在屋面上！');
        if(!f(g,'davidSafe')||!f(g,'fridaSafe'))return one(g,'希尔达','先确认每个人都安全。');
        return say(g,[['大卫','阿尔弗在口袋里，枝枝也跟上来了。'],['芙丽达','希尔达，把手给我！'],['希尔达','大家都在。带我们去山脊吧！']],()=>g.work(2400,'彼此拉住手，一起登上沃夫',()=>{set(g,'roofDone');g.go(10);},{kind:'board',effect:'roofBoard'}));
      }
      if(id==='star')g.toast('星标在灯的左上方。低处检修轮旁的星形刻线，标出了相同方向。');
    },
    drag(g,id,p){if(id!=='beacon')return false;aim(g,Stage.wheelAngle(p));return true;},
    objective:s=>!s.f.roofAnchor?'先将救援绳固定到近处铁环。':!s.f.davidSafe?'把绳端送给大卫，扶他返回稳固屋面。':!s.f.roofBrace&&!s.f.fridaSafe?'请大卫到横梁旁稳住支点。':!s.f.fridaSafe?'用长挑杆和同伴协作，帮助芙丽达脱困。':!s.f.beacon?'转动低处检修轮，把信标照向山脊星标。':!s.f.twigSafe?'带上枝枝，谁也不落下。':'同伴齐全了，一起登上沃夫。',
    hints:s=>['先建立安全条件，再伸手帮助同伴。退回检查点不会撤销已完成的救援。','救回大卫后，再和他互动，请他稳住横梁支点；然后用长挑杆帮助芙丽达。','救援绳用于铁环 → 点大卫救回 → 再点大卫稳住支点 → 挑杆用于芙丽达 → 点低处检修轮三次 → 点枝枝 → 点沃夫。舒缓模式可关闭计时。']
  };
});

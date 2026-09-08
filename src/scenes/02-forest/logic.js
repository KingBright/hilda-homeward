Homeward.define('scene/2/logic', ['story/helpers'], ({H,I,exit,f,say,one,set,need,advance,book,wrong}) => ({
  name:'溪水逆流的森林',english:'THE STREAM RUNS BACKWARDS',actLabel:'第一幕 · 跟着回声走',
  mood:'最后一线暮色 / 有些事情，需要两个人一起完成',start:248,
  ground:(x,s)=>{if(s?.f?.bridge&&x>=500&&x<=1090){if(x<550)return 771+(x-500)/50*(706-771);if(x<=1040)return 706+Math.sin((x-550)/490*Math.PI)*20-(x-550)*.035;return 689+(x-1040)/50*(768-689);}return x<550?771:x>1090?768:771+Math.sin((x-550)/540*Math.PI)*22;},
  intro:[['希尔达','看那些落叶。钟声之后，它们竟然往上游漂了。'],['大卫','桥也断了。我们先站在结实的地方，好不好？'],['希尔达','好。先弄清楚绳子连着哪里，再动绞盘。']],
  hotspots:s=>[
    ...(!s.f.ropeTaken?[I('rope','检查并收起旧绳圈',331,725,72,65,{walkX:296})]:[]),
    ...(!s.f.hookTaken?[H('hook',s.f.branchBent?'取下树枝上的铁钩':'观察高处的铁钩',541,s.f.branchBent?642:496,75,95,{walkX:495})]:[]),
    ...(!s.f.bridge?[H('david',s.f.bridgeBrace?'大卫正稳住制动':'请大卫帮忙稳住制动',s.f.bridgeBrace?380:350,642,76,114,{walkX:440})]:[]),
    H('anchor','对岸的固定铁环',1095,556,85,122,{walkX:s.f.bridge?1042:516}),
    H('winch','转动桥边绞盘',481,651,107,116,{walkX:446}),
    H('stream','观察逆流的溪水',790,776,193,82,{walkX:s.f.bridge?774:492}),
    exit('next','沿根下的路标前进',1351,699,{walkX:1352}),exit('back','回北门',95,738,{walkX:157})
  ],
  act(g,id,item){
    if(id==='rope'){
      if(f(g,'ropeTaken'))return;
      return g.work(740,'蹲下来检查绳股，再收起绳圈',()=>{set(g,'ropeTaken');g.take('rope');});
    }
    if(id==='hook'){
      if(f(g,'hookTaken'))return;
      if(!f(g,'branchBent')){
        if(item!=='rope')return say(g,[['希尔达','铁钩缠在藤上。树枝很有弹性，不能直接爬上去。'],['大卫','地上的绳圈，或许能套住藤蔓，把它拉低。']]);
        return g.work(1100,'套住野藤，向后拉低树枝',()=>{set(g,'branchBent');g.sound('rope');say(g,[['希尔达','套住了。大卫，先帮我留住绳子。'],['大卫','拉住了，你去取铁钩。小心它会弹回去。']]);});
      }
      return g.work(680,'稳住树枝，解下铁钩',()=>{set(g,'hookTaken');set(g,'branchBent',false);g.sound('wood');g.take('hook');g.toast('铁钩取下了。旧绳圈也收回背包，可以重新打结。');});
    }
    if(id==='anchor'){
      if(f(g,'grappleSet'))return g.toast('铁钩已经扣住对岸的固定环。');
      if(!need(g,'grapple',item,'距离太远。绳子需要一只能够抓住铁环的钩。'))return;
      return g.work(1200,'试过绳结，对准铁环抛出飞钩',()=>{g.consume('grapple');set(g,'grappleSet');g.sound('rope');g.toast('铁钩扣住了。绞盘旁的铭牌写着：一人稳住，一人收绳。');});
    }
    if(id==='david'){
      if(!f(g,'grappleSet'))return one(g,'大卫','我看着绞盘。先把绳子固定在对岸，我们再一起使劲。');
      if(f(g,'bridgeBrace'))return one(g,'大卫','制动我稳住了。你转绞盘，我不会松手。');
      set(g,'bridgeBrace');g.sound('wood');return say(g,[['希尔达','你稳住旁边的制动，我来收绳。绳子绷紧了就告诉我。'],['大卫','明白。不是所有的勇敢，都得站在最前面。']]);
    }
    if(id==='winch'){
      if(f(g,'bridge'))return g.toast('桥板已经落在两岸石墩上，棘爪锁好了。');
      if(!f(g,'grappleSet'))return one(g,'希尔达','空转会把断桥拖进水里。先把绳子固定在对岸。');
      if(!f(g,'bridgeBrace'))return say(g,[['希尔达','一松手就往回走。转轮和制动，必须同时有人照看。'],['大卫','我可以帮忙。告诉我站在哪里。']]);
      return g.work(1850,'大卫稳住制动，希尔达慢慢收绳',()=>{set(g,'bridge');set(g,'bridgeBrace',false);g.sound('wood');say(g,[['大卫','两边都落稳了。棘爪也锁上了。'],['希尔达','我们把回去的路也修好了。一起过桥吧。']]);});
    }
    if(id==='stream'){book(g,'water');return one(g,'希尔达',f(g,'pump')?'现在落叶终于往山下漂了。不过旧闸的轰鸣还在。修好一条水路，不等于所有问题都结束了。':'不是风。钟声响起时，落叶就被抽向山里。上面一定有什么在拉着这条溪流。');}
    if(id==='next'){if(f(g,'bridge'))book(g,'water');return advance(g,f(g,'bridge'),3,'先固定断桥。我们要一起过去，也要能一起回来。');}
    if(id==='back')return g.go(1);wrong(g);
  },
  objective:s=>!s.f.hookTaken?(s.f.branchBent?'取下压低树枝上的铁钩。':'用绳圈把高处的铁钩取下来。'):!s.f.grappleSet?'组合带钩绳索，固定对岸铁环。':!s.f.bridge?(!s.f.bridgeBrace?'请大卫稳住制动，再转绞盘。':'大卫已稳住制动，转动绞盘拉起断桥。'):'一起过桥，沿路标寻找档案室。',
  hints:s=>[
    !s.f.hookTaken?'用地上的旧绳圈套住高处树藤，拉低后再取铁钩。':!s.f.grappleSet?'绳子负责连接，铁钩负责抓住。打开背包把它们组合。':'铭牌上的“一人稳住，一人收绳”，说的是两个人的分工。',
    '把带钩绳索放到对岸铁环。不要直接拉断桥。',
    '固定对岸后，点击大卫让他稳住制动，然后操作绞盘。'
  ]
}));

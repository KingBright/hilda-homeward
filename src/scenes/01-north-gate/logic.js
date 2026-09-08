Homeward.define('scene/1/logic', ['story/helpers'], ({H,I,exit,f,say,one,set,need,advance,wrong}) => ({
  name:'雨中的北门',english:'THE RAIN AT NORTH GATE',actLabel:'第一幕 · 跟着回声走',
  mood:'雨丝落下 / 修好的门，也要能安全地留在身后',start:375,ground:()=>793,
  intro:[['大卫','我只是来帮忙修门的。真的。'],['希尔达','当然。先把门修好，我们再决定走多远。'],['大卫','这句话听起来，比“顺便看看森林”可靠一点。']],
  hotspots:s=>[
    H('david','询问大卫',735,688,108,183),
    H('awning','向下拉绳，卷起雨棚',962,s.f.awning?677:601,72,114,{drag:'awning',walkX:931}),
    ...(s.f.awning&&!s.f.crankTaken?[I('crank','拿起黄铜曲柄',845,614,79,80,{walkX:806})]:[]),
    H('wheel',s.f.gateOpen?'检查锁定的棘爪':'转动城门转轮',1169,653,116,120,{walkX:1145}),
    exit('gate','穿过北门',1380,611),exit('back','回家',364,651,{walkX:448}),
    H('puddle','观察水洼中的倒影',953,824,234,60)
  ],
  act(g,id,item){
    if(id==='david')return one(g,'大卫',f(g,'gateOpen')?'看，三格都亮了，棘爪稳稳咬住齿轮了。我跟你一起去。':'曲柄在摊位上。先拉下右边的绳圈，把湿透的棚布卷起来。');
    if(id==='awning'){
      if(f(g,'awning'))return g.toast('雨棚已经卷好，绳子卡在止扣里。');
      return g.work(1150,'双手拉绳，把积着雨水的棚布卷起来',()=>{set(g,'awning');g.sound('rope');g.toast('棚布卷好了。曲柄就在摊位上。');});
    }
    if(id==='crank'){
      if(f(g,'crankTaken'))return;
      return g.work(620,'擦去雨水，拿起黄铜曲柄',()=>{set(g,'crankTaken');g.take('crank');});
    }
    if(id==='wheel'){
      if(f(g,'gateOpen'))return g.toast('棘爪已经落槽。城门不会滑下，曲柄也收好了。');
      if(!f(g,'crankMounted')){
        if(!need(g,'crank',item,'转轮中央是方形接口。把黄铜曲柄装进去。'))return;
        return g.work(700,'对准方榫，将曲柄装入转轮',()=>{set(g,'crankMounted');g.consume('crank');g.sound('metal');g.toast('接口咬合了。转动转轮，留意下面的三格刻度。');});
      }
      return g.work(1000,'压稳曲柄，转动转轮',()=>{
        const turns=Math.min(3,(g.s.f.gateTurns||0)+1);set(g,'gateTurns',turns);g.sound('metal');
        if(turns<3)return g.toast('城门又升起一截。还有 '+(3-turns)+' 格。');
        set(g,'gateOpen');g.take('crank',false);
        say(g,[['大卫','听到了吗？不是门响，是安全棘爪落槽了。'],['希尔达','很好。曲柄收起来。等我们回家时，这扇门还会好好地等着。']]);
      });
    }
    if(id==='gate')return advance(g,f(g,'gateOpen'),2,'铁栅栏还没升够。把三个刻度全部转亮，棘爪才能锁定。');
    if(id==='back')return g.go(0);
    if(id==='puddle')return g.sketch('city','雨里倒着一座城','灯光在水洼里摇晃，像有人把另一座城藏到了脚下。');
    wrong(g);
  },
  drag(g,id,p){if(id!=='awning'||p.dy<=55||f(g,'awning'))return false;this.act(g,id,null);return true;},
  objective:s=>!s.f.awning?'拉下绳圈，卷起摊位雨棚。':!s.f.crankTaken?'拿到雨棚下的黄铜曲柄。':!s.f.gateOpen?'装好曲柄，把三格刻度转亮。':'带着大卫走进森林。',
  hints:()=>['雨棚、曲柄和转轮，构成了一套小小的修缮顺序。','下拉右侧绳圈，卷好棚布。拿起曲柄，选中后点转轮。','装好曲柄后再操作转轮三次。刻度和门的高度会告诉你进度。']
}));

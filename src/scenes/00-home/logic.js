Homeward.define("scene/0/logic", ["story/helpers", "content/catalog"], ({checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'一封黄昏来信',english:'THE LETTER AT THE WINDOW',actLabel:'序章 · 灯还亮着',mood:'特洛尔堡 / 黄昏 / 茶壶刚刚烧开',start:660,ground:x=>775,chapter:['PROLOGUE','灯还亮着','出门之前，有人替你留了一盏灯。'],
intro:[['妈妈','茶快好了。今晚就别跑太远，好吗？'],['希尔达','我保证。除非……窗外真的有一只纸做的鸟。']],
hotspots:s=>[H('bird','查看窗边的纸鸟',1090,420,90,90,{walkX:1115}),H('mom','和妈妈说话',579,649,110,182),...(!s.f.lampTaken?[I('lamp','拿起小提灯',1292,454,68,99)]:[]),exit('leave','出门',189,488,{walkX:275}),H('teapot','闻一闻刚泡的茶',805,613,93,87),H('picture','看看墙上的山景',695,273,116,151)],
act(g,id,item){if(id==='bird'){if(f(g,'letter'))return one(g,'希尔达','北山的钟，还有那个不敢回家的孩子。阿尔弗需要我们。');set(g,'letter');book(g,'letter');say(g,[['希尔达','“希尔达：钟楼又响了。那个孩子还在森林里。”'],['阿尔弗','“我想它不是在闹事。它只是很害怕。北门见。阿尔弗。”'],['希尔达','枝枝，我们恐怕得把茶留到回来再喝了。']]);}else if(id==='lamp'){set(g,'lampTaken');g.take('lamp');}else if(id==='mom'){if(!f(g,'letter'))return one(g,'妈妈','先看看那只鸟吧。它敲窗户比你有耐心得多。');if(!f(g,'promise')){set(g,'promise');g.take('scarf',false);book(g,'promise');say(g,[['妈妈','围巾带上。找到朋友，然后一起回来。'],['希尔达','不落下任何一个。我保证。'],['妈妈','那我把茶壶留在炉子边。']]);}else one(g,'妈妈','灯、围巾、朋友。最重要的东西都带好了。');}else if(id==='leave'){advance(g,f(g,'letter')&&f(g,'promise')&&f(g,'lampTaken'),1,!f(g,'letter')?'纸鸟好像有话要说。':!f(g,'promise')?'先跟妈妈说一声。她不应该只能靠猜。':'山里天黑得早。带上门边的小提灯。');}else if(id==='teapot')one(g,'希尔达','肉桂和苹果。回来时应该还是这个味道。');else if(id==='picture')g.sketch('mountain','妈妈画的山','画里那条小路，最后总会回到有灯的窗前。');else wrong(g);},
objective:s=>!s.f.letter?'看看敲窗的纸鸟。':!s.f.promise?'把来信的事告诉妈妈。':!s.f.lampTaken?'拿上挂钩上的小提灯。':'从左边的家门出发。',
hints:s=>['先观察窗户、炉火和门边。','纸鸟带着求助信；妈妈会准备围巾，挂钩上有提灯。','点窗边纸鸟，再点妈妈，再拿右侧挂钩上的提灯，最后点最左边的门。']};
});

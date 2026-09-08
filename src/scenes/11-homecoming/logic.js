Homeward.define("scene/11/logic", ["story/helpers", "content/catalog"], ({maybeFinish,checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail}, {items,notes}) => {

return {
name:'茶还是温的',english:'THE TEA IS STILL WARM',actLabel:'尾声 · 所有人，平安归来',mood:'特洛尔堡 / 清晨 / 熟悉的肉桂与苹果',start:880,ground:x=>788,
intro:[['妈妈','你们回来了。'],['希尔达','我们回来了。每一个人。'],['妈妈','那就先坐下。故事可以慢慢讲，茶也可以慢慢喝。']],
hotspots:s=>[H('mom','拥抱妈妈',579,649,115,191),...[0,1,2].map(i=>H('tea'+i,['给大卫','给芙丽达','给自己'][i]+'倒一杯热茶',736+i*90,669-i%2*10,76,68,{walkX:766+i*55})),H('window','看看清晨的窗外',1070,344,283,304,{walkX:1064}),H('friends','问问朋友们',1072,670,106,193),H('journal','写下最后一页手记',1400,663,99,83,{walkX:1352})],
act(g,id,item){if(id==='mom'){if(!f(g,'hug')){set(g,'hug');say(g,[['希尔达','对不起，茶等得比我说的久了。'],['妈妈','我知道。我听见钟声变轻的时候，就知道是你们。'],['希尔达','我们没有把谁落下。'],['妈妈','那就好。欢迎回家。']],()=>maybeFinish(g));}else one(g,'妈妈','不用急着开始下一次冒险。今天，先好好待在家里。');}else if(id.startsWith('tea')){if(f(g,id))return g.toast('茶杯里升起温暖的白雾。');set(g,id);g.sound('warm');g.toast(['大卫双手捧住了杯子，终于不再发抖。','芙丽达把杯子放稳，笑着松了口气。','苹果、肉桂。和出门前一样。'][Number(id.slice(-1))]);maybeFinish(g);}else if(id==='window')g.sketch('return','同一扇窗','昨夜世界那么大。清晨，所有的路都回到了这扇窗。');else if(id==='friends')one(g,'芙丽达','下次探险，我们至少多带一卷绳子。大卫说，两卷。');else if(id==='journal'){if(f(g,'ended'))g.openEnding();else one(g,'希尔达','先给每个人倒好茶，再抱抱妈妈。这一页，要写“平安”。');}else wrong(g);},
objective:s=>s.f.ended?'留下来，听朋友把昨夜的故事慢慢讲完。':!s.f.hug?'给等了一夜的妈妈一个拥抱。':'给桌上的三只杯子倒好热茶。',
hints:s=>['现在不用赶路了。安全归来，也值得慢慢体验。','和妈妈说话，给桌上的三只杯子倒茶。','点妈妈，再点桌面从左到右的三只杯子。手记最后会记录每个人的平安。']
};
});

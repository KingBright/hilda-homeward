Homeward.define("scene/1/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function street(S){let f=S.f;let b=mountains(false)+skyline()+rect(0,550,1600,350,'#466b70');
b+=path('M0 73 148 45 277 82V707H0Z','#465f5e','#243f49',4)+path('M0 81 148 22 293 83 279 108 0 101Z','#29444c','#193844',3)+rect(0,113,279,557,'url(#brick)')+windowArt(54,168,99,150)+windowArt(56,391,98,125,false)+path('M230 109v477q0 32-27 32H184','none','#283f45',12);
b+=path('M263 237 396 203 602 254 599 730H267Z','#839388','#385956',4)+path('M243 242 399 169 622 244 610 266 263 259Z','#526a66','#244951',4)+rect(277,272,314,468,'url(#plaster)')+windowArt(317,310,79,128)+windowArt(443,309,101,129)+rect(362,537,139,199,'#284b52',70)+path('M385 738V609q52-104 92 0v129Z','#345b60','#678074',2);
b+=path('M582 334H1028V745H582Z','#677e72','#345853',4)+path('M559 334 602 210 1017 230 1062 355Z','#324e50','#1f424b',4)+rep(10,i=>path(`M${594+i*45} ${250+i%2*5}l-22 79`,'none','#799184',2,'opacity=".45"'))+rect(594,367,420,341,'url(#brick)')+windowArt(637,403,140,151)+windowArt(848,403,110,151,false);
b+=`<g id="awningFabric">`+group(808,561,1,`${path(f.awning?'M-195-66 155-66 171-27-202-27Z':'M-195-66 155-66 171 73-202 73Z','#b89e6b','#36534e',3)}${rep(7,i=>path(f.awning?`M${-191+i*54}-64l-4 35h26l-3-35Z`:`M${-191+i*54}-64l-9 136h27l5-136Z`,i%2?'#899e83':'#c4b080'))}${path(f.awning?'M-202-27q28 24 54 0t54 0 54 0 54 0 54 0 54 0 49 0':'M-202 73q28 24 54 0t54 0 54 0 54 0 54 0 54 0 49 0','none','#304f4a',3)}`)+`</g>`;
b+=path(`M962 388v${f.awning?278:204}`,'none','#b6a97b',5)+circle(962,398,16,'#4b6960','#c1b183',3)+`<g id="awningGrip">`+group(962,f.awning?693:620,1,path('M-10-22Q-25 10 0 11T10-22Z','none','#ccb887',5))+`</g>`;
b+=rect(664,627,240,122,'#4a5c4e',8)+rep(6,i=>rect(670+i*38,631,33,110,'#6d7760',3,'#3e5751',2))+ell(847,630,37,14,'#9da37e')+(!f.crankTaken&&f.awning?group(845,614,.8,itemArt('crank').replace(/<svg[^>]*>|<\/svg>/g,'')):'');
b+=path('M1064 84 1243 40 1574 70 1610 772H1033Z','url(#wall)','#23484e',4)+rect(1076,117,524,637,'url(#brick)')+path('M1215 778V459Q1222 295 1380 299 1526 301 1539 459V778Z','#254b55','#a2aa8a',17)+path('M1240 784V464Q1249 327 1381 327T1516 464V784Z','#152f40');
b+=`<g clip-path="url(#northGateArch)"><g id="gateBars" transform="translate(0 ${-Math.min(3,f.gateTurns||0)*335/3})">${rep(9,i=>path(`M${1254+i*30} 336V799`,'none','#496c68',10))}${path('M1245 452h268M1245 605h268M1245 744h268','none','#557871',10)}</g></g>`;
b+=`<g id="gateRotor">`+wheel(1169,653,55,(f.gateTurns||0)*65)+(!f.crankMounted?circle(1169,653,13,'#203f47'):path('M1169 653h38v-25','none','#dec493',8))+`</g>`;
b+=rect(1111,185,167,66,'#2b4d51',4,'#7f9580',3)+text(1195,212,'特 洛 尔 堡',14,'#cfccb0')+text(1195,236,'北　门',10,'#bac4b1');
b+=path('M100 70Q544 201 1146 139T1620 201','none','#263e47',3)+rep(8,i=>lamp(217+i*169,126+Math.sin(i*.56)*25,.32,true));
b+=ground(776,'#597975')+rep(95,()=>{let x=rnd()*1600,y=782+rnd()*130;return path(`M${x} ${y}q17-8 35 0v10h-32Z`,'none','#213f4926',2);})+ell(926,825,196,22,'#749991')+ell(251,828,109,15,'#73988d')+waterLines(842,12)+person('大卫',735,775,1.34)+lamp(1110,379,.7,true);
b+=fern(43,871,1.8,'#294c4a')+grass(1521,813,1.4,'#254c4d')+particles(18);return b;}

return street;
});

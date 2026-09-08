Homeward.define("scene/6/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function glen(S){let f=S.f;let b=mountains(true)+rep(11,i=>pine(i*157,688+rnd()*35,.7+rnd()*.5,i%2?'#305f60':'#234e57'));
b+=path('M-20 793Q-33 500 136 385 331 302 472 345 579 180 727 172 925 150 1012 327 1251 389 1374 753Z','#4d7467','#264e4c',5)+path('M-14 718 186 477 386 445 532 289 736 224 909 367 1047 405 1163 643Z','#6d8b76')+path('M351 410 476 345 579 180 727 172 854 199 778 256 670 237 594 337 467 452Z','#829777')+path('M888 367Q1091 301 1339 528L1501 755H926Z','#325957','#21494b',5)+path('M1077 745Q1038 464 1200 450 1358 440 1392 749Z','#133946');
b+=path('M274 492q87 19 147-8m288-97q55 45 120 15','none','#345b58',9)+path('M376 467q-37 40 20 89m320-202q-28 25 16 63','none','#466e62',6)+path('M642 403 596 519 692 510Z','#638471','#395f57',4)+path('M457 580q133 62 277-6','none','#335952',7);
b+=ground(763,'#698571')+tree(84,812,1.35,'#234c47')+pine(1483,832,1.73,'#21474b')+fern(1440,833,2.2,'#315e4f')+mushrooms(176,792,1.1)+rock(1214,786,1.5,'#66856e');
b+=group(610,375,1,`${path('M-87-57 93-69 113 93-83 108-114 25Z','#7c967b','#486a58',3)}${path('M-63-20q16-19 32 0t32 0m-31 51 14-26 14 26h-28m35 29q18-20 38 0m-98 27q17-16 35 0','none','#c7c49b',4)}${text(0,-36,'轻声 · 再轻声',13,'#d2cb9e')}`);
b+=troll(956,750,1.35)+(!f.calm?group(956,750,1.35,`${path('M-54-20Q-70-45-52-91L-37-88-36-60-28-26M53-21Q73-47 51-90L35-88 36-58 29-25Z','#96a58b','#345c57',3)}${path('M-11-39q12-8 24 0','none','#365c56',2)}`):'')+person('芙丽达',1149,779,1.38)+person('大卫',326,776,1.34)+person('阿尔弗',1039,755,.75);
b+=rock(782,718,.47,'#788e70')+(f.shadePlaced?lamp(782,681,.68,true)+path('M767 656H797L801 674H763Z','#bea771'):circle(782,678,14,'#3f6253'));
b+=rep(3,i=>group(468+i*118,722-i%2*22,1,`${path('M-41 20-51-25Q-50-93-1-92T47-24L42 20Z','#7c9580','#375f59',3)}${path('M-29-62Q0-81 29-62','none','#b7c09a',2)}${circle(0,-29,19,'#547d70','#b5bd96',2)}${i===0?path('M-12-26q6-8 12 0t12 0','none','#dae0b2',2):i===1?path('M0-45-13-22H13ZM0-22v8','none','#dae0b2',2):path('M6-45Q-17-24 7-13Q-14-12-13-28T6-45Z','#dae0b2')}`,'id="tone'+i+'"'));
b+=fern(330,873,1.5,'#365e4f')+fern(47,926,2.5,'#204e48')+rect(0,598,1600,250,'url(#fog)')+particles(54,'firefly');return b;}

return glen;
});

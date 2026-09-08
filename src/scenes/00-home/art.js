Homeward.define("scene/0/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function home(S,ending=false){let f=S.f;let b=rect(0,0,1600,900,'url(#warmWall)')+rect(0,0,1600,740,'url(#plaster)');
b+=path('M0 0H1600V77L0 89Z','#2b4245')+rep(6,i=>path(`M${i*295-12} 0l-5 740h20l12-740Z`,'#354c4b'));
b+=rect(860,155,378,370,'#30484a',120)+rect(879,174,340,336,ending?'url(#dawn)':'url(#skyD)',100)+path('M880 442 944 316 1032 390 1115 284 1219 395V511H880Z',ending?'#a3afa0':'#466e76')+pine(969,529,.34,'#355d62')+pine(1165,536,.42,'#305a5e');
b+=path('M1048 164V516M875 331H1223','none','#384f4b',11)+path('M861 153q35 165-16 374l64-8q52-173-5-369Z','#9b735c','#3d4d48',3)+path('M1217 152q-21 170 24 371l-63-9q-44-173 0-364Z','#9b735c','#3d4d48',3)+rect(848,517,400,21,'#344a49',5);
b+=path('M889 339 1217 337 1595 821 640 824Z','#f0d399','none',0,'opacity=".08"');
b+=ground(750,'#675e4d')+rep(14,i=>path(`M${i*140-260} 910 800 741`,'none','#283e3f',2,'opacity=".24"'))+rep(4,i=>path(`M0 ${775+i*i*12}H1600`,'none','#293f3e',2,'opacity=".23"'));
b+=rect(80,246,220,501,'#293e41',15)+rect(99,267,182,456,'#60766d',9)+rect(118,289,144,391,'#7c8873',3)+path('M189 290V680','none','#4d6259',4)+circle(246,509,7,'#d0b17b');
b+=rect(356,516,220,37,'#3d4b45',5)+rect(376,551,27,178,'#4a5149',2)+rect(536,551,27,178,'#4a5149',2)+rect(382,381,161,137,'#344b48',10)+rect(395,393,134,113,'#bb9e71',4)+rect(406,404,114,92,'#152f3a',14)+circle(465,473,100,'url(#glow)')+path('M422 497q-23-37 7-51-3 27 18 20 1-46 25-64-14 41 17 45 16-26 27-14 10 48-11 64Z','#d68e55')+path('M445 495q-20-23 0-30 5 18 17-6 19 16 9 37Z','#f2c374');
b+=path('M413 384V63h94v321','#435752','#2d4645',3)+rect(397,363,127,25,'#4c6259',4);
b+=rect(52,156,557,16,'#4a5c52',4)+rep(13,i=>rect(75+i*31,110-rnd()*25,20,46+rnd()*22,['#71867a','#bb946c','#71959a'][i%3],2,'#36514c',1));
b+=rect(629,185,132,181,'#364e4c',3)+rect(640,196,110,159,'#c0bd95',2)+path('M650 309 672 259 697 287 728 229 743 306Z','#678979')+circle(709,225,17,'#e5d5a6');
b+=path('M1260 354q30-9 64 0m-32-9V490','none','#344b4b',6)+(!f.lampTaken&&!ending?lamp(1292,485,1.1,true):'')+(!ending?path('M1320 375v78q22 19 45-8v-70Z','#c59556','#3f5651',2):'');
b+=path('M1354 520q0-84 92-84t105 87v223h-216Z','#536c66','#2c4548',3)+rect(1372,558,147,148,'#8a9275',25)+path('M1375 610H1513','none','#afb294',2)+path('M1330 716h220l-13 25h-199Z','#364d4c');
b+=ell(835,784,284,58,'#3d5752')+ell(835,784,263,49,'#9b8e68')+rep(5,i=>`<ellipse cx="835" cy="784" rx="${245-i*22}" ry="${45-i*4}" fill="none" stroke="#ccc095" stroke-width="1.5" opacity=".25"/>`);
b+=path('M709 667 711 790h16l18-123m170 0 23 123h15l-12-123','#655d49','#344b47',3)+ell(824,650,158,48,'#a9956c')+ell(824,641,159,44,'#c0ac7e')+path('M680 640q109 32 251-1','none','#e6c795',2)+lamp(948,628,.65,ending);
b+=group(807,613,1,`${ell(0,12,29,6,'#687a67')}${path('M-22-11q-9-25 18-28h21q19 12 5 49h-43Z','#739b97','#355952',2)}${path('M21-27q31-11 22 11L25-7M-18-25l-19-9 12 22','none','#789b91',6)}${path('M-12-39q8-9 23 0','none','#334e4d',4)}<g class="steam">${path('M-7-45q-10-14 0-23t0-25M11-40q10-14 0-25','none','#eee5c2',2,'opacity=".4"')}</g>`);
b+=person('妈妈',579,740,1.90)+(ending?person('大卫',680,747,1.34)+person('芙丽达',1080,761,1.38)+person('阿尔弗',936,636,.72):(!f.letter?bird(1090,420,1.25):paper(1151,510,.7)));
if(ending)b+=group(1400,663,1,`${path('M-45-29Q-20-42 0-25 21-41 45-28L40 34Q17 20 0 37-17 21-41 34Z','#ddcba2','#536a62',3)}${path('M0-25V37m-32-48 20 2m-20 10 20 2m-19 10 19 2m22-21 20-3m-20 15 20-3m-20 15 18-3','none','#8b9579',2)}`);
if(ending)b+=rep(3,i=>group(736+i*90,660-i%2*10,1,`${ell(0,0,17,6,f['tea'+i]?'#cdbf8f':'#687d6e')}${path('M-17 0q0 29 16 27t18-27Z','#d3c7a6','#5a7166',2)}${path('M18 3q22 0 10 15H18','none','#d3c7a6',5)}`));
b+=fern(37,866,2.2,'#254c4b')+fern(1564,836,2.8,'#264f4e')+particles(25);return b;}

return home;
});

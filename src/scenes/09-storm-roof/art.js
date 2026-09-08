Homeward.define("scene/9/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function roof(S){let f=S.f;let b=mountains(true)+rect(0,0,1600,900,'#142b481f')+skyline()+path('M-12 729 230 540 469 715 1524 640 1620 737V920H-12Z','#415f67','#173c4a',5);
b+=path('M-50 713 222 535 467 695 584 930H-50Z','#466a6e','#163d49',5)+rep(16,i=>path(`M-44 ${661+i*23}q215-9 499 30`,'none','#9aa893',2,'opacity=".42"'))+rep(13,i=>path(`M${-42+i*43} 852 220 535`,'none','#284c57',3));
b+=path('M761 722 965 510 1251 551 1620 736V930H762Z','#385b62','#183e49',5)+rep(13,i=>path(`M${776+i*66} 904 981 522`,'none','#234955',3))+rep(11,i=>path(`M790 ${710+i*20}q364-27 814 30`,'none','#72958b',2,'opacity=".35"'));
b+=path('M492 727 738 700 759 920H523Z','#122f40')+path('M480 735h53l-9 93-40 26m253-151 25 106-10 63 26 22','none','#6d8379',8)+path('M516 741q102 11 224-42','none','#657d78',3);
b+=path('M198 736H467M737 725H1427','none','#b1b698',19)+path('M195 752H470M741 741H1467','none','#263f48',8);
b+=path('M1232 651V394h117v257','#536f69','#254c4f',5)+path('M1194 400 1289 307 1384 400Z','#324e59','#193d4b',4)+rect(1244,429,96,139,'#243f4c',47)+circle(1292,490,70,'#4e726b','#b2b38b',6)+circle(1292,490,48,f.beacon?'#f3de9b':'#648b83','#254c4e',4);
let a=(S.beaconAngle??-65)*Math.PI/180;const ex=1292+700*Math.cos(a),ey=490+700*Math.sin(a);if(f.fridaSafe)b+=path(`M1284 474 ${ex} ${ey-140} ${ex} ${ey+140} 1284 506Z`,'url(#beam)')+circle(1292,490,165,'url(#glow)');
b+=path(`M1292 490 ${1292+71*Math.cos(a)} ${490+71*Math.sin(a)}`,'none','#e6c995',7)+circle(1292+71*Math.cos(a),490+71*Math.sin(a),10,'#d8b781','#3f5f52',3)+text(1292,605,'朝向山脊的星标',12,'#d0d1a9');
b+=path('M412 717V646q15-21 28 0','none','#abb89b',11)+(f.roofAnchor?path(f.davidSafe?'M418 652q164-52 331 40':'M418 652q70-58 117-3','none','#ddc390',5):'');
b+=f.davidSafe?person('大卫',824,728,1.34):group(670,710,1,`<g transform="rotate(-13)">${person('大卫',0,0,1.34)}</g>`);
b+=person('芙丽达',1045,739,1.38)+(!f.fridaSafe?path('M968 598 1140 693 1107 729 944 629Z','#857958','#284c4b',4)+path('M960 621 1124 710','none','#c9b783',2):path('M1079 649 1176 689 1165 710 1067 670Z','#857958','#284c4b',4));
b+=f.fridaSafe?path('M1026 730 1048 660 1062 732Z','#a5aa84','#375e52',3):'';
b+=!f.twigSafe?twig(929,723,.95):'';
if(f.beacon)b+=woff(1395,651,1.52)+path('M1288 641q50-26 87-17','none','#dbcb9c',3);
b+=circle(1044,176,10,'#efdab0')+path('M1044 161v30m-15-15h30','none','#efdab0',1.5)+path('M152 564 207 401 264 426 273 584Z','#32545c','#173e4b',4)+lamp(211,479,.52,true)+rect(0,682,1600,243,'url(#fog)')+particles(12);return b;}

return roof;
});

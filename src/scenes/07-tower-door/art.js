Homeward.define("scene/7/art", ["content/mechanisms", "art/kit", "art/characters", "art/props"], (Mechanisms, {P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function gate(S){let f=S.f;let b=mountains(true)+path('M832 55 1611 84V900H778Z','#43676a','#244b54',6)+rect(828,81,772,744,'url(#brick)');
b+=path('M1137 829V286Q1188 116 1391 150 1552 158 1568 321V829Z','#1c424e','#8b9f87',17)+path('M1168 828V303q32-126 191-126t178 126v525Z','#152f3f');
b+=`<g transform="translate(0 ${f.towerGate?-472:0})">${path('M1177 810V312q20-126 182-127t167 129v496Z','#526f67','#254c4d',4)}${rep(10,i=>path(`M${1190+i*34} 193v620`,'none','#354f4d',8))}${path('M1179 353H1535M1179 626H1535','none','#96a285',15)}${circle(1348,447,84,'none','#aab18e',6)}${path('M1348 365v164m-82-82h164','none','#aab18e',4)}</g>`;
b+=path('M918 657V108L1036 71 1102 99V673Z','#5b7c73','#274e51',5)+rect(927,121,166,530,'url(#brick)')+path('M900 100 1011 9 1125 91 1113 127H906Z','#2e5058','#203f4c',5)+windowArt(973,165,65,130,true);
b+=path('M-20 815 570 769 832 657H1189L1545 774V938H-20Z','#42665e','#2b514d',3)+path('M-10 825 722 775 921 708H1196L1464 814','none','#a0a688',5)+path('M722 775v29l210-58h267l266 90M916 709v31m99-32 3 31m98-30 9 31','none','#1c4449',3);
b+=pine(90,838,1.75,'#21454e')+pine(393,779,1.35,'#2b575a')+pine(635,733,1.1,'#2c5a5c')+rock(367,813,1.4,'#637f6d')+mushrooms(446,835,1.1);
b+=path('M914 593 1173 315 1263 362 1060 650Z','#496b62','#88a187',4)+Mechanisms.gears.map(({x,y,radius:r,item:k})=>f[k+'Set']?gear(x,y,r,r===35?10:r===50?12:14,'url(#bronze)',(f.gearIndex||0)*90*(k==='gearM'?1:k==='gearS'?-1.2:-.857),!!f.towerGate):circle(x,y,r,'none','#b9bb9255',3)+circle(x,y,8,'#1d4448','#a3b499',3)).join('');
b+=[['gearS',453,765,35,10],['gearM',612,771,50,12],['gearL',795,763,68,14]].map(([id,x,y,r,n])=>f[id+'Taken']?'':gear(x,y,r,n)).join('');
b+=group(1370,684,1,`${rect(-17,-76,34,98,'#2b5354',6,'#adb18c',3)}${path(f.towerGate?'M0-26 37-10':'M0-26-12-91','none','#acb8a1',9)}${circle(f.towerGate?37:-12,f.towerGate?-10:-91,12,'#d7bf89','#3c5d55',3)}`);
b+=lamp(1165,286,.9,true)+lamp(1536,321,.82,true)+fern(31,923,2.6,'#204c48')+fern(1559,883,1.9,'#234b49')+person('芙丽达',790,805,1.38)+particles(34);return b;}

return gate;
});

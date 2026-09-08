Homeward.define("scene/4/art", ["content/walkways", "engine/hydraulics", "art/kit", "art/characters", "art/props"], (Walkways, Hydraulics, {P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function pump(S){let f=S.f,vs=S.valves||[0,1,0];let b=rect(0,0,1600,900,'url(#cave)')+rect(95,90,1403,663,'url(#wall)',35)+rect(95,90,1403,663,'url(#brick)',35)+path('M-10 801V161Q801-115 1613 169V802','none','#24474b',72)+path('M44 773V204Q800-69 1555 209V777','none','#778e7c',7);
b+=rep(5,i=>group(i*325,260,1,`${path('M-28 541V45Q0-8 31 40V541Z','#3f645e','#244a4c',5)}${rect(-37,515,79,33,'#526d60',4)}`));
b+=path('M-20 782q438-78 699 15t988-13V910H-20Z','url(#river)')+waterLines(796,45);
b+=path('M226 192V399H453V640H546V400H640V570H940V304h337V148','none','#213f46',43)+path('M226 192V399H453V640H546V400H640V570H940V304h337V148','none','#647e73',29)+path('M226 192V399H453V640H546V400H640V570H940V304h337V148','none','#b4b58c',3,'opacity=".7"');
b+=group(453,640,1,`${rect(-50,-68,100,133,'#294b4e',15,'#8a9f85',5)}${rep(5,i=>path(`M${-30+i*15}-54v107`,'none','#9aa88a',4))}${!f.filter?`<g id="filterLeaves">`+rep(12,i=>group(-34+rnd()*66,-44+rnd()*75,.43+rnd()*.4,path('M0 0q-40-25-8-39 35 0 8 39Z',i%2?'#d1b172':'#8d9a69','#476450',2)))+`</g>`:''}${!f.poleTaken?path('M-30 38 34-44','none','#c8b17e',5)+circle(34,-44,4,'#ba8c56'):''}${path('M-60-80H60M-60 78H60','none','#486961',8)}`);
b+=group(1128,496,1,`${rect(-84,-110,168,203,'#415f57',17,'#a2ab83',4)}${circle(0,-28,57,'#d2c59b','#274e4b',7)}${rep(9,i=>path(`M${Math.sin((i-4)*.3)*41} ${-28-Math.cos((i-4)*.3)*41}l${Math.sin((i-4)*.3)*8} ${-Math.cos((i-4)*.3)*8}`,'none','#526e59',2))}${path(`M0-28 ${Math.sin((f.pump?1.1:-1))*42} ${-28-Math.cos(f.pump?1.1:-1)*42}`,'none','#a2674c',4,'id="pressureNeedle"')}${circle(0,-28,7,'#33564f')}${text(0,66,f.pump?'回　流':'旁　路',14,'#cdd0a9')}`);
const pts=[[640,400],[640,570],[940,570]],network=Hydraulics.trace(vs,!!f.filter&&!f.intakeClosed);
let flow=f.filter&&!f.intakeClosed?'M226 192V399H453V640H546V400H587':'';
pts.forEach(([x,y],i)=>{
 b+=circle(x,y,53,'#254b50','#a0aa88',4)+circle(x,y,45,'#3c6863');
 b+=group(x,y,1,`<g data-pipe-rotor="${i}" transform="rotate(${vs[i]*90})">${path('M0-42V0H42','none','#1b4148',25)}${path('M0-42V0H42','none','#a0b5a0',14)}${path('M0-42V0H42','none','#d8d3a6',2)}${circle(0,0,7,'#d4c393','#355d53',2)}</g>`);
 if(network.wet.includes(i)){
  b+=group(x,y,1,`<g data-pipe-rotor="${i}" transform="rotate(${vs[i]*90})">${path('M0-40V0H40','none','#b5ead4',4,'stroke-dasharray="10 6" class="flowline"')}</g>`);
  if(i===0&&network.wet.includes(1))flow+='M640 443V527';
  if(i===1&&network.wet.includes(2))flow+='M683 570H897';
  if(i===2&&network.connected)flow+='M940 527V304H1277V148';
 }
});
for(const leak of network.leaks){const [x,y]=pts[leak.node],offset={N:[0,-42],E:[42,0],S:[0,42],W:[-42,0]}[leak.port];
 b+=path(`M${x+offset[0]} ${y+offset[1]}q-14 24 0 53`,'none','#b4dcca',3,'class="twinkle"')+ell(x+offset[0],y+offset[1]+55,15,4,'#9cc2b255');}
if(flow)b+=path(flow,'none','#b5ead4',5,'opacity=".75" stroke-dasharray="13 7" class="flowline"');
b+=text(748,220,'让水回到山里，而不是城里。',17,'#c0c4a1')+path('M472 265h477','none','#b1b18c',1,'opacity=".5"')+lamp(308,316,.75,true)+lamp(1393,301,.75,true)+gear(167,515,125,18,'#596e58',0,!!f.pump)+path('M1386 741V475q3-80 88-79 91 0 91 79v266Z','#142e3a','#789a86',10);
b+=`<g id="serviceWalkway">`+path(Walkways.waterworksPath(8),'none','#263e43',16)+path(Walkways.waterworksPath(2),'none','#9cac91',7)+rep(8,i=>path(`M${523+i*12} ${790-i*9}h22m${482+570+i*12} ${728+i*9}h22`,'none','#526c60',5))+rep(14,i=>path(`M${626+i*26} 725v10`,'none','#2a4849',3))+path('M625 729v95m120-95v91m130-91v88m106-88v101','none','#49665a',12)+`</g>`;
b+=fern(60,873,1.7,'#285851')+mushrooms(1344,788,.9)+rect(0,590,1600,265,'url(#fog)')+particles(25);return b;}

return pump;
});

Homeward.define("scene/8/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,sceneText:text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function heart(S){let f=S.f;let b=rect(0,0,1600,900,'url(#cave)')+rect(90,36,1430,780,'#486a65',20)+rect(90,36,1430,780,'url(#brick)',20)+path('M145 830V190Q250-2 802 0 1380-11 1496 181V831','none','#25484b',61)+path('M180 810V200Q300 27 802 34T1462 209V810','none','#80927b',8);
b+=rep(3,i=>windowArt(255+i*477,90,102,246,false))+path('M327 115 615 786H946L354 105Z','#dbe5bf','none',0,'opacity=".035"')+path('M790 95 1122 808H1337L815 94Z','#dbe5bf','none',0,'opacity=".045"');
b+=path('M162 831V481H450V206h293M1170 236h231v539H964V625','none','#183c44',48)+path('M162 831V481H450V206h293M1170 236h231v539H964V625','none','#859578',30)+path('M162 831V481H450V206h293M1170 236h231v539H964V625','none','#b9b68a',3);
b+=gear(594,250,107,16,'#60745b',0,!!f.heart)+gear(1063,273,154,20,'#6f8063',0,!!f.heart)+gear(1415,430,107,14,'#546d57',0,!!f.heart)+path('M504 22V170M1251 7v222','none','#2e4a49',11)+bell(838,450,1.64,!!f.damped);
b+=path('M838 55V-25M749 243V42h186v201','none','#324d4b',19)+path('M749 64h186','none','#a5a985',4);
b+=path('M0 803q216-65 398 3t444-15 760 10V934H0Z','url(#river)')+waterLines(813,33)+ground(802,'#425f51')+path('M48 792H1512M45 829H1516','none','#87977c',8)+rep(20,i=>path(`M${64+i*77} 792v38`,'none','#223e3f',5));
b+=path('M440 536V650','none','#87967b',10)+group(440,650,1,`${rect(-55,-83,110,160,'#426c61',12,'#b5b68b',4)}<g id="clockBypassWheel">${wheel(0,0,50,(f.bypassTurns||0)*58)}${f.bypassMounted&&!f.bypass?path('M0 0h34v-22','none','#dec493',7):''}</g>${text(0,109,'旁路 · 先泄压',13,'#ccd0a3')}`);
b+=path('M662 482V650','none','#819578',12)+`<g id="clockDriveWheel" transform="rotate(${f.heart?180:0} 662 650)">${gear(662,650,72,14,'url(#bronze)',(f.drive||0)*2,!!f.heart)}${path('M662 650h34v-28','none','#e0c491',9)}${f.heart?path('M662 650v-22m-7-10v10h14v-10','none','#d8e4be',3.5):''}</g>`+text(662,750,'排洪飞轮',13,'#c4c99c');
b+=`<g id="clockAccess" pointer-events="none">`+path('M765 833V600h45v233M754 617H889v13H754Z','#526b5b','#a8b18b',4)+rep(8,i=>path(`M765 ${625+i*27}h45`,'none','#c5b98c',5))+path('M834 630v201m47-201v200','none','#304d44',9)+text(822,581,'检修踏台',11,'#d4c69a')+`</g>`;
b+=group(1211,610,1,`${rect(-33,-12,66,99,'#385c51',8,'#a2ad81',3)}${path(f.fridaHold?'M0 24 44 3':'M0 24-15-81','none','#95ac94',9)}${circle(f.fridaHold?44:-15,f.fridaHold?3:-81,13,'#d8bd85','#416453',3)}${f.fridaHold?circle(40,5,5.5,'#c68960','#2c4a4c',1.5):''}${text(0,120,'保持旁路',12,'#c9c59b')}`);
b+=group(1016,641,1,`${rect(-25,-50,50,100,'#577760',5,'#a6b089',3)}${path(f.davidHold?'M-25 0H29':'M0-43V47','none','#cfc69a',9)}${circle(0,0,9,'#2e5850')}${f.davidHold?circle(26,0,5.5,'#efc8a1','#2c4a4c',1.5):''}`);
b+=person('芙丽达',1272,778,1.38)+person('大卫',1082,780,1.34);
b+=!f.feltTaken?`<g id="clockFelt">${group(553,768,.88,itemArt('felt').replace(/<svg[^>]*>|<\/svg>/g,''))}</g>`:'';
b+=group(303,681,1,`${rect(-80,-57,160,109,'#c9bb91',4,'#496856',4)}${path('M-62 27V-25h40v52H20V-9h43','none','#608471',3)}${text(0,-39,'水 → 旁路 → 钟',12,'#486955')}`);
b+=group(965,525,1,`${circle(0,0,40,'#c7c19b','#335b4d',7)}${path('M0 0-25-24','none','#9b5e42',4,`id="clockGaugeNeedle" transform="rotate(${Math.min(1,(f.bypass?2:f.bypassTurns||0)/2)*90})"`)}${circle(0,0,5,'#335b4d')}${text(0,68,f.bypass?'压力稳定':'洪水压力',10,'#cbd0aa')}`);
b+=lamp(167,529,.79,true)+lamp(1470,650,.67,true)+path('M1420 771V681l23-171 51-72 61 89v244Z','#254b49','#7d9879',4)+path('M1470 755V541l28-48 26 57v205Z','#133440')+rect(0,620,1600,250,'url(#fog)')+particles(40);return b;}

return heart;
});

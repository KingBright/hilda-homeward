Homeward.define("scene/8/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function heart(S){let f=S.f;let b=rect(0,0,1600,900,'url(#cave)')+rect(90,36,1430,780,'#486a65',20)+rect(90,36,1430,780,'url(#brick)',20)+path('M145 830V190Q250-2 802 0 1380-11 1496 181V831','none','#25484b',61)+path('M180 810V200Q300 27 802 34T1462 209V810','none','#80927b',8);
b+=rep(3,i=>windowArt(255+i*477,90,102,246,false))+path('M327 115 615 786H946L354 105Z','#dbe5bf','none',0,'opacity=".035"')+path('M790 95 1122 808H1337L815 94Z','#dbe5bf','none',0,'opacity=".045"');
b+=path('M162 831V481H450V206h293M1170 236h231v539H964V625','none','#183c44',48)+path('M162 831V481H450V206h293M1170 236h231v539H964V625','none','#859578',30)+path('M162 831V481H450V206h293M1170 236h231v539H964V625','none','#b9b68a',3);
b+=gear(594,250,107,16,'#60745b',0,!f.heart)+gear(1063,273,154,20,'#6f8063',0,!f.heart)+gear(1415,430,107,14,'#546d57',0,!f.heart)+path('M504 22V170M1251 7v222','none','#2e4a49',11)+bell(838,450,1.64,!!f.damped);
b+=path('M838 55V-25M749 243V42h186v201','none','#324d4b',19)+path('M749 64h186','none','#a5a985',4);
b+=path('M0 803q216-65 398 3t444-15 760 10V934H0Z','url(#river)')+waterLines(813,33)+ground(802,'#425f51')+path('M48 792H1512M45 829H1516','none','#87977c',8)+rep(20,i=>path(`M${64+i*77} 792v38`,'none','#223e3f',5));
b+=group(440,556,1,`${rect(-55,-83,110,160,'#426c61',12,'#b5b68b',4)}${wheel(0,0,50,(f.bypassTurns||0)*58)}${text(0,109,'旁路 · 先泄压',13,'#ccd0a3')}`);
b+=gear(662,566,83,14,'url(#bronze)',(f.drive||0)*2,!!f.heart)+path('M662 566h34v-28','none','#e0c491',9)+text(662,684,'排洪飞轮',13,'#c4c99c');
b+=group(1211,610,1,`${rect(-33,-12,66,99,'#385c51',8,'#a2ad81',3)}${path(f.fridaHold?'M0 24 44 3':'M0 24-15-81','none','#95ac94',9)}${circle(f.fridaHold?44:-15,f.fridaHold?3:-81,13,'#d8bd85','#416453',3)}${text(0,120,'保持旁路',12,'#c9c59b')}`)+person('芙丽达',1272,778,1.38)+person('大卫',1070,780,1.34);
b+=group(1016,641,1,`${rect(-25,-50,50,100,'#577760',5,'#a6b089',3)}${path(f.davidHold?'M-25 0H29':'M0-43V47','none','#cfc69a',9)}${circle(0,0,9,'#2e5850')}`);
b+=!f.feltTaken?group(553,768,.88,itemArt('felt').replace(/<svg[^>]*>|<\/svg>/g,'')):'';
b+=group(303,681,1,`${rect(-80,-57,160,109,'#c9bb91',4,'#496856',4)}${path('M-62 27V-25h40v52H20V-9h43','none','#608471',3)}${text(0,-39,'水 → 旁路 → 钟',12,'#486955')}`);
b+=group(965,525,1,`${circle(0,0,40,'#c7c19b','#335b4d',7)}${path(`M0 0 ${f.damped&&!f.bypass?-29:f.bypass?23:-25} -24`,'none','#9b5e42',4)}${text(0,68,f.bypass?'压力稳定':'洪水压力',10,'#cbd0aa')}`);
b+=lamp(167,529,.79,true)+lamp(1470,650,.67,true)+path('M1420 771V681l23-171 51-72 61 89v244Z','#254b49','#7d9879',4)+path('M1470 755V541l28-48 26 57v205Z','#133440')+rect(0,620,1600,250,'url(#fog)')+particles(40);return b;}

return heart;
});

Homeward.define("scene/2/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function forest(S){let f=S.f;let b=mountains(true);b+=rep(16,i=>pine(i*119-50,709+rnd()*31,.7+rnd()*.3,i%2?'#285a60':'#2f6566'));
b+=path('M-30 648Q277 589 560 665L595 728 699 757 481 920H-30Z','#557b6c','#2b5653',3)+path('M1089 624Q1360 570 1645 674V923H961L958 798 1083 746Z','#577b68','#2b5653',3);
b+=path('M729 570Q860 658 772 721T457 924H1104Q875 797 924 730T955 590Z','url(#river)')+waterLines(668,53)+path('M737 645q87 8 108 21m-121 23q58 18 116 5m-153 48q75 19 134 2','none','#c9d4b6',3,'opacity=".5"');
b+=tree(145,777,1.55,'#2a514e')+pine(28,863,1.8,'#193f48',-4)+pine(1519,820,1.65,'#21464b',4)+tree(1427,720,1.36,'#315b53');
b+=path('M527 699 551 752M1085 677l-9 72','none','#394f44',17)+path('M517 690q297 112 581-20','none','#b9a77b',6)+(!f.grappleSet?path('M520 696q91 86 172 31','none','#b9a77b',5):path('M509 602q287 46 587-45','none','#c6b687',6));
b+=`<g id="bridgeDeck">`+rep(16,i=>{let x=551+i*32,y=706+Math.sin(i/15*Math.PI)*21-i*1.1;
 let drop=f.bridge?0:Math.sin(i/15*Math.PI)*158,tilt=f.bridge?0:Math.sin(i/15*Math.PI)*36;
 return `<g data-bridge-plank="${i}" transform="translate(${x} ${y+drop}) rotate(${tilt})">${path('M0 0l26-2 14 56-27 2Z','#a2956e','#3d5f54',2)}${path('M5 5l12 42m-4-43 12 45','none','#cfb889',1,'opacity=".6"')}${circle(6,7,2,'#52665b')}${circle(23,45,2,'#52665b')}</g>`;})+`</g>`;

b+=group(481,651,1,`${path('M-26 87-15-30H20L34 87Z','#6f7960','#31544f',3)}<g id="forestWinch">${wheel(0,0,43,0)}</g>`)+path('M1095 611v-72q-9-28-21-2','none','#a6b4a0',9)+(!f.ropeTaken?group(330,728,.85,itemArt('rope').replace(/<svg[^>]*>|<\/svg>/g,'')):'');
b+=`<g id="vineAssembly">`+path(f.branchBent?'M220 520Q370 560 541 615':'M220 520Q370 430 541 460','none','#284f47',7,'id="bentBranch"')+path(f.branchBent?'M541 615v25':'M541 460v36','none','#598572',3)+(f.branchBent?path('M541 640L495 765','none','#c8b17e',3):'')+(!f.hookTaken?`<g id="vineHook">`+group(541,f.branchBent?642:496,.83,itemArt('hook').replace(/<svg[^>]*>|<\/svg>/g,''))+`</g>`:'')+`</g>`;
b+=rock(294,759,1,'#7b8f77')+rock(1255,737,1.2,'#768b76')+fern(1234,742,1.2)+mushrooms(399,737,1.1)+mushrooms(1390,753,1.2)+fern(1537,889,2.4,'#2a5553')+fern(91,891,2.3,'#234c4b')+grass(527,754,1.1)+grass(1124,731,1.2);
b+=path('M1316 683 1384 665 1377 713 1325 723Z','#998b64','#3a5c51',3)+text(1350,699,'根 下',15,'#293f40')+path('M1339 719v64','none','#526552',7)+rect(-30,628,1680,260,'url(#fog)',0)+particles(46,'firefly');return b;}

return forest;
});

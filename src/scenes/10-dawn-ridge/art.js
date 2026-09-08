Homeward.define("scene/10/art", ["art/kit", "art/characters", "art/props"], ({P,path,rect,circle,ell,text,group,rep,rnd,icons,icon,defs,stars,mountains,pine,tree,grass,fern,rock,ground,windowArt,lamp,bell,gear,wheel,paper,bird,setVisualState,getVisualState}, {hilda,twig,person,troll,woff}, {itemArt,portrait,waterLines,mushrooms,skyline,particles}) => {
function ridge(S){let f=S.f;let b=mountains(false,true)+rep(15,i=>pine(i*129-50,740-rnd()*65,.58+rnd()*.54,i%2?'#648a7f':'#5b817a'));
b+=path('M-40 780 63 701 190 735 367 673 460 708 646 646 726 684 901 628 1072 676 1311 621 1630 723V940H-40Z','#75907a','#42695c',3)+path('M972 745 1111 705 1227 871 1208 919H953Z','#2d595c')+path('M-40 847Q369 803 609 758T949 754','none','#bec0a0',36)+path('M-40 853Q369 809 609 764T949 760','none','#8a9d7e',4);
b+=group(1340,823,2.36,`${troll(0,0,1,true)}${f.reunited?path('M-58-43Q-114-81-174-55L-179-33Q-115-52-65-19Z','#829580','#3e675c',3):path('M-58-73Q-107-50-73-9L-51-17Z','#829580','#3e675c',3)}`);
b+=rock(300,760,.75,'#8b9c7c')+rock(804,740,.85,'#879a7c')+rock(1036,730,1,'#889d7f');
b+=[430,731,1025].map((x,i)=>{let y=[664,622,636][i];return path(`M${x} ${y+77}v-115`,'none','#5a7662',9)+path(`M${x-31} ${y-37}h65`,'none','#536e5d',8)+lamp(x,y,.7,!!f['trail'+i])+(!f['hood'+i]?path(`M${x-22} ${y-18}h43l19 26h-79Z`,'#a2ab80','#4a6e5a',2):path(`M${x+17} ${y-40}v71l19 5V${y-44}Z`,'#8c9c76','#4a6e5a',2));}).join('');
b+=f.reunited?troll(1249,794,.95):troll(682,785,1.15);b+=person('阿尔弗',752,795,.75)+person('大卫',321,827,1.34)+person('芙丽达',848,785,1.38)+woff(117,538,.8)+path('M1305 228 1392 191 1473 250 1561 233 1647 317','none','#e2d8b0',2,'opacity=".5"');
b+=pine(25,899,1.55,'#325e58')+fern(59,926,2.2,'#2f5d50')+fern(1525,898,2.4,'#3c6754')+mushrooms(951,794,1)+rect(0,660,1600,255,'url(#fog)')+particles(30);return b;}

return ridge;
});

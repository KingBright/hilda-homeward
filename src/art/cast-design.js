/** Shared production drawings: the stage actor and dialogue portraits use the
 * same head/costume layers. No independent portrait-only redesigns or bitmaps. */
Homeward.define('art/cast-design', [], () => {
 const ink='#263c48';
 const p=(d,f='none',s=ink,w=1.55,extra='')=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
 const e=(x,y,rx,ry,f,s='none',w=1)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
 const profiles={
  '希尔达':{skin:'#f3cda8',shade:'#dca17e',hair:'#398eaa',light:'#77c6d5',coat:'#b75848',coatLight:'#dd8770',coatDark:'#7f3c39',scarf:'#c64f45',trousers:'#314652'},
  '大卫':{skin:'#efc8a1',shade:'#cc9979',hair:'#855d3e',light:'#ba8a58',coat:'#b18545',coatLight:'#d7b779',coatDark:'#7f623c',scarf:'#6b8e8b',trousers:'#3d5361'},
  '芙丽达':{skin:'#ae7653',shade:'#80503e',hair:'#302e30',light:'#55403a',coat:'#ccaa58',coatLight:'#ead28b',coatDark:'#988044',scarf:'#638b8b',trousers:'#344952'},
  '妈妈':{skin:'#efd0af',shade:'#d3a086',hair:'#64483e',light:'#906b53',coat:'#8d6470',coatLight:'#b99093',coatDark:'#634550',scarf:'#c6bb91',trousers:'#394950'}
 };
 const defs=`<defs>
  <pattern id="cast-knit" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M1 1l1 2 1-2m2 3 1 1" fill="none" stroke="#fff2d1" stroke-opacity=".2" stroke-width=".55"/></pattern>
  <linearGradient id="cast-fur" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#fff7df"/><stop offset=".6" stop-color="#e8ead9"/><stop offset="1" stop-color="#adc6c9"/></linearGradient>
  <linearGradient id="cast-rock" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9bafa7"/><stop offset=".48" stop-color="#778e8a"/><stop offset="1" stop-color="#4b6569"/></linearGradient>
  <linearGradient id="cast-woff" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#ead9b7"/><stop offset=".6" stop-color="#c2b493"/><stop offset="1" stop-color="#8da2a0"/></linearGradient>
 </defs>`;
 function expression(scene=0,flags={},who='希尔达'){
  if(scene===9&&!flags.roofDone){if(who==='大卫'&&!flags.davidSafe||who==='芙丽达'&&!flags.fridaSafe)return 'worried';return 'resolve';}
  if(scene===8&&!flags.heart)return 'resolve';
  if(scene===6&&!flags.calm)return 'gentle';
  return scene>=10?'relieved':'curious';
 }
 function eyes(c,mood='curious',rig=false){
  const worried=mood==='worried',resolve=mood==='resolve',happy=mood==='relieved';
  const brows=worried?'M-13-122q5-5 10-2m12-1q6-2 11 2':resolve?'M-13-125l10 4m12 0 10-5':'M-13-123q5-3 10-1m12-1q5-2 10 1';
  const mouth=worried?'M1-94q5-5 10 0':happy?'M-1-96q7 9 14-1':resolve?'M1-94q5 1 10-1':'M0-95q6 5 12-1';
  return `<g ${rig?'id="rigEyes"':'class="cast-blink"'}>${e(-7,-112,5.8,7.4,'#fff4da')}${e(13,-111,5.4,7.1,'#fff4da')}${e(-5.4,-111,2.9,4.8,ink)}${e(14.7,-110,2.8,4.6,ink)}${e(-4.5,-113,1,1.5,'#fff9ed')}${e(15.5,-112,1,1.4,'#fff9ed')}${p('M-13-117q5-5 10-1m11-1q5-4 10 1','none',c.hair,1.1)}</g>${p(brows,'none',c.hair,1.6,rig?'id="rigBrows"':'')}${p('M3-109q-1 6 3 6','none',c.shade,1.3)}${p(mouth,'none',c.hair,1.25,rig?'id="rigMouth"':'')}${e(-13,-101,4,2,c.shade)}${e(20,-100,3,1.8,c.shade)}`;
 }
 function hairBack(who,c){
  if(who==='希尔达')return p('M-22-139Q-45-127-35-106L-38-88-32-91-35-72-28-77-22-61-13-69 12-61 27-72 25-64Q43-89 28-121L22-140Z',c.hair)+p('M-27-127q-11 19-4 39m8-25q-7 31 4 43m42-44q9 22-1 39','none',c.light,1.6);
  if(who==='芙丽达')return p('M-24-125Q-43-123-34-109-46-99-33-88-42-72-25-68-24-58-12-65 3-55 13-64 32-57 32-70 49-76 36-89 45-103 32-111 41-128 23-134Z',c.hair)+p('M-29-101q-9 5-1 12m-4 9q-3 7 5 8m60-32q10 3 1 9m0 12q9 2 2 8','none',c.light,2);
  if(who==='妈妈')return p('M-22-134Q-38-119-28-81Q-8-69 29-81L28-128Z',c.hair)+p('M-26-115q-4 25 3 30m44-27q8 19 2 31','none',c.light,1.6);
  return p('M-26-123q-5 23 6 33l6-8 25 7 13-17-6-19Z',c.hair);
 }
 function head(who,mood='curious',rig=false){
  const c=profiles[who]||profiles['妈妈'];
  let front='';
  if(who==='希尔达')front=p('M-26-129q-2-19 21-18 18-8 30 10l5 17-10-5-2 6-14-11q-6 15-19 17l2-12-12 15Z',c.hair)+p('M-22-133q13-14 28-10m-11 7q-3 12-12 15m26-19 12 12','none',c.light,2)+p('M-28-141q-10-10 7-16l12-3q23-10 37 6l8 13q-23-7-44 2Z','#304757')+p('M-20-150q19-10 35-2','none','#527183',1.7)+p('M2-162l2-6','none',ink,2.3);
  else if(who==='大卫')front=p('M-29-119q-9-17 4-22l-3-9 14 2q8-14 19-4l11-5 3 11q13-2 14 9 7 9-4 16l-9-10q-3 9-14 11l3-11q-12 11-23 9l-6 11Z',c.hair)+p('M-21-139q10 2 17-6m9 6q8-6 15 0m-31 13 12-5','none',c.light,1.8)+p('M-16-103h2m3 1h1m26-1h2','none','#b8835b',1.2);
  else if(who==='芙丽达')front=p('M-28-120q-16-10-5-22-1-16 13-16 10-13 22-7 13-9 24 3 18-2 18 14 14 11 1 20l-8 16-6-18q-10 8-14-1-11 9-16 0-7 10-18 11Z',c.hair)+p('M-24-143q-7-5-1-9m8-5q8-7 11 0m12-3q10-6 13 5m9 7q12 2 6 9m-56-5q7-7 12-1m14-5q10-5 13 4','none',c.light,2.2)+p('M22-132l8-8','none','#d7ba71',2.8);
  else front=p('M-28-124q-4-27 20-29 26-9 37 14l1 25-8-14q-16 6-19-9-12 17-29 23Z',c.hair)+p('M-22-134q10-15 21-14m7 5q12 1 16 10','none',c.light,1.8);
  return `<g ${rig?'id="rigHead"':''} data-cast-head="${who}" data-mood="${mood}">${p('M-20-128Q-5-141 18-132L25-119 24-100Q19-84 3-86-15-86-21-103Z',c.skin)}${p('M-19-108q-11-9-11 2 0 9 10 9',c.skin)}${p('M-24-109q-3 2 0 6','none',c.shade,1.3)}${p('M-15-91q14 11 31-5l-3 8q-13 9-27-1Z',c.shade,'none')}${eyes(c,mood,rig)}${front}${who==='妈妈'?e(-26,-98,2,3,'#dec989',ink,.8):''}</g>`;
 }
 function upper(who,rig=false,mood='curious'){
  const c=profiles[who]||profiles['妈妈'],hilda=who==='希尔达',mom=who==='妈妈';
  const torso=p('M-23-82Q-8-92 18-83L27-44Q5-38-25-45Z',c.coat)+p('M-22-74l7-9 3 34 27 3 10-4 2 7q-28 7-51 0Z',c.coatDark,'none')+p('M-12-80Q1-85 14-79L20-54-14-54Z',c.coatLight,'none')+p('M-12-80Q1-85 14-79L20-54-14-54Z','url(#cast-knit)','none')+p('M-2-78V-49M-21-48H22','none',c.coatDark,1.15)+p('M-10-57h9v8h-10m15-8h10v8H5','none',c.coatLight,1.1)+[0,1,2].map(i=>e(1,-72+i*8,1.2,1.2,'#ecd5a4')).join('');
  return `<g ${rig?'id="rigUpper"':''} data-costume="${who}">${hairBack(who,c)}${p('M-20-82q-18 0-16 18l3 19 17 4 6-26Z','#64594c')}${p('M-32-66l15 3-2 11-12-2Z','#a27e55')}${p('M-26-73l4 1v8l-5-1Z','#d6b77c')}${hilda?p('M-21-53H20L29-29Q1-25-28-29Z','#334552')+p('M-15-51l-4 20m18-21v22m14-21 7 19','none','#536574',1.2):''}${mom?p('M-20-61L-32-23Q2-16 32-25L19-64Z',c.coatDark):''}${torso}${p('M-13-85Q-17-68-13-46','none','#544b40',4.2)}${p('M-13-81v21','none','#bc9764',1.4)}${p('M-15-62h5v7h-5Z','#d9bd83',ink,.8)}${who==='芙丽达'?p('M16-67l7 3-3 8-8-3Z','#d2c49c',ink,1)+p('M16-61l2-3 2 4','none','#55756c',1):''}${head(who,mood,rig)}${p('M-22-91Q-3-86 22-93L24-83Q6-77-22-82Z',c.scarf)}${p('M-18-86q19 6 37-2','none',hilda?'#ed9b77':'#a4beb0',1.4)}${p('M17-84Q32-86 45-74L41-63 32-64 33-71 18-75Z',c.scarf,ink,1.4,rig?'id="rigScarf"':'class="cast-scarf"')}${p('M-21-48H21','none','#e2be8a',.7)}</g>`;
 }
 function boot(x,y,back=false){return p(`M${x-6} ${y-8}l12 0 1 7q12 1 13 8l-27 0Z`,back?'#745442':'#92674b')+p(`M${x-6} ${y+5}h25v3h-27Z`,'#34434a')+p(`M${x-3} ${y-5}l8 2m-7 2 9 2`,'none','#d5bb8f',1)+p(`M${x+9} ${y+2}q4-1 7 2`,'none','#b58e65',1);}
 function standing(who,mood='curious'){
  const c=profiles[who]||profiles['妈妈'];
  return `<g data-cast="${who}">${e(0,3,30,5,'#0d293945')}<g class="cast-breathe"><g class="cast-leg-back">${p('M-18-45l2 37h10l6-36',c.trousers)}${p('M-12-33l2 20','none','#7c8990',1)}${boot(-12,-2,true)}</g><g class="cast-leg-front">${p('M6-44l3 36h10l1-36',c.trousers)}${p('M13-32l1 18','none','#7c8990',1)}${boot(14,-2)}</g><g class="person-arms">${p('M-20-81Q-30-74-29-55l-3 13 8 2 6-20 6-15',c.coat)}${p('M19-81q13 8 11 24l3 12-8 3-8-19Z',c.coat)}${p('M-31-47l9 2m4-25-5 13m49 10 8-1','none',c.coatLight,2)}${p('M-32-42q-3 8 2 10 6 1 7-6l-1-5Z',c.skin)}${p('M26-44q-2 8 3 10 7-2 5-10Z',c.skin)}</g>${upper(who,false,mood)}</g></g>`;
 }
 function elf(){return `<g data-cast="阿尔弗" class="cast-breathe">${e(0,3,17,3,'#0d29393d')}${p('M-7-16v14m12-15 2 16','none','#405253',4)}${boot(-6,0,true)}${boot(8,0)}${p('M-11-35q11-7 22 0l4 19-26 1Z','#849078')}${p('M-13-32l-5 12 6 3m22-17 9 11-5 6','none','#aaaf88',4)}${p('M-14-43l-10-7 3 10 7 4m28-7 10-7-4 10-7 3','#edc69f')}${e(0,-46,16,19,'#f4d6b0',ink,1.4)}${p('M-19-55Q-13-74 1-87L-1-72Q14-68 20-53Z','#b95444')}${p('M-9-69l9-12-3 13 13 6','none','#e09772',1.3)}${p('M-18-54q18-8 37 0','none','#6f3939',3)}${e(-6,-46,2,2.5,ink)}${e(7,-46,2,2.5,ink)}${p('M-15-50h13v10h-13Zm18 0h13v10H3Zm-5 4h5','none','#6b5b45',1.2)}${p('M-3-34q4 3 8-1','none','#815546',1)}${p('M-6-30l18 1 4 20-19 2Z','#e3d4a8')}${p('M-2-24h9m-8 4h10m-9 4h7','none','#8f9475',.8)}${e(10,-12,2,2,'#b46551')}</g>`;}
 function twig(){return `<g data-cast="枝枝"><g class="cast-tail">${p('M14-26Q31-55 49-55L44-47 58-45 52-39 59-38Q53-14 23-17Z','url(#cast-fur)')}${p('M28-26q17-3 23-17','none','#faf6df',3)}</g>${p('M-15-25l-3 23 8 2 5-19m18-6 0 23 7 1 4-24','#bed0cc')}${p('M-29-39Q-7-54 22-37l1 17q-19 12-39-3l-9 24h-8l4-26Z','url(#cast-fur)')}${p('M11-27l-1 25 9 2 4-25','url(#cast-fur)')}${p('M-31-24l-7-3-10-12 1-10-7-15 14 6 9-14 4 19q15-3 17 10l-5 15Z','url(#cast-fur)')}${p('M-43-56l-4-6 2 12m13-6 1-10 3 9','#aabfc2','none')}${p('M-31-59l-6-17 2-13m-2 11-10-8m20 27 6-20 0-11m0 12 11-9','none','#758d8c',2.6)}${p('M-32-59l-5-17m11 15 6-19','none','#d7dcc4',1)}${e(-31,-42,2.1,3.3,ink)}${e(-30.4,-43,0.65,1,'#fff9ea')}${p('M-48-41l6 2-2 4Z',ink)}${p('M-45-32q5 3 9 0m11 8 6 1-4 4','none','#6d9193',1)}${p('M-32 1h8m14 0h7m16 0h9','none','#455e68',1.5)}</g>`;}
 function troll(big=false,calm=true){return `<g data-cast="${big?'巨魔妈妈':'小巨魔'}">${e(0,4,66,9,'#0b273747')}<g class="cast-breathe">${p('M-60-7Q-75-33-60-69L-55-99Q-51-131-28-138L-11-149 14-143 34-140Q56-130 57-99l10 25q15 22 10 53L58-13 50-4 21-6 11-20-4-18-16-4-39-3-47-12Z','url(#cast-rock)',ink,2.2)}${p('M-56-62l13-17 12 12-8 35-15 8m77-54 24 9 12 32-18 9-11-28','#67837e','none')}${p('M-31-135l17-8 22 3 10 7-22 3-17 15-18-2Z','#b5beb0','none')}${p('M-41-112l-13-5-4 12 10 10m92-17 12-6 6 12-10 12','#8fa399')}${e(-24,-96,10,12,'#c5cbb8')}${e(27,-96,10,12,'#c5cbb8')}${e(-21,-95,4.4,6,ink)}${e(25,-95,4.4,6,ink)}${e(-20,-97,1.3,1.7,'#f6ecd4')}${e(26,-97,1.3,1.7,'#f6ecd4')}${p('M-5-99l-9 28 25 2-8-25Z','#8fa6a0')}${p(calm?'M-20-57q21 15 42-1':'M-17-54q16-8 33-1','none','#324f56',2.1)}${p('M-46-46l9 5-4 14m76-22-9 9 3 12M-32-17l2 8m57-10 3 9m9-111-5 8 5 9','none','#b1bdb0',1.3)}${[-29,-18,16,31].map((x,i)=>e(x,-76+i%2*3,2.5,1.8,'#607c78')).join('')}${p('M-40-132l-1-8 10 3 4-9 8 6 8-6 7 7-6 8Z','#78936e')}${p('M-36-140l3 9m6-14 1 10m10-9-2 8','none','#bcc69b',1)}${big?p('M12-140q-3-13 6-20m-5 9-8-5m8 2 10-2','none','#93af8a',2):p('M-50-69q46 17 96 1l-5 10q-41 16-84-1Z','#b77959')}${p('M-40-63q16 6 28 6','none','#e0b58a',1.2)}</g></g>`;}
 function woff(){return `<g data-cast="沃夫" class="float">${p('M-80-16Q-101-27-86-47-68-62-49-43Q-3-70 49-43 67-65 84-48 101-29 81-14 99 14 73 36 40 61-16 54-60 53-80 31-92 13-80-16Z','url(#cast-woff)',ink,2)}${p('M-46-36q12-8 25-8m-19 3 6-7m9 3 6-7m-45 32-6 7m125-3 6 9','none','#f3e5c3',1.8)}${p('M-79-29q-2-16 17-14m127 0q20-3 17 16','none','#8e9b94',2)}${e(-28,5,10,12,'#f0e6cc')}${e(26,5,10,12,'#f0e6cc')}${e(-25,6,3.7,6.2,ink)}${e(25,6,3.7,6.2,ink)}${e(-24,3,1,1.8,'#fff2dc')}${e(26,3,1,1.8,'#fff2dc')}${p('M-8 21q8 8 17-2','none','#576d70',1.5)}${p('M-37 49l-4 12 17-8m39-1 18 10-3-14','#8da2a0')}${e(-42,22,8,3,'#bc9f87')}${e(41,22,8,3,'#bc9f87')}</g>`;}
 return {profiles,defs,expression,head,upper,boot,standing,elf,twig,troll,woff};
});

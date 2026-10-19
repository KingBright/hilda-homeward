/** Shared production drawings: the stage actor and dialogue portraits use the
 * same head/costume layers. No independent portrait-only redesigns or bitmaps. */
Homeward.define('art/cast-design', ['art/twig-design'], Twig => {
 const ink='#233844';
 const p=(d,f='none',s=ink,w=1.55,extra='')=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
 const e=(x,y,rx,ry,f,s='none',w=1)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
 const profiles={
  '希尔达':{skin:'url(#cast-skin-hilda)',skinSolid:'#f4cfb0',shade:'#d99b78',blush:'#e88d76',hair:'url(#cast-hair-hilda)',hairSolid:'#358ba7',hairDark:'#215e75',light:'#83d4e3',coat:'url(#cast-coat-hilda)',coatSolid:'#be5948',coatLight:'#e48d75',coatDark:'#7e3835',scarf:'url(#cast-scarf-hilda)',scarfSolid:'#c84d42',trousers:'#2f4553',eye:'#233844',iris:'#3e6e7c'},
  '大卫':{skin:'url(#cast-skin-david)',skinSolid:'#f0c9a3',shade:'#ca9474',blush:'#df8f73',hair:'url(#cast-hair-david)',hairSolid:'#865d3d',hairDark:'#593b25',light:'#c49462',coat:'url(#cast-coat-david)',coatSolid:'#b58847',coatLight:'#dcc082',coatDark:'#7c5e38',scarf:'#688e8a',scarfSolid:'#688e8a',trousers:'#3c5260',eye:'#263840',iris:'#5c4636'},
  '芙丽达':{skin:'url(#cast-skin-frida)',skinSolid:'#b07855',shade:'#7f4e3b',blush:'#9c5644',hair:'url(#cast-hair-frida)',hairSolid:'#2d2b2e',hairDark:'#19181b',light:'#624d47',coat:'url(#cast-coat-frida)',coatSolid:'#cfa954',coatLight:'#eed690',coatDark:'#94783c',scarf:'#5d8989',scarfSolid:'#5d8989',trousers:'#334852',eye:'#1f2e35',iris:'#3c302c'},
  '妈妈':{skin:'url(#cast-skin-mom)',skinSolid:'#f0d1b2',shade:'#d19d82',blush:'#df927c',hair:'url(#cast-hair-mom)',hairSolid:'#66493f',hairDark:'#432e27',light:'#9b755d',coat:'url(#cast-coat-mom)',coatSolid:'#916572',coatLight:'#c1969a',coatDark:'#61424d',scarf:'#cbc096',scarfSolid:'#cbc096',trousers:'#384850',eye:'#243842',iris:'#54464b'}
 };
 const defs=`<defs>
  <pattern id="cast-knit" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M1 1l1 2 1-2m2 3 1 1" fill="none" stroke="#fff4d8" stroke-opacity=".28" stroke-width=".65"/></pattern>
  <linearGradient id="cast-fur" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#fff9e6"/><stop offset=".58" stop-color="#ebeede"/><stop offset="1" stop-color="#abc4c7"/></linearGradient>
  <linearGradient id="cast-rock" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a2b6ae"/><stop offset=".48" stop-color="#788f8b"/><stop offset="1" stop-color="#486266"/></linearGradient>
  <linearGradient id="cast-woff" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#f0e0be"/><stop offset=".6" stop-color="#c6b896"/><stop offset="1" stop-color="#8ca19f"/></linearGradient>
  <linearGradient id="cast-skin-hilda" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#fae0c7"/><stop offset=".65" stop-color="#f2cba8"/><stop offset="1" stop-color="#dfb08c"/></linearGradient>
  <linearGradient id="cast-skin-david" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#f7dac0"/><stop offset=".65" stop-color="#eec69f"/><stop offset="1" stop-color="#d8a882"/></linearGradient>
  <linearGradient id="cast-skin-frida" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#c28a66"/><stop offset=".65" stop-color="#ae7552"/><stop offset="1" stop-color="#8e5a3e"/></linearGradient>
  <linearGradient id="cast-skin-mom" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#f8e1c8"/><stop offset=".65" stop-color="#efd0b0"/><stop offset="1" stop-color="#dbb292"/></linearGradient>
  <linearGradient id="cast-hair-hilda" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#53b4cc"/><stop offset=".52" stop-color="#378da9"/><stop offset="1" stop-color="#23637b"/></linearGradient>
  <linearGradient id="cast-hair-david" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#9e714c"/><stop offset=".55" stop-color="#82593a"/><stop offset="1" stop-color="#5c3d26"/></linearGradient>
  <linearGradient id="cast-hair-frida" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#433e42"/><stop offset=".55" stop-color="#2c292c"/><stop offset="1" stop-color="#181619"/></linearGradient>
  <linearGradient id="cast-hair-mom" x1=".1" y1="0" x2=".85" y2="1"><stop stop-color="#7d5b4f"/><stop offset=".55" stop-color="#62463c"/><stop offset="1" stop-color="#442f28"/></linearGradient>
  <linearGradient id="cast-coat-hilda" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#d86c57"/><stop offset=".55" stop-color="#b85646"/><stop offset="1" stop-color="#8b3c35"/></linearGradient>
  <linearGradient id="cast-coat-david" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#c99b56"/><stop offset=".55" stop-color="#b08343"/><stop offset="1" stop-color="#825f32"/></linearGradient>
  <linearGradient id="cast-coat-frida" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#e0bc68"/><stop offset=".55" stop-color="#caa552"/><stop offset="1" stop-color="#967838"/></linearGradient>
  <linearGradient id="cast-coat-mom" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#a87b88"/><stop offset=".55" stop-color="#8c626f"/><stop offset="1" stop-color="#654450"/></linearGradient>
  <linearGradient id="cast-scarf-hilda" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#df6152"/><stop offset=".6" stop-color="#c34b40"/><stop offset="1" stop-color="#94342f"/></linearGradient>
  <linearGradient id="cast-skirt" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#3e5666"/><stop offset="1" stop-color="#263844"/></linearGradient>
  <linearGradient id="cast-satchel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#967452"/><stop offset=".6" stop-color="#6f563e"/><stop offset="1" stop-color="#4d3b2c"/></linearGradient>
  <linearGradient id="cast-boot-front" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#a87959"/><stop offset=".58" stop-color="#8e6246"/><stop offset="1" stop-color="#684632"/></linearGradient>
  <linearGradient id="cast-boot-back" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#855f48"/><stop offset=".6" stop-color="#6d4c39"/><stop offset="1" stop-color="#513729"/></linearGradient>
 </defs>`;
 function expression(scene=0,flags={},who='希尔达'){
  if(scene===9&&!flags.roofDone){if(who==='大卫'&&!flags.davidSafe||who==='芙丽达'&&!flags.fridaSafe)return 'worried';return 'resolve';}
  if(scene===8&&!flags.heart)return 'resolve';
  if(scene===6&&!flags.calm)return 'gentle';
  return scene>=10?'relieved':'curious';
 }
 function eyes(c,mood='curious',rig=false){
  const worried=mood==='worried',resolve=mood==='resolve',happy=mood==='relieved';
  const brows=worried?'M-13.5-122.5q5-5.2 10.5-1.8m11.5-1.2q6-2.2 11 2.2':resolve?'M-13.5-125l10.2 3.8m11.6 0 10.2-4.8':'M-13.5-123.2q5.2-3.4 10.4-.8m11.6-1q5.2-2.2 10.2 1.2';
  const mouth=worried?'M1-94q5-5 10 0':happy?'M-1-96q7 9 14-1':resolve?'M1-94q5 1 10-1':'M0-95q6 5 12-1';
  return `<g ${rig?'id="rigEyes"':'class="cast-blink"'}>`+
   `${e(-7,-112,6,7.6,'#fff8e7',ink,1.15)}${e(13,-111,5.6,7.3,'#fff8e7',ink,1.15)}`+
   `${p('M-12.6-114.8Q-7-119.5-1.2-114.2M7.6-113.8Q13-118.4 18.4-113.2','none','#d9c4a3',1.1)}`+
   `<g class="cast-pupils">`+
    `${e(-5.3,-111,3.3,5.1,c.iris||ink)}${e(14.6,-110,3.1,4.9,c.iris||ink)}`+
    `${e(-5.2,-111,2.2,3.6,ink)}${e(14.7,-110,2.1,3.5,ink)}`+
    `${e(-4.1,-113.2,1.25,1.7,'#fffdf5')}${e(15.7,-112.2,1.15,1.6,'#fffdf5')}`+
    `${e(-6.3,-109.2,.65,.8,'#ffffffb8')}${e(13.6,-108.3,.6,.75,'#ffffffb8')}`+
   `</g>`+
   `${p('M-13.2-116.5Q-7-121.2-.8-116.2M7.2-115.5Q13.2-120 18.8-115.2','none',ink,1.45)}`+
  `</g>`+
  `${p(brows,'none',c.hairDark||ink,1.7,rig?'id="rigBrows"':'')}`+
  `${p('M3.2-109.5Q1.4-103.5 5.8-103.2','none',c.shade,1.35)}`+
  `${p(mouth,'none',ink,1.35,rig?'id="rigMouth" class="cast-mouth"':'class="cast-mouth"')}`+
  `${e(-13.2,-101.2,4.4,2.3,c.blush||c.shade)}${e(19.8,-100.2,3.4,2,c.blush||c.shade)}`;
 }
 function hairBack(who,c){
  if(who==='希尔达'){
   return p('M-22-139C-42-130-43-105-37-87C-41-77-37-65-29-58C-22-53-12-56-6-61L14-59C23-56 32-62 35-72C42-88 38-113 28-127L22-140Z',c.hair,ink,1.65)+
    p('M-34-103C-37-87-33-70-24-60M-21-106C-24-86-18-69-10-61M27-109C33-92 31-75 23-64','none',c.hairDark,1.25)+
    p('M-29-127C-38-108-34-86-26-67M-18-112C-22-89-16-73-9-63M24-118C32-98 30-79 22-66','none',c.light,1.75);
  }
  if(who==='芙丽达'){
   return p('M-25-127C-44-124-45-103-35-94C-46-83-41-64-25-62C-22-52-7-53 2-61C12-53 28-55 32-67C47-70 48-88 37-96C46-107 41-127 23-134Z',c.hair,ink,1.65)+
    p('M-31-102q-8 6-1 13m-3 9q-3 7 6 8m58-32q9 4 1 10m0 11q8 3 2 9','none',c.light,2);
  }
  if(who==='妈妈'){
   return p('M-23-135C-39-120-36-92-29-76C-22-66-6-68 4-73C15-69 27-71 31-81C36-97 34-119 28-131Z',c.hair,ink,1.65)+
    p('M-27-116C-32-96-28-82-22-75M26-114C32-96 29-82 23-75','none',c.light,1.7);
  }
  return p('M-26-124C-32-104-25-88-18-86L-11-94L15-87L28-104L22-123Z',c.hair,ink,1.6);
 }
 function head(who,mood='curious',rig=false){
  const c=profiles[who]||profiles['妈妈'];
  let front='';
  if(who==='希尔达'){
   front=p('M-27-129C-28-146-7-151 12-146C28-149 39-138 42-123C43-114 39-104 34-99L28-109L24-101L13-115C7-101-5-96-17-97L-13-110L-25-96C-29-105-29-118-27-129Z',c.hair,ink,1.6)+
    p('M-22-134C-10-146 8-146 23-139M-7-127C-10-115-16-107-23-103M18-132C26-124 31-114 34-104','none',c.light,1.95)+
    p('M-29-140C-36-150-22-158-6-159C14-165 34-156 41-143L46-131C26-138 2-137-29-140Z','#2b4252',ink,1.6)+
    p('M-24-141C-4-145 19-144 41-135','none','#49697d',2)+
    p('M-18-151C-2-158 16-157 31-149','none','#64899e',1.5)+
    p('M3-160Q5-166 7-168','none',ink,2.4);
  }else if(who==='大卫'){
   front=p('M-29-119C-37-134-26-143-16-141L-19-149L-4-146C4-158 16-154 23-146L33-150L35-139C46-140 49-130 44-121C49-113 41-106 34-104L27-115C23-106 14-103 4-104L7-115C-4-105-15-105-24-108L-29-98Z',c.hair,ink,1.55)+
    p('M-21-139q10 2 17-6m9 6q8-6 15 0m-31 13 12-5','none',c.light,1.8)+
    p('M-16-103h1.8m3.2 1.2h1.5m25-1.2h1.8','none','#b8835b',1.3);
  }else if(who==='芙丽达'){
   front=p('M-28-120C-43-129-35-143-24-143C-24-157-10-159 1-153C11-164 24-159 31-149C44-155 54-144 51-131C62-122 54-108 42-104L35-90L30-108C21-101 15-103 11-110C2-102-4-103-9-110C-15-101-22-100-28-104Z',c.hair,ink,1.6)+
    p('M-24-143q-7-5-1-9m8-5q8-7 11 0m12-3q10-6 13 5m9 7q12 2 6 9m-56-5q7-7 12-1m14-5q10-5 13 4','none',c.light,2.1)+
    p('M21-131l8-8m-6 10 8-8','none','#e5c878',2.2);
  }else{
   front=p('M-28-124C-32-149-11-156 10-154C32-159 46-143 47-122L47-98L39-112C25-106 19-112 15-122C4-106-11-100-28-100Z',c.hair,ink,1.6)+
    p('M-22-135C-12-149 1-149 14-144M19-139C31-137 37-128 39-116','none',c.light,1.85);
  }
  return `<g class="cast-attention"><g ${rig?'id="rigHead"':''} data-cast-head="${who}" data-mood="${mood}">`+
   `${p('M-20-128C-10-141 11-140 20-130C26-122 26-107 24-98C20-85 8-84-2-85C-14-86-21-95-21-106Z',c.skin,ink,1.55)}`+
   `${p('M-19-109C-29-116-30-102-21-99C-17-98-15-101-16-105',c.skin,ink,1.4)}`+
   `${p('M-24-108q-2.5 2.5 0 5.5','none',c.shade,1.25)}`+
   `${p('M-15-91Q2-81 17-95L15-87Q1-79-14-88Z',c.shade,'none')}`+
   `${eyes(c,mood,rig)}${front}`+
   `${who==='妈妈'?e(-25.5,-97.5,2.2,3.2,'#ecd694',ink,.9):''}`+
  `</g></g>`;
 }
 function upper(who,rig=false,mood='curious'){
  const c=profiles[who]||profiles['妈妈'],hilda=who==='希尔达',mom=who==='妈妈';
  const satchel=p('M-21-81C-36-81-38-66-35-50L-32-38C-27-34-18-33-13-36L-8-64Z','url(#cast-satchel)',ink,1.5)+
   p('M-34-66L-16-62L-18-50L-33-53Z','#b58d61',ink,1.2)+
   p('M-28-74L-22-72L-22-63L-29-64Z','#e8cf97',ink,1)+
   e(-25,-56,1.6,2,'#ecd396',ink,.7);
  const skirt=hilda?p('M-22-53H21L30-28Q2-23-29-28Z','url(#cast-skirt)',ink,1.55)+
   p('M-14-51l-5 21m13-22-1 22m13-22 3 22m10-21 6 20','none','#1d2c36',1.25)+
   p('M-26-31Q2-26 27-31','none','#567082',1):'';
  const momSkirt=mom?p('M-21-60L-33-22Q2-15 33-24L20-62Z',c.coatDark,ink,1.55)+
   p('M-15-56l-7 32m16-33-2 34m16-33 5 33','none','#49303a',1.2):'';
  const torso=p('M-23-82C-10-92 12-91 20-82L28-44C12-38-9-38-26-44Z',c.coat,ink,1.6)+
   p('M-23-73l8-9 3 35 26 2 10-4 2 6q-28 7-51 0Z',c.coatDark,'none')+
   p('M-12-81Q1-86 14-80L19-53H-14Z',c.coatLight,'none')+
   p('M-12-81Q1-86 14-80L19-53H-14Z','url(#cast-knit)','none')+
   p('M-15-82L-7-70L-2-78M14-81L7-70L-2-78','none',c.coatDark,1.3)+
   p('M-2-78V-43M-23-46Q2-40 25-45','none',c.coatDark,1.25)+
   p('M-19-58h11v9h-11Zm27 0h11v9H8Z',c.coatSolid||c.coatDark,ink,1.05)+
   p('M-20-58h12m15 0h12','none',c.coatLight,1.35)+
   [0,1,2].map(i=>e(1.2,-72+i*8.5,1.45,1.45,'#f3dca8',ink,.7)).join('');
  const strap=p('M-13-85Q-17-67-13-45','none','#4e4033',4.6)+
   p('M-13-84Q-17-67-13-46','none','#c49c68',1.6)+
   p('M-15.5-63h5.5v7.5h-5.5Z','#e5c88c',ink,.9);
  const badge=who==='芙丽达'?p('M15-68l8 3-3 9-8-3Z','#decfa4',ink,1)+p('M16-62l2-3 2 4','none','#4d7067',1.1):'';
  const scarf=p('M-23-91C-6-85 12-86 23-93L25-82C9-76-8-76-23-81Z',c.scarf,ink,1.5)+
   p('M-18-86q19 6 37-2','none',hilda?'#f6aa88':'#b2cbc0',1.45)+
   p('M17-84Q33-86 45-74L41-62 31-63 32-71 18-75Z',c.scarf,ink,1.45,rig?'id="rigScarf"':'class="cast-scarf"');
  return `<g ${rig?'id="rigUpper"':''} data-costume="${who}">`+
   `${hairBack(who,c)}${satchel}${skirt}${momSkirt}${torso}${strap}${badge}`+
   `${head(who,mood,rig)}${scarf}`+
   `${p('M-23-45Q2-39 25-44','none','#edd09f',.85)}`+
  `</g>`;
 }
 function boot(x,y,back=false){
  const fill=back?'url(#cast-boot-back)':'url(#cast-boot-front)';
  const cuff=back?'#d5c7a8':'#efe3c4';
  return p(`M${x-6.5} ${y-9.5}Q${x} ${y-11} ${x+6.5} ${y-9.5}L${x+7} ${y-5.2}Q${x} ${y-4} ${x-7} ${y-5.2}Z`,cuff,ink,1.35)+
   p(`M${x-6} ${y-5.8}H${x+6}L${x+7.2} ${y-1}C${x+15} ${y-.4} ${x+20.5} ${y+2.2} ${x+20.5} ${y+6.8}H${x-7.2}L${x-6.8} ${y+.5}Z`,fill,ink,1.5)+
   p(`M${x-7.4} ${y+5.2}H${x+20.8}V${y+8.2}H${x-7.4}Z`,'#2b3b42',ink,1.25)+
   p(`M${x-3.2} ${y-4.2}l7.5 1.6m-7 2.2 8.2 1.6m-7.5 2.2 7.8 1.4`,'none','#ead4a8',1.05)+
   p(`M${x+9.5} ${y+1.4}q4.8-.8 8 2.2`,'none',back?'#9c7658':'#c89e74',1.1);
 }
 function restingArm(name,c){
  const x=name==='back'?-22:22,ex=name==='back'?-29.794:29.794,hx=name==='back'?-31.5:31.5;
  const d=`M${x} -79L${ex} -55.246L${hx} -28.3`;
  const sleeve=name==='back'?c.coatDark:c.coatSolid||c.coat;
  return `<g data-rest-arm="${name}">`+
   `${p(d,'none',ink,11.4)}`+
   `<path class="rest-sleeve" d="${d}" fill="none" stroke="${sleeve}" stroke-width="8.8" stroke-linecap="round" stroke-linejoin="round"/>`+
   `<g class="rest-hand" transform="translate(${hx} -28.3) scale(${name==='back'?-1:1} 1)">`+
    `${p('M-5-6.2Q0-7.2 5-6.2L5.4-2.4Q0-1.5-5.4-2.4Z',c.coatDark,ink,1.2)}`+
    `${p('M-4.2-2.6Q0-3.4 4.2-2.6L4.6 2.8Q4.2 7.2.8 7.8L-2.8 6.4Q-4.8 4-4.5-.5Z',c.skinSolid||c.skin,ink,1.15)}`+
    `${p('M3.2-1.5Q6.4-.8 6 2.4Q4.6 3.6 2.8 1.8','none',ink,1.1)}`+
    `${p('M3.1-1.3Q5.8-.7 5.5 2.1Q4.3 3.1 2.8 1.6',c.skinSolid||c.skin,'none')}`+
    `${p('M-.8 2.2l.8 3.6m-2.4-3.4.6 3.2','none',c.shade,.85)}`+
   `</g></g>`;
 }
 function restingLeg(name,c){
  const x=name==='back'?-11:11,d=`M${x} -50.7L${x+2.67} -26.85L${x} -3`;
  return `<g class="cast-leg-${name}" data-rest-leg="${name}">${p(d,'none',ink,11.2)}${p(d,'none',c.trousers,8.6)}<g class="cast-foot" transform="translate(${x} -3)">${boot(0,-5,name==='back')}</g></g>`;
 }
 function standing(who,mood='curious'){
  const c=profiles[who]||profiles['妈妈'];
  return `<g data-cast="${who}">${e(0,3,30,5,'#0d293945')}
    ${restingLeg('back',c)}${restingLeg('front',c)}
    <g class="cast-rest-upper">${upper(who,false,mood)}<g class="person-arms">${restingArm('back',c)}${restingArm('front',c)}</g></g>
  </g>`;
 }
 function elf(){return `<g data-cast="阿尔弗" data-other-life="elf">${e(0,3,17,3,'#0d29393d')}${p('M-7-16v14m12-15 2 16','none','#405253',4)}${boot(-6,0,true)}${boot(8,0)}<g data-life-body data-life-pivot="0 -16">${p('M-11-35q11-7 22 0l4 19-26 1Z','#849078')}${p('M-13-32l-5 12 6 3m22-17 9 11-5 6','none','#aaaf88',4)}<g data-life-head data-life-pivot="0 -28">${p('M-14-43l-10-7 3 10 7 4m28-7 10-7-4 10-7 3','#edc69f')}${e(0,-46,16,19,'#f4d6b0',ink,1.4)}${p('M-19-55Q-13-74 1-87L-1-72Q14-68 20-53Z','#b95444')}${p('M-9-69l9-12-3 13 13 6','none','#e09772',1.3)}${p('M-18-54q18-8 37 0','none','#6f3939',3)}<g data-life-eye data-eye-y="-46"><g data-life-gaze>${e(-6,-46,2,2.5,ink)}${e(7,-46,2,2.5,ink)}</g></g>${p('M-15-50h13v10h-13Zm18 0h13v10H3Zm-5 4h5','none','#6b5b45',1.2)}${p('M-3-34q4 3 8-1','none','#815546',1,'data-life-mouth')}</g><g data-life-gesture>${p('M-6-30l18 1 4 20-19 2Z','#e3d4a8')}${p('M-2-24h9m-8 4h10m-9 4h7','none','#8f9475',.8)}${e(10,-12,2,2,'#b46551')}</g></g></g>`;}
 function twig(){return Twig.markup();}

 function troll(big=false,calm=true){return `<g data-cast="${big?'巨魔妈妈':'小巨魔'}" data-other-life="${big?'mother':'troll'}">${e(0,4,66,9,'#0b273747')}<g data-life-body data-life-pivot="0 -5">${p('M-60-7Q-75-33-60-69L-55-99Q-51-131-28-138L-11-149 14-143 34-140Q56-130 57-99l10 25q15 22 10 53L58-13 50-4 21-6 11-20-4-18-16-4-39-3-47-12Z','url(#cast-rock)',ink,2.2)}${p('M-56-62l13-17 12 12-8 35-15 8m77-54 24 9 12 32-18 9-11-28','#67837e','none')}${p('M-31-135l17-8 22 3 10 7-22 3-17 15-18-2Z','#b5beb0','none')}<g data-life-head data-life-pivot="0 -75">${p('M-41-112l-13-5-4 12 10 10m92-17 12-6 6 12-10 12','#8fa399')}<g data-life-eye data-eye-y="-96">${e(-24,-96,10,12,'#c5cbb8')}${e(27,-96,10,12,'#c5cbb8')}<g data-life-gaze>${e(-21,-95,4.4,6,ink)}${e(25,-95,4.4,6,ink)}${e(-20,-97,1.3,1.7,'#f6ecd4')}${e(26,-97,1.3,1.7,'#f6ecd4')}</g></g>${p('M-5-99l-9 28 25 2-8-25Z','#8fa6a0')}${p(calm?'M-20-61q21 14 42-1':'M-17-58q16-8 33-1','none','#324f56',2.2,'data-life-mouth')}</g>${p('M-46-46l9 5-4 14m76-22-9 9 3 12M-32-17l2 8m57-10 3 9m9-111-5 8 5 9','none','#b1bdb0',1.3)}${[-29,-18,16,31].map((x,i)=>e(x,-76+i%2*3,2.5,1.8,'#607c78')).join('')}${p('M-40-132l-1-8 10 3 4-9 8 6 8-6 7 7-6 8Z','#78936e')}${p('M-36-140l3 9m6-14 1 10m10-9-2 8','none','#bcc69b',1)}${big?p('M12-140q-3-13 6-20m-5 9-8-5m8 2 10-2','none','#93af8a',2):p('M-48-47q44 15 92 1l-5 10q-39 14-80-1Z','#b77959')}${p(big?'M-40-63q16 6 28 6':'M-38-41q16 5 28 5','none','#e0b58a',1.2)}</g></g>`;}
 function woff(){return `<g data-cast="沃夫" data-other-life="woff"><g data-life-body data-life-pivot="0 52">${p('M-80-16Q-101-27-86-47-68-62-49-43Q-3-70 49-43 67-65 84-48 101-29 81-14 99 14 73 36 40 61-16 54-60 53-80 31-92 13-80-16Z','url(#cast-woff)',ink,2)}${p('M-46-36q12-8 25-8m-19 3 6-7m9 3 6-7m-45 32-6 7m125-3 6 9','none','#f3e5c3',1.8)}${p('M-79-29q-2-16 17-14m127 0q20-3 17 16','none','#8e9b94',2)}<g data-life-head data-life-pivot="0 12"><g data-life-eye data-eye-y="5">${e(-28,5,10,12,'#f0e6cc')}${e(26,5,10,12,'#f0e6cc')}<g data-life-gaze>${e(-25,6,3.7,6.2,ink)}${e(25,6,3.7,6.2,ink)}${e(-24,3,1,1.8,'#fff2dc')}${e(26,3,1,1.8,'#fff2dc')}</g></g>${p('M-8 21q8 8 17-2','none','#576d70',1.5,'data-life-mouth')}</g>${p('M-37 49l-4 12 17-8m39-1 18 10-3-14','#8da2a0')}${e(-42,22,8,3,'#bc9f87')}${e(41,22,8,3,'#bc9f87')}</g></g>`;}
 return {profiles,defs,expression,head,upper,boot,standing,elf,twig,troll,woff};
});

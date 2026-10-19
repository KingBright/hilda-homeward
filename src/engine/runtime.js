Homeward.define("engine/runtime", ["engine/phaser-stage", "engine/contraptions", "engine/motion-policy", "art/species-life", "engine/readability", "engine/animal-life", "art/creature-life", "content/staging", "art/cast-acting", "art/cast-motion", "engine/setpiece-motion", "content/setpieces", "art/setpiece-life", "engine/action-track", "content/choreography", "art/performer", "art/chapter-life", "art", "story", "engine/state", "engine/audio", "engine/dom", "engine/storage", "content/items", "engine/camera"], (PhaserStage, Contraptions, MotionPolicy, SpeciesLife, Readability, Animal, CreatureLife, Staging, CastActing, CastMotion, SetpieceMotion, Stage, SetpieceLife, {ActionTrack}, Choreography, Performer, ChapterLife, Art, Story, {fresh,validate,boolFlags,numericFlags,sketches}, Soundscape, {patchSvg}, SaveStore, Items, {focusFrame}) => {
const $=id=>document.getElementById(id), KEY='hilda-echoes-homeward-v3', BACKUP=KEY+'-backup';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
let s=fresh(),saved=null,storageOK=true,storageWarned=false;
let store;
try{store=new SaveStore(localStorage,validate,KEY);saved=store.load();}
catch{storageOK=false;store=new SaveStore({getItem(){return null;},setItem(){throw Error('Storage unavailable');}},validate,KEY);}
let dragPreview=null;
let inspection=false,renderQueued=false,rainNodes=[],currentInteraction=null,walkDistance=0,walkAmount=0;

let started=false,titleMode=true,selected=null,bagOpen=false,modal=false,dialogue=null,activeHotspots=[],pendingMove=null,activeWork=null,sequenceActive=false,locked=false,thoughtOpen=false,thoughtTimer=null,contraptionZones=[];
let hero={x:790,y:822,face:1},petX=714,saveTimer,toastTimer,labelTimer,revealTimer,chapterTimer,transitionTimer,saveIndicatorTimer;
const pet=new Animal.Follower(petX,1);
let camera={x:0,y:0,w:1600,h:900,manual:false},input=null,inventoryDrag=null,frameTime=0,elapsed=0,sceneClock=0,lastRenderTime=0,focusBeforePanel=null;
let panelReturn='',pauseRestoreFocus=null,sceneRequest=0;
const ui={game:$('game'),world:$('world'),viewport:$('viewport'),phaserStage:$('phaserStage'),thoughtBubble:$('thoughtBubble'),contraptionModal:$('contraptionModal')};
PhaserStage.stage.mount(ui.phaserStage);
let audio=null;
function sound(kind){
 if(!s.settings.sound||document.hidden)return;
 try{
  if(!audio)audio=new Soundscape(()=>s.settings);
  audio.resume().catch(()=>{});
  audio.scene(s.scene);
  audio.effect(kind);
 }catch(e){
  s.settings.sound=false;updateTools();
  toast('这个浏览器暂时无法开启声音，所有谜题仍可通过画面完成。');
 }
}
function audioState(){return {dialogue:!!dialogue,menu:modal,danger:s.danger,flags:s.f};}
function setSound(on){
 s.settings.sound=on;
 const failed=()=>{s.settings.sound=false;audio?.pause();updateTools();save();toast('声音暂不可用。可以继续无声游玩。');};
 try{
  if(on){
   if(!audio)audio=new Soundscape(()=>s.settings);
   audio.resume().then(()=>{if(s.settings.sound&&!document.hidden){audio.scene(s.scene);audio.update(audioState());}}).catch(failed);
  }else audio?.pause();
 }catch{failed();}
 updateTools();save();
}
function save(immediate=false){if(!started)return;clearTimeout(saveTimer);const write=()=>{s.heroX=hero.x;s.savedAt=new Date().toISOString();try{store.save(s);storageOK=true;saved=clone(s);$('saveDot').classList.add('saved');clearTimeout(saveIndicatorTimer);saveIndicatorTimer=setTimeout(()=>$('saveDot').classList.remove('saved'),1000);}catch(e){storageOK=false;if(!storageWarned){storageWarned=true;toast('浏览器阻止了自动存档。可以在暂停菜单中导出进度。');}}};if(immediate)write();else saveTimer=setTimeout(write,160);}
function toast(t,time=3300){$('toast').classList.remove('thought');$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),time);}
function think(t,time=3300){toast(t,time);$('toast').classList.add('thought');}
function actionLabel(t,sticky=false){$('actionLabel').textContent=t;$('actionLabel').classList.add('show');clearTimeout(labelTimer);if(!sticky)labelTimer=setTimeout(()=>$('actionLabel').classList.remove('show'),3800);}
function setFlag(k,v=true){if(!boolFlags.has(k)&&!numericFlags[k])throw Error('Unknown state key '+k);s.f[k]=v;commit();}
function commit(){if(!renderQueued){renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}save();}
let pendingRewards=[];
function flushRewards(){
 if(!pendingRewards.length||dialogue)return;
 const items=pendingRewards.splice(0,pendingRewards.length);
 renderInventory();
 think('获得'+items.map(k=>'「'+Story.items[k]+'」').join('、')+' · 已收入背包。');
 sound('warm');
 $('bagBtn').animate?.([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:380});
}
function take(k,announce=true){
 if(!Object.hasOwn(Story.items,k))throw Error('Unknown item '+k);
 if(!s.inventory.includes(k))s.inventory.push(k);
 if(announce==='silent'){renderInventory();save();return;}
 if(!announce||dialogue){
  if(!pendingRewards.includes(k))pendingRewards.push(k);
  renderInventory();save();
  queueMicrotask(()=>{if(!dialogue)flushRewards();});
  return;
 }
 renderInventory();save();
 think('获得「'+Story.items[k]+'」· 已收入背包。');
 sound('warm');
 $('bagBtn').animate?.([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:380});
}
function consume(k){s.inventory=s.inventory.filter(v=>v!==k);pendingRewards=pendingRewards.filter(v=>v!==k);if(selected===k)selected=null;renderInventory();save();}
function addNote(k){if(!s.notes.includes(k)){s.notes.push(k);save();} }
function sketch(k,title,body){if(!Object.hasOwn(sketches,k))return;const freshSketch=!s.sketches.includes(k);if(freshSketch){s.sketches.push(k);save();}say([['希尔达',body]],()=>{if(freshSketch)toast('观察手记 '+s.sketches.length+' / 6 · '+title);});}
function combo(a,b){const output=Items.recipeFor(a,b);if(!output)return false;consume(a);consume(b);take(output,'silent');selected=output;renderInventory();toast(output==='shade'?'组合完成 · 把围巾叠在提灯一侧做成遮光屏风，光线柔和了':'组合完成 · '+Story.items[output]);sound('wood');return true;}
function selectItem(id){if(!s.inventory.includes(id))return;if(selected===id){selected=null;}else if(selected&&!combo(selected,id)){selected=id;}else if(!selected)selected=id;renderInventory();if(selected){toggleBag(false);think('先把'+Story.items[selected]+'拿在手里。');}}
function toggleBag(force){if(activeWork&&force!==false)return;if(force!==false&&!bagOpen&&pendingMove?.after)pendingMove=null;bagOpen=typeof force==='boolean'?force:!bagOpen;$('pocket').classList.toggle('hidden',!bagOpen);$('bagBtn').setAttribute('aria-expanded',String(bagOpen));renderInventory();}
function renderInventory(){
 const visibleItems=dialogue&&pendingRewards.length?s.inventory.filter(k=>!pendingRewards.includes(k)):s.inventory;
 $('bagCount').textContent=visibleItems.length;
 $('items').innerHTML=visibleItems.length?visibleItems.map(k=>`<button class="item ${selected===k?'selected':''}" data-item="${k}" aria-label="${esc(Story.items[k])}" aria-pressed="${selected===k}">${Art.itemArt(k)}<span>${esc(Story.items[k])}</span></button>`).join(''):'<p style="font-size:11px;color:#becabb;margin:8px">背包还空着。带上一点好奇心就好。</p>';
 document.querySelectorAll('.item').forEach(el=>{el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();inventoryDrag={id:el.dataset.item,startX:e.clientX,startY:e.clientY,moved:false,pid:e.pointerId};el.setPointerCapture?.(e.pointerId);});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectItem(el.dataset.item);}});});
 $('selection').classList.toggle('hidden',!selected);$('selection').querySelector('span').textContent=selected?'使用 '+Story.items[selected]:'';
 $('pocketCaption').textContent=selected?'已选择 '+Story.items[selected]+' · 放到目标上，或再选物品组合':'选择或拖动物品，放到场景中的目标上。';
 ui.world.style.cursor=selected?'crosshair':'';
}
function updateTools(){[['audioBtn',s.settings.sound?'sound':'muted'],['revealBtn','eye'],['fullBtn','full'],['menuBtn','menu']].forEach(([id,ico])=>$(id).innerHTML=Art.icon(ico));$('journalBtn').querySelector('span').innerHTML=Art.icon('book');$('bagBtn').querySelector('span').innerHTML=Art.icon('bag');$('audioBtn').setAttribute('aria-label',s.settings.sound?'关闭声音':'开启声音');$('audioBtn').classList.toggle('active',s.settings.sound);ui.game.classList.toggle('reduced',s.settings.reduced);}
function closeInspection(){inspection=false;ui.game.classList.remove('inspecting');$('focusExit').classList.add('hidden');$('focusBtn').classList.remove('active');if(started)calcCamera(true);}
function toggleInspection(){
 if(!canAct())return;
 if(inspection){closeInspection();return;}
 inspection=true;pendingMove=null;Object.assign(camera,focusFrame(s.scene,innerWidth/innerHeight));
 ui.game.classList.add('inspecting');$('focusExit').classList.remove('hidden');$('focusBtn').classList.add('active');setView();
 actionLabel('拖动空白处平移画面。机关仍可直接操作；E 或上方按钮返回全景。');
}
function inspectItem(id){
 if(!id||!Items.itemSpecs[id]||!s.inventory.includes(id)||!started||dialogue||activeWork||sequenceActive)return;
 const spec=Items.itemSpecs[id];toggleBag(false);
 showPanel(`<div class="item-panel"><div class="eyebrow">AN OBJECT WITH A STORY</div><h2>${esc(Story.items[id])}</h2><span class="material-label">${esc(spec.material)}</span><div class="item-hero">${Art.itemArt(id)}</div><p>${esc(spec.detail)}</p><p id="itemHint">${esc(spec.hint)}</p><div class="btnrow"><button class="panelBtn primary" id="useInspected">拿在手里</button><button class="panelBtn" id="putInspected">收好物品</button></div></div>`,'item');
 $('useInspected').onclick=()=>{selected=id;closePanel();renderInventory();};
 $('putInspected').onclick=()=>{selected=null;closePanel();renderInventory();};
}
function calcCamera(reset=false){if(inspection&&!reset){setView();return;}let ww=innerWidth,hh=innerHeight,ratio=ww/hh;if(ratio>=16/9){camera.w=1600;camera.h=1600/ratio;camera.x=0;camera.y=reset||!camera.manual?Math.max(0,900-camera.h):clamp(camera.y,0,900-camera.h);}else{camera.h=900;camera.w=900*ratio;camera.y=0;if(reset||!camera.manual)camera.x=clamp(hero.x-camera.w*.45,0,1600-camera.w);else camera.x=clamp(camera.x,0,1600-camera.w);}setView();}
function setView(){ui.world.setAttribute('viewBox',`${camera.x.toFixed(2)} ${camera.y.toFixed(2)} ${camera.w.toFixed(2)} ${camera.h.toFixed(2)}`);$('panLeft').style.opacity=camera.x<1?'.25':'.85';$('panRight').style.opacity=camera.x+camera.w>1599?'.25':'.85';}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function worldPoint(x,y){const ctm=ui.world.getScreenCTM?.();if(ctm&&ctm.a&&ctm.d){const pt=new DOMPoint(x,y).matrixTransform(ctm.inverse());return {x:pt.x,y:pt.y};}const r=ui.world.getBoundingClientRect();return {x:camera.x+(x-r.left)/r.width*camera.w,y:camera.y+(y-r.top)/r.height*camera.h};}
function atPoint(p){return Readability.pick(activeHotspots,p);}
function actorWorldPos(el){
 let x=0,y=0,cur=el?.parentElement;
 while(cur&&cur!==ui.world){
  const tr=cur.getAttribute('transform')||'';
  const m=tr.match(/translate\(\s*([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)\s*\)/);
  if(m){x+=Number(m[1]);y+=Number(m[2]);}
  cur=cur.parentElement;
 }
 return {x,y};
}
function render(){
 const index=titleMode?7:s.scene,artState=titleMode?{...s,scene:7}:s,scene=Story.scenes[index];
 const visualState=dragPreview?.kind==='ladder'?{...artState,f:{...artState.f,ladderX:dragPreview.x}}:dragPreview?.kind==='beacon'?{...artState,beaconAngle:dragPreview.angle}:artState;
 let layers=Art.scene(visualState,titleMode);
 const dog=!(s.scene===9&&!s.f.twigSafe)&&!titleMode;
 let followers='';if(!titleMode&&[2,3,4,7].includes(s.scene))followers+=`<g id="davidFollow">${Art.person('大卫',0,0,1.34)}</g>`;if(!titleMode&&s.scene===4)followers+=`<g id="fridaFollow">${Art.person('芙丽达',0,0,1.38)}</g>`;
 patchSvg(ui.world,Art.defs+`<g clip-path="url(#worldClip)"><g id="scenery">${layers}</g><g id="actors">${followers}<g id="heroPosition"><g id="heroFacing">${Performer.markup()}</g></g>${dog?`<g id="twigPosition">${Art.twig(0,0,.98)}</g>`:''}</g><rect width="1600" height="900" fill="url(#grain)" opacity=".15" style="mix-blend-mode:soft-light" pointer-events="none"/><g id="actionFX" pointer-events="none"></g>${Art.foreground(artState)}${Art.weather(artState)}<g id="workRing" pointer-events="none" opacity="0"><circle r="16" fill="#14333c99" stroke="#e1d3a53a" stroke-width="2"/><circle id="workProgress" r="16" fill="none" stroke="#f2d79d" stroke-width="2" stroke-dasharray="100.53" stroke-dashoffset="100.53" transform="rotate(-90)"/></g></g><g id="hotspotLayer"></g>`);
 Readability.prepare(ui.world);
 CastActing.refresh(ui.world);CreatureLife.refresh(ui.world);SpeciesLife.refresh(ui.world);
 activeHotspots=titleMode?[]:Readability.order(Story.scenes[s.scene].hotspots(s));
 patchSvg($('hotspotLayer'),activeHotspots.map(h=>`<g class="hotspot ${h.kind==='exit'?'isExit':''}" data-hotspot="${h.id}" data-kind="${h.kind||'interact'}" role="button" tabindex="0" aria-label="${esc(h.label)}"><rect class="hit" x="${h.x-h.w/2}" y="${h.y-h.h/2}" width="${h.w}" height="${h.h}"/><g class="hotmark" transform="translate(${h.x} ${h.y})"><circle r="${h.kind==='exit'?16:10}" fill="#173841d9" stroke="#e3d29a" stroke-width="1.2"/>${h.kind==='exit'?Art.path(h.id==='back'?'M7 0H-7m5-5-5 5 5 5':'M-7 0H7m-5-5 5 5-5 5','none','#f0dbab',1.5):Art.circle(0,0,2,'#e8d7ab')}</g></g>`).join(''));
 document.querySelectorAll('.hotspot').forEach(el=>{el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){if(dialogue||modal)return;e.preventDefault();e.stopPropagation();interact(el.dataset.hotspot);}};el.onfocus=()=>{const h=activeHotspots.find(h=>h.id===el.dataset.hotspot);if(h&&camera.w<1550){camera.manual=true;camera.x=clamp(h.x-camera.w*.5,0,1600-camera.w);setView();}else if(h&&camera.h<850){camera.manual=true;camera.y=clamp(h.y-camera.h*.5,0,900-camera.h);setView();}};});
 rainNodes=[...ui.world.querySelectorAll('[data-rain]')];
 updateActors();calcCamera();renderInventory();updateTools();
 $('actLabel').textContent=scene.actLabel;$('sceneName').textContent=scene.name;$('sceneMood').textContent=scene.mood;
 $('hazard').classList.toggle('hidden',!!(titleMode||s.scene!==9||s.f.roofDone));$('hazard').querySelector('span').textContent=s.settings.relaxed?'舒缓模式 · 从容救援':'风暴正在逼近';
 if(s.scene===9){$('hazard').querySelector('b').style.width=s.danger*100+'%';$('hazard').setAttribute('aria-valuenow',String(Math.round(s.danger*100)));}
}
function updateActors(){
 const p=$('heroPosition');if(!p)return;
 const index=titleMode?7:s.scene,ground=Story.scenes[index].ground;
 hero.y=ground(hero.x,s);
 const presentation=SetpieceMotion.actor(index===9&&s.f.roofDone?{...hero,x:1392,y:575}:hero,activeWork,s.settings.reduced);
 p.setAttribute('transform',`translate(${presentation.x.toFixed(1)} ${presentation.y.toFixed(1)})`);
 p.setAttribute('class',(pendingMove?'walking ':'')+(activeWork?'working ':''));
 const placement=Choreography.companion(index,s,hero.x),d=$('davidFollow'),fr=$('fridaFollow');
 if(d){d.setAttribute('transform',`translate(${placement.david} ${ground(placement.david,s)+4})`);d.classList.toggle('bracing',!!placement.bracing);}
 if(fr)fr.setAttribute('transform',`translate(${placement.frida} ${ground(placement.frida,s)+7})`);
 ChapterLife.animate(ui.world,activeWork,s);
 SetpieceLife.animate(ui.world,activeWork,s,dragPreview);
 if(!isPaused()){
  if(dialogue&&!activeWork&&!pendingMove){
   const lineWho=dialogue.lines[dialogue.index]?.[0];
   const partner=(lineWho&&lineWho!=='希尔达')?lineWho:dialogue.lines.map(l=>l[0]).find(w=>w&&w!=='希尔达');
   if(partner){
    const pNode=[...ui.world.querySelectorAll(`[data-cast="${partner}"]`)].find(n=>!n.closest('#heroPosition'));
    if(pNode){
     const px=actorWorldPos(pNode).x;
     if(Math.abs(px-presentation.x)>8){hero.face=px<presentation.x?-1:1;pet.side=hero.face;}
    }
   }
  }
  for(const node of ui.world.querySelectorAll('[data-cast="妈妈"],[data-cast="大卫"],[data-cast="芙丽达"]')){
   if(node.closest('#heroPosition'))continue;
   const nx=actorWorldPos(node).x;
   let face=node.getAttribute('transform')==='scale(-1 1)'?-1:1;
   if(index===2&&node.dataset.cast==='大卫'&&!s.f.bridge&&!dialogue)face=1;
   else if(index===9&&node.dataset.cast==='大卫'&&s.f.roofBrace&&!s.f.fridaSafe&&!dialogue)face=-1;
   else if(Math.abs(presentation.x-nx)>10)face=presentation.x<nx?-1:1;
   const tf=face<0?'scale(-1 1)':'';
   if((node.getAttribute('transform')||'')!==tf){
    if(tf)node.setAttribute('transform',tf);else node.removeAttribute('transform');
   }
  }
 }
 $('heroFacing').setAttribute('transform',`scale(${hero.face} 1)`);
 const t=$('twigPosition');
 let petDrawX=petX,petDrawY=ground(petX,s)+1;
 if(t){
  const aboard=index===9&&s.f.roofDone,boarding=activeWork?.score.effect==='roofBoard'&&!s.settings.reduced;
  const k=aboard?1:boarding?SetpieceMotion.segment(activeWork.sample().progress,.14,.78):0;
  petDrawX=petX+(1345-petX)*k;petDrawY=ground(petX,s)+1+(590-ground(petX,s)-1)*k;
  t.setAttribute('transform',`translate(${petDrawX.toFixed(3)} ${petDrawY.toFixed(3)})`);
 }
 Performer.paint($('performer'),{...presentation,time:elapsed,distance:walkDistance+(presentation.travel||0),moving:presentation.moving??!!pendingMove,walkAmount:presentation.walkAmount??walkAmount,reduced:s.settings.reduced,action:activeWork,selected,scene:index,flags:s.f});
 CastMotion.animate(ui.world,elapsed,s.settings.reduced,activeWork,isPaused());
 CreatureLife.paint(ui.world,elapsed,{scene:index,flags:s.f,paused:isPaused(),reduced:s.settings.reduced,pet:{...pet.snapshot(),boarding:activeWork?.score.effect==='roofBoard'},heroX:hero.x,ground:x=>ground(x,s),speaking:!!dialogue});
 const held=activeWork?.score,heldProgress=activeWork?.sample().progress??0;
 for(const id of ['homeLamp','homeBird','northCrank','forestRope','vineHook','gondolaLine','pickup-gearS','pickup-gearM','pickup-gearL','clockFelt']){
  const source=$(id);if(source)source.style.visibility=held?.pickup&&held.source===id&&heldProgress>=.45?'hidden':'';
 }
 const teapot=$('homeTeapot');if(teapot)teapot.style.visibility=held?.kind==='pour'&&heldProgress>.08&&heldProgress<.95?'hidden':'';
 const speaker=dialogue?.lines[dialogue.index]?.[0]||'';
 const listener=[dialogue?.lines[dialogue.index+1]?.[0],dialogue?.lines[dialogue.index-1]?.[0]].find(who=>who&&who!==speaker)||'';
 const acting={scene:index,flags:s.f,speaker,listener,typing:typewriter.busy,character:typewriter.fullText[typewriter.index-1]||'',reduced:s.settings.reduced,paused:isPaused(),working:!!activeWork,moving:!!pendingMove};
 CastActing.paint(ui.world,elapsed,acting);SpeciesLife.paint(ui.world,elapsed,acting);
 if(dialogue){CastActing.paint($('portrait'),elapsed,{...acting,portrait:true,working:false,moving:false});CreatureLife.paint($('portrait'),elapsed,{...acting,portrait:true,speaking:true});SpeciesLife.paint($('portrait'),elapsed,{...acting,portrait:true,working:false});}
 if($('workRing'))$('workRing').setAttribute('transform',`translate(${hero.x} ${hero.y-245})`);
 PhaserStage.stage.syncFrame({
  state:s,
  titleMode,
  elapsed,
  hero:presentation,
  petSnapshot:{...pet.snapshot(),x:petDrawX,y:petDrawY},
  camera,
  moving:presentation.moving??!!pendingMove,
  walkDistance:walkDistance+(presentation.travel||0),
  walkAmount:presentation.walkAmount??walkAmount,
  activeWork,
  selected,
  paused:isPaused()
 });
 if(thoughtOpen&&ui.thoughtBubble){
  const r=ui.world.getBoundingClientRect();
  const sx=r.left+(presentation.x-camera.x)/camera.w*r.width;
  const sy=r.top+(presentation.y-210-camera.y)/camera.h*r.height;
  ui.thoughtBubble.style.setProperty('--thought-x',`${clamp(sx,120,innerWidth-140).toFixed(1)}px`);
  ui.thoughtBubble.style.setProperty('--thought-y',`${clamp(sy,120,innerHeight-140).toFixed(1)}px`);
 }
}

function isPaused(){return modal||document.hidden||titleMode;}
function canAct(){return started&&!isPaused()&&!dialogue&&!locked&&!activeWork&&!sequenceActive;}
function walkLimit(x){if(s.scene===2&&!s.f.bridge)return clamp(x,135,545);if(s.scene===9&&!s.f.davidSafe)return clamp(x,200,466);if(s.scene===10&&!s.f.reunited)return clamp(x,145,1036);return clamp(x,90,1510);}
function walkTo(x,after){x=walkLimit(x);if(!inspection)camera.manual=false;if(Math.abs(x-hero.x)<8){after?.();return;}hero.face=x<hero.x?-1:1;pendingMove={target:x,after,speed:0};$('hoverLabel').classList.remove('show');}
/** Pointer, keyboard, inventory drops and scene drags use the same arrival boundary. */
function arriveAndAct(h,item,invoke){
 const scene=s.scene,request=sceneRequest;
 const planned=Choreography.score(scene,h.id,s,item,hero.x);
 const resolved=Choreography.resolveApproach(scene,h,planned,s,hero.x,walkLimit);
 walkTo(resolved.approachX,()=>{
  if(request!==sceneRequest||scene!==s.scene||!canAct())return;
  const live=Story.scenes[scene].hotspots(s).find(v=>v.id===h.id);
  if(!live||item&&(!s.inventory.includes(item)||!Items.canUse(scene,h.id,item)))return;
  const targetX=resolved.targetX??planned.target?.[0]??live.x;
  if(Math.abs(targetX-hero.x)>4){hero.face=targetX<hero.x?-1:1;pet.side=hero.face;}
  currentInteraction={scene,id:h.id,item,target:[targetX,live.y]};
  try{invoke();if(item&&selected===item){selected=null;renderInventory();}save();}
  catch(e){console.error('Interaction failed:',e);toast('动作没有完成，物品和进度仍保留。可以重新尝试。');}
  finally{currentInteraction=null;}
 });
}
function interact(id,itemOverride){
 if(!canAct())return;
 const h=activeHotspots.find(v=>v.id===id);if(!h)return;
 let item=itemOverride??selected;
 if(item&&!s.inventory.includes(item))return;
 if(item&&itemOverride===undefined&&(h.kind==='exit'||h.kind==='take'||!Items.acceptsItem(s.scene,id)))item=null;
 if(item&&!Items.canUse(s.scene,id,item)){sound('wood');think('「'+Story.items[item]+'」不适合这个位置。先取消选中，再观察「'+h.label+'」。');return;}
 toggleBag(false);$('hoverLabel').classList.remove('show');
 arriveAndAct(h,item,()=>Story.scenes[s.scene].act(G,id,item));
}
function sceneDrag(down,payload){
 const h=down.h;if(!h)return;
 dragPreview=null;
 const dist=Math.hypot(payload.x-down.x,payload.y-down.y);
 if(!h.drag||!Story.scenes[s.scene].drag){
  if(atPoint(payload)?.id===h.id||dist<48)interact(h.id);
  return;
 }
 // Live dragging is a preview. Restore it before walking and committing the action.
 render();toggleBag(false);
 arriveAndAct(h,null,()=>{
  if(!Story.scenes[s.scene].drag(G,h.id,payload)){
   if(dist<52)Story.scenes[s.scene].act(G,h.id,null);
   else toast('拖动后放在合适的位置。也可以点按操作。');
  }
 });
}

let typewriter={timer:null,fullText:'',index:0,who:'',busy:false};
function say(lines,after){if(!Array.isArray(lines)||!lines.length){after?.();flushRewards();return;}pendingMove=null;dialogue={lines,index:0,after};toggleBag(false);$('speech').classList.remove('hidden');showLine();}
function showLine(){
 if(!dialogue)return;
 const [who,line]=dialogue.lines[dialogue.index];
 $('speaker').textContent=who;
 $('portrait').innerHTML=Art.portrait(who);
 CastActing.refresh($('portrait'));CreatureLife.refresh($('portrait'));SpeciesLife.refresh($('portrait'));
 $('nextLine').innerHTML=dialogue.index===dialogue.lines.length-1?'继续 <span>›</span>':'继续 <span>›</span>';
 updateActors();
 if(typewriter.timer){clearTimeout(typewriter.timer);typewriter.timer=null;}
 typewriter.fullText=line;
 typewriter.index=0;
 typewriter.who=who;
 typewriter.busy=true;
 $('line').textContent='';
 stepTypewriter();
}
function stepTypewriter(){
 if(!typewriter.busy)return;
 if(modal||document.hidden){typewriter.timer=setTimeout(stepTypewriter,100);return;}
 if(typewriter.index>=typewriter.fullText.length){
  $('line').textContent=typewriter.fullText;
  typewriter.busy=false;
  typewriter.timer=null;
  return;
 }
 const char=typewriter.fullText[typewriter.index];
 typewriter.index++;
 $('line').textContent=typewriter.fullText.slice(0,typewriter.index);
 if(s.settings.sound&&audio&&!/[\s，。！？、…—·：；“”‘’「」\.\,\!\?]/.test(char)){
  if(typewriter.index%2===1)audio.speechBlip(typewriter.who);
 }
 const delay=/[，、；]/.test(char)?110:/[。！？…\.]/.test(char)?180:28;
 typewriter.timer=setTimeout(stepTypewriter,MotionPolicy.dialogueDelay(delay));
}
function nextLine(){
 if(!dialogue||modal)return;
 if(typewriter.busy){
  if(typewriter.timer){clearTimeout(typewriter.timer);typewriter.timer=null;}
  typewriter.busy=false;
  $('line').textContent=typewriter.fullText;
  return;
 }
 dialogue.index++;
 if(dialogue.index>=dialogue.lines.length){
  const cb=dialogue.after;
  dialogue=null;
  $('speech').classList.add('hidden');
  cb?.();
  flushRewards();
  updateActors();
  save();
 }else showLine();
}
function cancelWork(){
 activeWork?.cancel();activeWork=null;currentInteraction=null;
 ui.game.classList.remove('performing');$('actionLabel').classList.remove('show');
}
function work(ms,label,after,override={}){
 if(activeWork)return;
 pendingMove=null;
 const ctx=currentInteraction??{scene:s.scene,id:'work',item:null};
 const score={...Choreography.score(ctx.scene,ctx.id,s,ctx.item,hero.x),...override};
 score.target??=ctx.target??[hero.x+hero.face*45,Story.scenes[s.scene].ground(hero.x,s)-115];
 if(Number.isFinite(score.approachX)&&Math.abs(hero.x-walkLimit(score.approachX))>8){
  walkTo(score.approachX,()=>work(ms,label,after,score));return;
 }
 hero.face=score.target[0]<hero.x?-1:1;
 activeWork=new ActionTrack(MotionPolicy.actionDuration(ms),{...score,origin:{x:hero.x,y:Story.scenes[s.scene].ground(hero.x,s)}});
 activeWork.after=after;activeWork.request=sceneRequest;
 ui.game.classList.add('performing');
 actionLabel(label,true);updateActors();
}
function effect(kind){PhaserStage.stage.triggerEffect(kind,s.settings.reduced);if(s.settings.reduced)return;if(kind==='shake'||kind==='water'){ui.viewport.animate?.([{transform:'translate(0,0)'},{transform:'translate(-4px,2px)'},{transform:'translate(4px,-2px)'},{transform:'translate(-2px,1px)'},{transform:'translate(0,0)'}],{duration:620});}if(kind==='water'&&s.scene!==0){$('flash').classList.remove('lightning');void $('flash').offsetWidth;$('flash').classList.add('lightning');} }
function toggleThoughtBubble(force){
 if(!started||!ui.thoughtBubble)return;
 thoughtOpen=typeof force==='boolean'?force:!thoughtOpen;
 clearTimeout(thoughtTimer);
 if(!thoughtOpen){
  ui.thoughtBubble.classList.add('hidden');
  $('thoughtBtn')?.classList.remove('active');
  return;
 }
 ui.thoughtBubble.innerHTML=Contraptions.doodleMarkup(s.scene,s);
 ui.thoughtBubble.classList.remove('hidden');
 $('thoughtBtn')?.classList.add('active');
 updateActors();
 sound('paper');
 thoughtTimer=setTimeout(()=>toggleThoughtBubble(false),6200);
}
function renderContraptionWorkbench(){
 const dlg=ui.contraptionModal;if(!dlg||!dlg.open)return;
 const spec=Contraptions.specFor(s.scene);
 const steps=spec.steps(s);
 const doneAll=steps.every(st=>st.done);
 dlg.innerHTML=`<div class="contraption-shell"><header class="contraption-header"><div><span class="eyebrow">${esc(spec.code)}</span><h2 id="contraptionTitle">${esc(spec.title)}</h2><p>${esc(spec.subtitle)}</p></div><button type="button" class="closePanel" id="contraptionClose" aria-label="关闭机关工作台">×</button></header><div class="contraption-canvas-wrap"><canvas id="contraptionCanvas" width="720" height="320" aria-label="机械机关拆解蓝图"></canvas></div><div class="contraption-steps" id="contraptionSteps">${steps.map((st,idx)=>`<button type="button" class="contraption-step-btn ${st.done?'done':''}" data-step="${esc(st.id)}"><span>${idx+1}. ${esc(st.label)}</span><b>${st.done?'✓':'⚙'}</b></button>`).join('')}</div><footer class="contraption-footer"><span class="contraption-engine-badge" id="contraptionStatus">${esc(doneAll?'当前场景机关已全部啮合就绪':'点按上方齿轮节点或下方步骤即可联动测试机关')}</span><button type="button" class="panelBtn primary" id="contraptionDoneBtn">回到场景</button></footer></div>`;
 $('contraptionClose')?.addEventListener('click',()=>closeContraptionWorkbench());
 $('contraptionDoneBtn')?.addEventListener('click',()=>closeContraptionWorkbench());
 $('contraptionSteps')?.querySelectorAll('[data-step]').forEach(btn=>{
  btn.onclick=()=>{
   Contraptions.executeContraptionStep(G,s.scene,btn.dataset.step);
   sound('click');
   render();
   renderContraptionWorkbench();
  };
 });
 const cvs=$('contraptionCanvas');
 contraptionZones=Contraptions.drawWorkbenchSchematic(cvs,s.scene,s,elapsed);
 cvs?.addEventListener('click',e=>{
  const r=cvs.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*720,y=(e.clientY-r.top)/r.height*320;
  const hit=contraptionZones.find(z=>x>=z.x&&x<=z.x+z.w&&y>=z.y&&y<=z.y+z.h);
  if(hit){
   Contraptions.executeContraptionStep(G,s.scene,hit.id);
   sound('gear');
   render();
   renderContraptionWorkbench();
  }
 });
}
function closeContraptionWorkbench(){
 const dlg=ui.contraptionModal;
 if(dlg?.open)dlg.close();
 modal=false;
 ui.game.classList.remove('paused');
 $('contraptionBtn')?.classList.remove('active');
}
function openContraptionWorkbench(){
 if(!started||!ui.contraptionModal)return;
 toggleThoughtBubble(false);
 toggleBag(false);
 const dlg=ui.contraptionModal;
 if(dlg.open){closeContraptionWorkbench();return;}
 modal=true;
 ui.game.classList.add('paused');
 $('contraptionBtn')?.classList.add('active');
 dlg.showModal();
 renderContraptionWorkbench();
 sound('gear');
}
if(ui.contraptionModal){
 if(!('closedBy' in HTMLDialogElement.prototype)){
  ui.contraptionModal.addEventListener('click',e=>{if(e.target===ui.contraptionModal)ui.contraptionModal.close();});
 }
 ui.contraptionModal.addEventListener('close',()=>{
  modal=false;
  ui.game.classList.remove('paused');
  $('contraptionBtn')?.classList.remove('active');
 });
}
function pulse(id,n=0){requestAnimationFrame(()=>{const el=$(id)?.querySelector('circle');if(el){el.classList.add('spark-active');setTimeout(()=>el.isConnected&&el.classList.remove('spark-active'),550);}});if(s.settings.sound){try{if(!audio)audio=new Soundscape(()=>s.settings);audio.resume().catch(()=>{});audio.note([293.66,369.99,493.88][n],.7,0,.4);}catch{}}}
async function playSequence(seq){if(sequenceActive)return;sequenceActive=true;actionLabel('石壁上的记号亮起了，跟着光慢慢记住它。',true);let current=s.scene,request=sceneRequest;for(let i=0;i<seq.length;i++){await new Promise(r=>setTimeout(r,i===0?180:850));while(isPaused())await new Promise(r=>setTimeout(r,150));if(s.scene!==current||sceneRequest!==request)break;pulse('tone'+seq[i],seq[i]);toast((i+1)+' / '+seq.length+' · '+['溪流','松针','月亮'][seq[i]],750);}await new Promise(r=>setTimeout(r,650));if(sceneRequest!==request)return;sequenceActive=false;$('actionLabel').classList.remove('show');}
function resetRoof(){if(s.scene!==9||s.f.roofDone)return;cancelPointer();pendingMove=null;cancelWork();s=Stage.retreat(s);hero.x=s.heroX;petX=hero.x-75;pet.reset(petX,hero.face);selected=null;render();say([['芙丽达','先退到稳固的横梁后面，等这阵风过去。'],['希尔达','已经救回的同伴都在，固定好的绳索也还在。我们从安全的地方接着来。']],()=>toast('已退回安全检查点。完成的救援和前面章节都已保留。'));save(true);}
function go(index){cancelPointer();closeInspection();toggleThoughtBubble(false);closeContraptionWorkbench();PhaserStage.stage.setPosture(0);if(index<0||index>=Story.scenes.length)return;sceneRequest++;const request=sceneRequest;locked=true;pendingMove=null;pendingRewards=[];cancelWork();selected=null;toggleBag(false);$('transition').classList.add('dark');$('hoverLabel').classList.remove('show');clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>{if(request!==sceneRequest)return;clearTimeout(chapterTimer);s.scene=index;hero.x=Story.scenes[index].start;petX=hero.x-Staging.petDistance(index);pet.reset(petX,1);camera.manual=false;sceneClock=0;if(!s.visited.includes(index))s.visited.push(index);if(index===9&&!s.f.roofDone)s.danger=0;render();calcCamera(true);$('sceneLabel').classList.remove('quiet');if(s.settings.sound&&audio)audio.scene(index);save(true);$('transition').classList.remove('dark');let first=!s.seen.includes(index);if(first)s.seen.push(index);transitionTimer=setTimeout(()=>{if(request!==sceneRequest)return;locked=false;if(first)say(Story.scenes[index].intro);save();},first&&Story.scenes[index].chapter?1300:380);},MotionPolicy.sceneTransition(s.settings.reduced));}
function chapter(data){const el=$('chapterCard');el.querySelector('span').textContent=data[0];el.querySelector('h2').textContent=data[1];el.querySelector('p').textContent=data[2];el.classList.remove('hidden');el.style.animation='none';void el.offsetWidth;el.style.animation='';clearTimeout(chapterTimer);chapterTimer=setTimeout(()=>el.classList.add('hidden'),3700);}
function start(resume=false){walkAmount=0;dragPreview=null;pendingRewards=[];closeInspection();toggleThoughtBubble(false);closeContraptionWorkbench();PhaserStage.stage.setPosture(0);clearTimeout(typewriter.timer);typewriter.busy=false;clearTimeout(transitionTimer);clearTimeout(chapterTimer);clearTimeout(saveTimer);if(resume&&saved)s=clone(saved);else{s=fresh();saved=null;}started=true;titleMode=false;selected=null;dialogue=null;cancelWork();pendingMove=null;sequenceActive=false;modal=false;locked=false;bagOpen=false;input=null;inventoryDrag=null;hideGhost();$('pocket').classList.add('hidden');sceneRequest++;$('titleScreen').classList.add('hidden');$('speech').classList.add('hidden');$('panelLayer').classList.add('hidden');$('chapterCard').classList.add('hidden');ui.game.classList.remove('paused');hero.x=s.heroX||Story.scenes[s.scene].start;petX=hero.x-Staging.petDistance(s.scene);pet.reset(petX,1);camera.manual=false;render();calcCamera(true);if(audio)setSound(s.settings.sound);if(resume){if(!s.visited.includes(s.scene))s.visited.push(s.scene);if(s.settings.sound)setSound(true);if(s.scene===9&&!s.f.roofDone)s.danger=0;save();}else go(0);}
function finish(){save(true);say([['希尔达','手记最后一行：本次夜行，所有同行者均已安全抵达。'],['妈妈','很好。现在，把第一句话讲给我们听吧。']],openEnding);}
function showPanel(html,type='menu'){cancelPointer();focusBeforePanel=document.activeElement;panelReturn=type;modal=true;ui.game.classList.add('paused');$('panelLayer').classList.remove('hidden');$('panel').innerHTML=`<button class="closePanel" aria-label="回到冒险" data-close>×</button>${html}`;$('panel').querySelector('[data-close]').addEventListener('click',closePanel);$('panel').focus();$('hoverLabel').classList.remove('show');audio?.update(audioState());}
function closePanel(){modal=false;$('panelLayer').classList.add('hidden');ui.game.classList.remove('paused');audio?.update(audioState());if(focusBeforePanel&&focusBeforePanel.isConnected)focusBeforePanel.focus({preventScroll:true});}
function openMenu(){if(!started)return;showPanel(`<div class="eyebrow">TAKE A BREATH</div><h2>旅途中的一小会儿</h2><p>${esc(Story.scenes[s.scene].name)}<br><span class="progressText">已到访 ${s.visited.length} / 12 个场景 · 观察手记 ${s.sketches.length} / 6</span></p><div class="settingsRow"><span>环境音乐与机关音效</span><button id="soundSetting">${s.settings.sound?'已开启':'已关闭'}</button></div><div class="audioMix" aria-label="声音混音">${[['musicVolume','配乐'],['ambienceVolume','环境'],['effectsVolume','机关音效'],['voiceVolume','对白提示音']].map(([key,label])=>`<label for="${key}"><span>${label}</span><input id="${key}" data-volume="${key}" type="range" min="0" max="100" step="1" value="${Math.round(s.settings[key]*100)}"><output for="${key}">${Math.round(s.settings[key]*100)}%</output></label>`).join('')}</div><div class="settingsRow"><span>舒缓模式 <small>· 屋顶风暴不计时</small></span><button id="relaxSetting">${s.settings.relaxed?'已开启':'已关闭'}</button></div><div class="settingsRow"><span>减少动态与闪光</span><button id="motionSetting">${s.settings.reduced?'已开启':'已关闭'}</button></div><div class="btnrow"><button class="panelBtn primary" id="resumePlay">回到冒险</button><button class="panelBtn" id="helpOpen">操作说明</button></div><div class="btnrow"><button class="panelBtn" id="exportBtn">导出进度</button><button class="panelBtn" id="importBtn">导入进度</button><button class="panelBtn danger" id="restartBtn">重新开始</button></div><p class="fineprint">${storageOK?'进度自动保存在当前浏览器。关闭网页不会抹去已完成的章节。':'此浏览器阻止了本地存储。请用“导出进度”保留旅程。'}<br>暂停菜单、手记、背包、对话和机关操作期间，风暴计时会暂停。</p>`,'menu');
 $('panel').querySelectorAll('[data-volume]').forEach(el=>{el.oninput=()=>{s.settings[el.dataset.volume]=Number(el.value)/100;el.nextElementSibling.textContent=el.value+'%';audio?.update(audioState());save();};});
 $('resumePlay').onclick=closePanel;$('helpOpen').onclick=openHelp;$('soundSetting').onclick=()=>{setSound(!s.settings.sound);openMenu();};$('relaxSetting').onclick=()=>{s.settings.relaxed=!s.settings.relaxed;save();render();openMenu();};$('motionSetting').onclick=()=>{s.settings.reduced=!s.settings.reduced;save();render();openMenu();};$('exportBtn').onclick=exportSave;$('importBtn').onclick=()=>{$('importFile').value='';$('importFile').click();};$('restartBtn').onclick=confirmRestart;
}
function openHelp(){showPanel(`<div class="eyebrow">THE WORLD IS THE INTERFACE</div><h2>用好奇心来操作</h2><h3>在场景里行动</h3><p>点击地面，希尔达会走过去。点击人物、门、物件，她会走近后互动。拾取、拉绳、转轮和挑杆都有接触动作；完成前离开或重载，不会提前消耗道具。手记只在你打开时出现，没有常驻任务列表。</p><h3>物件与机关</h3><p>打开背包，选择一件物品，再点场景目标；也可以直接拖过去。选中物品后背包会收起，避免遮挡场景；再打开背包，点另一件物品可以尝试组合。雨棚绳圈、档案梯子、配重和信标均可拖动，也都有点击或键盘操作。修桥要与大卫分工；清滤网前先关闭进水闸。档案梯要先对准并锁轮；救回大卫后，请他稳住支点再撬梁。操作机关时，希尔达和同伴会交流发现；需要时也可打开手记。</p><h3>看清整个世界</h3><p>手机建议横屏。竖屏可在空白处左右拖动画面，或点击边缘箭头；超宽屏可上下拖动画面查看高处。点击眼睛按钮，或按 H，会短暂标出能互动的对象。背包物品不需要丢弃。</p><h3>键盘和节奏</h3><p>Tab 选择对象，Enter / 空格互动；方向键移动；I 打开背包，J 打开手记，T 展开涂鸦想法气泡，C 打开机关拆解台，H 显示线索对象，F 切换全屏，Esc 暂停。对话可点“继续”或按空格。浏览器不支持系统全屏时，游戏仍铺满网页视口。</p><p>只有屋顶救援有风暴压力。风暴逼近时会退到安全检查点，已救回的同伴、已固定的绳索和前面章节都会保留。开启舒缓模式后不计时，剧情和结局相同。声音不是任何谜题的必要条件。</p><p class="fineprint">这是《希尔达》的非官方同人互动故事。剧情与代码矢量画面为本版本原创，不包含动画截图、配音或原声音乐。灵感参考的是场景式点触冒险的交互，不是《机械迷城》的素材或故事。</p><div class="btnrow"><button class="panelBtn primary" id="helpBack">回到冒险</button></div>`,'help');$('helpBack').onclick=closePanel;}
function openJournal(){if(!started)return;const count=s.hints[s.scene];const hints=Story.scenes[s.scene].hints(s);const hint=hints[Math.min(hints.length-1,Math.max(0,count-1))];showPanel(`<div class="eyebrow">FIELD NOTES · ${String(s.scene+1).padStart(2,'0')}</div><h2>这次冒险的手记</h2><h3>眼前的一步</h3><p>${esc(Story.scenes[s.scene].objective(s))}</p>${count?`<p class="spoiler-hint">提示 ${count} / 3<br>${esc(hint)}</p>`:''}<div class="btnrow"><button class="panelBtn" id="hintBtn">${count<3?'给我一点'+(count?'更明确的':'')+'提示':'查看明确提示'}</button><button class="panelBtn primary" id="backFromNotes">收好手记</button></div><h3>已经发现的事</h3>${s.notes.length?s.notes.map(k=>`<div class="journalNote"><h3>${esc(Story.notes[k][0])}</h3><p>${esc(Story.notes[k][1])}</p></div>`).join(''):'<p>第一页还空着。故事会随着你的脚步慢慢展开。</p>'}<h3>路边的小小发现 ${s.sketches.length} / 6</h3>${s.sketches.map(k=>`<div class="journalNote"><h3>${esc(sketches[k][0])}</h3><p>${esc(sketches[k][1])}</p></div>`).join('')}<p class="fineprint">提示不扣分，也不会改变结局。尚未发生的剧情不会提前写在这里。</p>`,'journal');$('hintBtn').onclick=()=>{s.hints[s.scene]=Math.min(3,s.hints[s.scene]+1);save();openJournal();};$('backFromNotes').onclick=closePanel;}
function openEnding(){showPanel(`<div class="eyebrow">EVERYONE MADE IT HOME</div><h2>所有人，平安归来。</h2><p>希尔达把围巾留给了一个害怕黑夜的孩子。<br>山里的灯照见了一对母子。<br>城里的窗，等回了一群朋友。</p><div class="journalNote"><h3>本次夜行 · 安全记录</h3><p>希尔达、芙丽达、大卫、枝枝、阿尔弗：全部平安。<br>小巨魔：已与妈妈团聚。<br>妈妈：不用再守着那盏灯等了。</p></div><p class="progressText">十二幕旅程 · ${s.sketches.length} / 6 幅观察手记 · 完整归家结局</p><p>窗外的钟声再一次响起。很轻，很准。<br>这次，它只是在提醒大家：早饭时间到了。</p><div class="btnrow"><button class="panelBtn primary" id="stayHome">留在客厅里</button><button class="panelBtn" id="endingExport">保存这次旅程</button></div><p class="fineprint">《黄昏的回声：归途》 · 非官方同人作品<br>没有必须马上开始的下一次冒险。你可以和朋友继续说说话。</p>`,'ending');$('stayHome').onclick=closePanel;$('endingExport').onclick=exportSave;}
function confirmRestart(){showPanel(`<div class="eyebrow">A NEW FIRST PAGE</div><h2>重新翻开第一页？</h2><p>新旅程会替换这个浏览器中的 V3 当前进度。第一版《黄昏的回声》的存档不受影响。先导出一份存档，就能保留这次冒险。</p><div class="btnrow"><button class="panelBtn" id="cancelRestart">继续现在的旅程</button><button class="panelBtn danger" id="confirmRestart">确认重新开始</button></div><div class="btnrow"><button class="panelBtn" id="beforeRestartExport">先导出当前进度</button></div>`,'confirm');$('cancelRestart').onclick=closePanel;$('confirmRestart').onclick=()=>{closePanel();start(false);};$('beforeRestartExport').onclick=exportSave;}
function exportSave(){save(true);const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='hilda-homeward-v2-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('进度文件已生成。请妥善保留。');}
async function importSave(file){if(!file)return;if(file.size>256000)return toast('这份文件太大，不像有效的游戏存档。');try{const v=validate(JSON.parse(await file.text()));showPanel(`<div class="eyebrow">CONTINUE A JOURNEY</div><h2>载入这份进度？</h2><p>地点：${esc(Story.scenes[v.scene].name)}<br>已探索：${v.visited.length} / 12 个场景。</p><p>载入后将替换当前 V3 进度。取消不会改变正在进行的旅程。</p><div class="btnrow"><button class="panelBtn" id="cancelImport">取消</button><button class="panelBtn primary" id="confirmImport">确认载入</button></div>`,'import');$('cancelImport').onclick=closePanel;$('confirmImport').onclick=()=>{saved=clone(v);closePanel();start(true);save(true);};}catch(e){toast('无法载入：'+e.message);}}
function reveal(){if(!started)return;ui.world.classList.add('revealing');$('revealBtn').classList.add('active');clearTimeout(revealTimer);revealTimer=setTimeout(()=>{ui.world.classList.remove('revealing');$('revealBtn').classList.remove('active');},3800);actionLabel('人物、机关、出口：留意画面里亮起的轮廓。');}
async function fullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen();}else if(ui.game.requestFullscreen){await ui.game.requestFullscreen();}else toast('当前浏览器不支持系统全屏。游戏仍会铺满网页视口。');}catch{toast('浏览器没有进入系统全屏。可以继续在当前视口游玩。');}}
function setHoveredHotspot(id){ui.world.querySelectorAll('.hotspot.hovered').forEach(el=>{if(el.dataset.hotspot!==id)el.classList.remove('hovered');});if(id)ui.world.querySelector(`.hotspot[data-hotspot="${id}"]`)?.classList.add('hovered');}
function hover(e){if(input?.moved||inventoryDrag||!canAct()){setHoveredHotspot(null);$('hoverLabel').classList.remove('show');return;}const h=atPoint(worldPoint(e.clientX,e.clientY));setHoveredHotspot(h?.id||null);if(!h){$('hoverLabel').classList.remove('show');return;}const prefix=selected&&Items.acceptsItem(s.scene,h.id)?Story.items[selected]+' → ':'';$('hoverLabel').textContent=prefix+h.label;$('hoverLabel').classList.add('show');const r=$('hoverLabel').getBoundingClientRect();$('hoverLabel').style.left=clamp(e.clientX-r.width/2,8,innerWidth-r.width-8)+'px';$('hoverLabel').style.top=clamp(e.clientY+22,8,innerHeight-r.height-85)+'px';}
ui.viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(dialogue&&started&&!isPaused()){e.preventDefault();nextLine();return;}if(!canAct())return;e.preventDefault();if(bagOpen)toggleBag(false);const p=worldPoint(e.clientX,e.clientY),h=atPoint(p),onHero=!h&&Math.abs(p.x-hero.x)<40&&p.y>hero.y-190&&p.y<hero.y;input={sx:e.clientX,sy:e.clientY,x:p.x,y:p.y,camX:camera.x,camY:camera.y,h,onHero,moved:false,postured:false,pid:e.pointerId,oldLadder:s.f.ladderX,oldAngle:s.beaconAngle};ui.viewport.setPointerCapture?.(e.pointerId);});
ui.viewport.addEventListener('pointermove',e=>{if(!input){if(e.pointerType==='mouse')hover(e);return;}if(input.pid!==e.pointerId)return;const dx=e.clientX-input.sx,dy=e.clientY-input.sy;if(Math.hypot(dx,dy)>14)input.moved=true;if(!input.moved)return;setHoveredHotspot(null);$('hoverLabel').classList.remove('show');if(input.onHero&&Math.abs(dy)>Math.abs(dx)*1.3&&Math.abs(dy)>22){input.postured=true;PhaserStage.stage.setPosture(clamp(-dy*.24,-22,18));return;}if(!input.h){camera.manual=true;camera.x=clamp(input.camX-dx/innerWidth*camera.w,0,1600-camera.w);camera.y=clamp(input.camY-dy/innerHeight*camera.h,0,900-camera.h);setView();return;}let p=worldPoint(e.clientX,e.clientY);if(input.h.drag==='ladder'&&!s.f.ladderBrake){dragPreview={kind:'ladder',x:Stage.snapLadder(p.x)};if(performance.now()-lastRenderTime>55){render();lastRenderTime=performance.now();}}else if(input.h.drag==='beacon'&&s.f.fridaSafe&&!s.f.beacon){dragPreview={kind:'beacon',angle:Stage.wheelAngle(p)};if(performance.now()-lastRenderTime>55){render();lastRenderTime=performance.now();}}else if(input.h.drag==='weight'){showGhost('weight'+input.h.value,e.clientX,e.clientY);} });
ui.viewport.addEventListener('pointerup',e=>{if(!input||input.pid!==e.pointerId)return;const down=input;input=null;hideGhost();if(!canAct())return;const p=worldPoint(e.clientX,e.clientY);if(down.moved){if(down.postured){actionLabel('希尔达调整了身姿观察四周。');return;}if(down.h){sceneDrag(down,{x:p.x,y:p.y,dx:(e.clientX-down.sx)/innerWidth*camera.w,dy:(e.clientY-down.sy)/innerHeight*camera.h});return;}if(!inspection&&Math.hypot(e.clientX-down.sx,e.clientY-down.sy)<36&&p.y>140){PhaserStage.stage.setPosture(0);walkTo(p.x,()=>save());}return;}const h=down.h||atPoint(p);if(h)interact(h.id);else if(p.y>140){PhaserStage.stage.setPosture(0);walkTo(p.x,()=>save());}});
function cancelPointer(){input=null;inventoryDrag=null;dragPreview=null;setHoveredHotspot(null);hideGhost();if(started)render();}
ui.viewport.addEventListener('pointercancel',cancelPointer);
window.addEventListener('blur',cancelPointer);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelPointer();});
ui.viewport.addEventListener('pointerleave',()=>{setHoveredHotspot(null);$('hoverLabel').classList.remove('show');});
function showGhost(id,x,y){$('dragGhost').classList.remove('hidden');$('dragGhost').innerHTML=Art.itemArt(id);$('dragGhost').style.left=x+'px';$('dragGhost').style.top=y+'px';}
function hideGhost(){$('dragGhost').classList.add('hidden');}
document.addEventListener('pointermove',e=>{if(!inventoryDrag||inventoryDrag.pid!==e.pointerId)return;const d=inventoryDrag;if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>9)d.moved=true;if(d.moved){showGhost(d.id,e.clientX,e.clientY);const t=document.elementFromPoint(e.clientX,e.clientY);if(!t?.closest('#pocket')){$('pocket').classList.add('hidden');bagOpen=false;}}});
document.addEventListener('pointerup',e=>{if(!inventoryDrag||inventoryDrag.pid!==e.pointerId)return;const d=inventoryDrag;inventoryDrag=null;hideGhost();if(!canAct())return;if(!d.moved){selectItem(d.id);return;}const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-item]');if(el&&el.dataset.item!==d.id){if(!combo(d.id,el.dataset.item)){selected=d.id;renderInventory();toast('这些物品暂时不能组合。');}return;}const h=atPoint(worldPoint(e.clientX,e.clientY));selected=d.id;renderInventory();if(h)interact(h.id,d.id);else{toggleBag(false);toast('物品没有丢失。选好它以后，再点场景里的目标。');}});
document.addEventListener('pointercancel',()=>{inventoryDrag=null;hideGhost();});
$('focusBtn').onclick=toggleInspection;$('focusExit').onclick=closeInspection;$('inspectSelected').onclick=()=>inspectItem(selected);
if($('thoughtBtn'))$('thoughtBtn').onclick=()=>toggleThoughtBubble();
if($('contraptionBtn'))$('contraptionBtn').onclick=()=>openContraptionWorkbench();
if(ui.thoughtBubble)ui.thoughtBubble.onclick=()=>openContraptionWorkbench();
$('nextLine').onclick=nextLine;$('speech').onclick=e=>{if(e.target!==$('nextLine')&&!$('nextLine').contains(e.target))nextLine();};$('bagBtn').onclick=()=>{if(started&&!modal)toggleBag();};$('closeBag').onclick=()=>toggleBag(false);$('cancelItem').onclick=()=>{selected=null;renderInventory();};$('journalBtn').onclick=openJournal;$('menuBtn').onclick=openMenu;$('audioBtn').onclick=()=>setSound(!s.settings.sound);$('revealBtn').onclick=reveal;$('fullBtn').onclick=fullscreen;$('startBtn').onclick=()=>{if(saved){started=true;s=clone(saved);hero.x=s.heroX;showPanel(`<div class="eyebrow">A NEW JOURNEY</div><h2>已有一段旅程</h2><p>要从头开始，还是继续之前的冒险？新的旅程会替换当前 V3 进度。</p><div class="btnrow"><button class="panelBtn" id="keepSaved">继续已有旅程</button><button class="panelBtn primary" id="newFromTitle">重新开始</button></div>`);$('keepSaved').onclick=()=>{closePanel();start(true);};$('newFromTitle').onclick=()=>{closePanel();start(false);};}else start(false);};$('continueBtn').onclick=()=>start(true);$('importFile').onchange=e=>importSave(e.target.files[0]);
function panBy(dir){if(!started||modal)return;camera.manual=true;camera.x=clamp(camera.x+dir*camera.w*.55,0,1600-camera.w);setView();}
$('panLeft').onclick=()=>panBy(-1);$('panRight').onclick=()=>panBy(1);
document.addEventListener('keydown',e=>{if(e.key==='Tab'&&modal){if(ui.contraptionModal?.open)return;let els=[...$('panel').querySelectorAll('button:not([disabled]),input,a')];if(!els.length)return;let first=els[0],last=els[els.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('panel'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}if(!started)return;if(e.key==='Escape'){if(ui.contraptionModal?.open){closeContraptionWorkbench();return;}e.preventDefault();if(modal)closePanel();else if(thoughtOpen){toggleThoughtBubble(false);}else if(inspection){closeInspection();}else if(bagOpen){toggleBag(false);selected=null;renderInventory();}else openMenu();return;}if(modal)return;if((e.key===' '||e.key==='Enter')&&dialogue){e.preventDefault();nextLine();return;}const key=e.key.toLowerCase();if(key==='e'){e.preventDefault();if(selected)inspectItem(selected);else toggleInspection();}else if(key==='t'){e.preventDefault();toggleThoughtBubble();}else if(key==='c'){e.preventDefault();openContraptionWorkbench();}else if(key==='h'){e.preventDefault();reveal();}else if(key==='j'){e.preventDefault();openJournal();}else if(key==='i'){e.preventDefault();toggleBag();}else if(key==='f'){e.preventDefault();fullscreen();}else if(key==='arrowup'||key==='w'){if(!canAct())return;e.preventDefault();PhaserStage.stage.setPosture(15);}else if(key==='arrowdown'||key==='s'){if(!canAct())return;e.preventDefault();PhaserStage.stage.setPosture(-18);}else if(key==='arrowleft'||key==='arrowright'||key==='a'||key==='d'){if(!canAct())return;e.preventDefault();PhaserStage.stage.setPosture(0);walkTo(hero.x+((key==='arrowleft'||key==='a')?-85:85),()=>save());}});
window.addEventListener('resize',()=>{if(inspection)Object.assign(camera,focusFrame(s.scene,innerWidth/innerHeight));calcCamera(false);});document.addEventListener('fullscreenchange',()=>calcCamera(false));window.addEventListener('pagehide',()=>save(true));
document.addEventListener('visibilitychange',()=>{ui.game.classList.toggle('paused',document.hidden||modal);if(document.hidden){save(true);audio?.pause();}else if(audio&&s.settings.sound)audio.resume().catch(()=>{});frameTime=performance.now();});
let audioTick=0;
function tick(now){if(!document.hidden&&audio&&s.settings.sound&&now-audioTick>160){audioTick=now;audio.update(audioState());}let dt=Math.min(.055,Math.max(0,(now-frameTime)/1000));frameTime=now;if(!document.hidden){if(!isPaused())elapsed+=dt;if(!isPaused()){s.playSeconds+=dt;sceneClock+=dt;
 const walking=!!pendingMove&&!dialogue&&!locked&&!activeWork;
 walkAmount=clamp(walkAmount+(walking?1:-1)*dt*8,0,1);
 if(walking){
 const dx=pendingMove.target-hero.x,cruise=Staging.scale(s.scene)*120,acceleration=cruise*6;
 const desired=Math.min(cruise,Math.sqrt(2*acceleration*Math.abs(dx)));
 pendingMove.speed=Math.max(0,(pendingMove.speed||0)+clamp(desired-(pendingMove.speed||0),-acceleration*dt,acceleration*dt));
 const step=Math.sign(dx)*Math.min(Math.abs(dx),dt*pendingMove.speed);hero.x+=step;walkDistance+=Math.abs(step);if(camera.w<1580&&!camera.manual&&!inspection){let target=clamp(hero.x-camera.w*.45,0,1600-camera.w);camera.x+=(target-camera.x)*Math.min(1,dt*5);setView();}if(Math.abs(dx)<3){hero.x=pendingMove.target;const cb=pendingMove.after;pendingMove=null;cb?.();}}if(activeWork&&!dialogue&&!locked){
 const task=activeWork,frame=task.advance(dt*1000),progress=frame.progress;
 $('workRing')?.setAttribute('opacity','1');$('workProgress')?.setAttribute('stroke-dashoffset',String(100.53*(1-progress)));
 if(task.claim()){
  if(task.score.effect==='roofTwig'){petX=hero.x+45;pet.reset(petX,hero.face);}
  if(Number.isFinite(task.score.destinationX))hero.x=walkLimit(task.score.destinationX);
  activeWork=null;ui.game.classList.remove('performing');$('workRing')?.setAttribute('opacity','0');$('actionLabel').classList.remove('show');
  if(task.request===sceneRequest){try{task.after?.();}catch(e){console.error('Action completion failed:',e);toast('动作未能完成。请重试或导出进度。');}}
  render();
 }
}if(s.scene===9&&!s.f.roofDone&&!s.settings.relaxed&&!dialogue&&!locked&&!sequenceActive&&!bagOpen&&!activeWork&&!inventoryDrag&&!input){s.danger=Math.min(1,s.danger+dt/110);$('hazard').querySelector('b').style.width=s.danger*100+'%';$('hazard').setAttribute('aria-valuenow',String(Math.round(s.danger*100)));if(s.danger>=1)resetRoof();}if(sceneClock>14)$('sceneLabel').classList.add('quiet');if(s.scene===9&&!s.settings.reduced&&Math.floor(sceneClock/13)!==Math.floor((sceneClock-dt)/13))effect('water');}if(!isPaused()&&!s.settings.reduced){rainNodes.forEach((el,i)=>{let y=((elapsed*(s.scene===9?530:315)+i*43)%1120)-160;el.setAttribute('transform',`translate(${s.scene===9?-y*.16:-y*.08} ${y})`);});}if(!isPaused()&&!locked&&activeWork?.score.effect!=='roofBoard'&&!(s.scene===9&&s.f.roofDone)){
 if(pendingMove&&!dialogue&&!activeWork)pet.side=hero.face;
 pet.update(clamp(hero.x-pet.side*Staging.petDistance(s.scene),60,1540),dt,{reduced:s.settings.reduced});petX=pet.x;
}updateActors();}requestAnimationFrame(tick);}
const G={get s(){return s;},set:setFlag,commit,take,consume,toast:think,sound,say,go,work,effect,note:addNote,sketch,pulse,playSequence,finish,openEnding};
updateTools();if(saved){$('continueBtn').classList.remove('hidden');$('continueBtn').innerHTML='继续旅程 <span>→</span>';}render();calcCamera(true);requestAnimationFrame(tick);
if(new URLSearchParams(location.search).has('test')||window.__HILDA_TEST_REQUESTED__===true)window.HildaTest={state:()=>clone(s),ui:()=>({started,titleMode,locked,dialogue:dialogue?clone({lines:dialogue.lines,index:dialogue.index}):null,moving:!!pendingMove,working:!!activeWork,performance:activeWork?{...activeWork.sample(),score:clone(activeWork.score)}:null,sequenceActive,modal,selected,bagOpen,inspection,thoughtOpen,contraptionOpen:!!ui.contraptionModal?.open,camera:clone(camera),hero:clone(hero),pet:pet.snapshot(),storageOK}),hotspots:()=>clone(activeHotspots),validate,loadFixture:v=>{saved=validate(v);start(true);},resetRoof,audio:()=>audio?.debug()||null,phaser:()=>PhaserStage.stage.getStatus(),contraption:()=>Contraptions.specFor(s.scene),openWorkbench:openContraptionWorkbench,closeWorkbench:closeContraptionWorkbench,toggleThought:toggleThoughtBubble,setPosture:v=>PhaserStage.stage.setPosture(v),flush:()=>save(true)};

return G;
});

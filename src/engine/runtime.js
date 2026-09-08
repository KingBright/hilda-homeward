Homeward.define("engine/runtime", ["art", "story", "engine/state", "engine/audio", "engine/dom", "engine/storage", "content/items", "engine/camera"], (Art, Story, {fresh,validate,boolFlags,numericFlags,sketches}, Soundscape, {patchSvg}, SaveStore, Items, {focusFrame}) => {
const $=id=>document.getElementById(id), KEY='hilda-echoes-homeward-v3', BACKUP=KEY+'-backup';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
let s=fresh(),saved=null,storageOK=true,storageWarned=false;
let store;
try{store=new SaveStore(localStorage,validate,KEY);saved=store.load();}
catch{storageOK=false;store=new SaveStore({getItem(){return null;},setItem(){throw Error('Storage unavailable');}},validate,KEY);}
let inspection=false,renderQueued=false,rainNodes=[];

let started=false,titleMode=true,selected=null,bagOpen=false,modal=false,dialogue=null,activeHotspots=[],pendingMove=null,activeWork=null,sequenceActive=false,locked=false;
let hero={x:790,y:822,face:1},petX=714,saveTimer,toastTimer,labelTimer,revealTimer,chapterTimer,transitionTimer,saveIndicatorTimer;
let camera={x:0,y:0,w:1600,h:900,manual:false},input=null,inventoryDrag=null,frameTime=0,elapsed=0,sceneClock=0,lastRenderTime=0,focusBeforePanel=null;
let panelReturn='',pauseRestoreFocus=null,sceneRequest=0;
const ui={game:$('game'),world:$('world'),viewport:$('viewport')};
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
function setSound(on){
 s.settings.sound=on;
 try{
  if(on){
   if(!audio)audio=new Soundscape(()=>s.settings);
   audio.resume().then(()=>audio.scene(s.scene)).catch(()=>{});
  }else if(audio){
   if(audio.bgmTimer){clearTimeout(audio.bgmTimer);audio.bgmTimer=null;}
   clearInterval(audio.tickTimer);
   if(audio.master)audio.master.gain.setTargetAtTime(0,audio.ctx.currentTime,0.05);
   audio.ctx.suspend().catch(()=>{});
  }
 }catch{
  toast('声音暂不可用。可以继续无声游玩。');
  s.settings.sound=false;
 }
 updateTools();save();
}
function save(immediate=false){if(!started)return;clearTimeout(saveTimer);const write=()=>{s.heroX=hero.x;s.savedAt=new Date().toISOString();try{store.save(s);storageOK=true;saved=clone(s);$('saveDot').classList.add('saved');clearTimeout(saveIndicatorTimer);saveIndicatorTimer=setTimeout(()=>$('saveDot').classList.remove('saved'),1000);}catch(e){storageOK=false;if(!storageWarned){storageWarned=true;toast('浏览器阻止了自动存档。可以在暂停菜单中导出进度。');}}};if(immediate)write();else saveTimer=setTimeout(write,160);}
function toast(t,time=3300){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),time);}
function actionLabel(t,sticky=false){$('actionLabel').textContent=t;$('actionLabel').classList.add('show');clearTimeout(labelTimer);if(!sticky)labelTimer=setTimeout(()=>$('actionLabel').classList.remove('show'),3800);}
function setFlag(k,v=true){if(!boolFlags.has(k)&&!numericFlags[k])throw Error('Unknown state key '+k);s.f[k]=v;commit();}
function commit(){if(!renderQueued){renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}save();}
function take(k,announce=true){if(!Object.hasOwn(Story.items,k))throw Error('Unknown item '+k);if(!s.inventory.includes(k))s.inventory.push(k);renderInventory();save();if(announce){toast('收入背包 · '+Story.items[k]);sound('warm');} $('bagBtn').animate?.([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:380});}
function consume(k){s.inventory=s.inventory.filter(v=>v!==k);if(selected===k)selected=null;renderInventory();save();}
function addNote(k){if(!s.notes.includes(k)){s.notes.push(k);save();} }
function sketch(k,title,body){if(!Object.hasOwn(sketches,k))return;if(!s.sketches.includes(k)){s.sketches.push(k);save();toast('观察手记 '+s.sketches.length+' / 6 · '+title);}say([['希尔达',body]]);}
function combo(a,b){const output=Items.recipeFor(a,b);if(!output)return false;consume(a);consume(b);take(output,false);selected=output;renderInventory();toast(output==='shade'?'组合完成 · 把围巾叠在提灯一侧做成遮光屏风，光线柔和了':'组合完成 · '+Story.items[output]);sound('wood');return true;}
function selectItem(id){if(!s.inventory.includes(id))return;if(selected===id){selected=null;}else if(selected&&!combo(selected,id)){selected=id;}else if(!selected)selected=id;renderInventory();if(selected){toggleBag(false);actionLabel('选择了「'+Story.items[selected]+'」：点目标使用，或再开背包组合。');}}
function toggleBag(force){bagOpen=typeof force==='boolean'?force:!bagOpen;$('pocket').classList.toggle('hidden',!bagOpen);$('bagBtn').setAttribute('aria-expanded',String(bagOpen));renderInventory();}
function renderInventory(){
 $('bagCount').textContent=s.inventory.length;
 $('items').innerHTML=s.inventory.length?s.inventory.map(k=>`<button class="item ${selected===k?'selected':''}" data-item="${k}" aria-label="${esc(Story.items[k])}" aria-pressed="${selected===k}">${Art.itemArt(k)}<span>${esc(Story.items[k])}</span></button>`).join(''):'<p style="font-size:11px;color:#becabb;margin:8px">背包还空着。带上一点好奇心就好。</p>';
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
function worldPoint(x,y){const r=ui.world.getBoundingClientRect();return {x:camera.x+(x-r.left)/r.width*camera.w,y:camera.y+(y-r.top)/r.height*camera.h};}
function atPoint(p){return [...activeHotspots].reverse().find(h=>Math.abs(p.x-h.x)<=h.w/2&&Math.abs(p.y-h.y)<=h.h/2);}
function render(){
 const index=titleMode?7:s.scene,artState=titleMode?{...s,scene:7}:s,scene=Story.scenes[index];
 let layers=Art.scene(artState,titleMode);
 const dog=!(s.scene===9&&!s.f.twigSafe)&&!titleMode;
 let followers='';if(!titleMode&&[2,3,4,7].includes(s.scene))followers+=`<g id="davidFollow">${Art.person('大卫',0,0,1.34)}</g>`;if(!titleMode&&s.scene===4)followers+=`<g id="fridaFollow">${Art.person('芙丽达',0,0,1.38)}</g>`;
 patchSvg(ui.world,Art.defs+`<g clip-path="url(#worldClip)"><g id="scenery">${layers}</g><g id="actors">${followers}<g id="heroPosition"><g id="heroFacing">${Art.hilda(0,0,1.36,1)}</g></g>${dog?`<g id="twigPosition">${Art.twig(0,0,.98)}</g>`:''}</g><rect width="1600" height="900" fill="url(#grain)" opacity=".15" style="mix-blend-mode:soft-light" pointer-events="none"/>${Art.foreground(artState)}${Art.weather(artState)}<g id="workRing" pointer-events="none" opacity="0"><circle r="16" fill="#14333c99" stroke="#e1d3a53a" stroke-width="2"/><circle id="workProgress" r="16" fill="none" stroke="#f2d79d" stroke-width="2" stroke-dasharray="100.53" stroke-dashoffset="100.53" transform="rotate(-90)"/></g></g><g id="hotspotLayer"></g>`);
 activeHotspots=titleMode?[]:Story.scenes[s.scene].hotspots(s);
 patchSvg($('hotspotLayer'),activeHotspots.map(h=>`<g class="hotspot ${h.kind==='exit'?'isExit':''}" data-hotspot="${h.id}" data-kind="${h.kind||'interact'}" role="button" tabindex="0" aria-label="${esc(h.label)}"><rect class="hit" x="${h.x-h.w/2}" y="${h.y-h.h/2}" width="${h.w}" height="${h.h}"/><g class="hotmark" transform="translate(${h.x} ${h.y})"><circle r="${h.kind==='exit'?16:10}" fill="#173841d9" stroke="#e3d29a" stroke-width="1.2"/>${h.kind==='exit'?Art.path(h.id==='back'?'M7 0H-7m5-5-5 5 5 5':'M-7 0H7m-5-5 5 5-5 5','none','#f0dbab',1.5):Art.circle(0,0,2,'#e8d7ab')}</g></g>`).join(''));
 document.querySelectorAll('.hotspot').forEach(el=>{el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){if(dialogue||modal)return;e.preventDefault();e.stopPropagation();interact(el.dataset.hotspot);}};el.onfocus=()=>{const h=activeHotspots.find(h=>h.id===el.dataset.hotspot);if(h&&camera.w<1550){camera.manual=true;camera.x=clamp(h.x-camera.w*.5,0,1600-camera.w);setView();}else if(h&&camera.h<850){camera.manual=true;camera.y=clamp(h.y-camera.h*.5,0,900-camera.h);setView();}};});
 rainNodes=[...ui.world.querySelectorAll('[data-rain]')];
 updateActors();calcCamera();renderInventory();updateTools();
 $('actLabel').textContent=scene.actLabel;$('sceneName').textContent=scene.name;$('sceneMood').textContent=scene.mood;
 $('hazard').classList.toggle('hidden',!!(titleMode||s.scene!==9||s.f.roofDone));$('hazard').querySelector('span').textContent=s.settings.relaxed?'舒缓模式 · 从容救援':'风暴正在逼近';
 if(s.scene===9)$('hazard').querySelector('b').style.width=s.danger*100+'%';
}
function updateActors(){let p=$('heroPosition');if(!p)return;const ground=Story.scenes[titleMode?7:s.scene].ground;hero.y=ground(hero.x,s);p.setAttribute('transform',`translate(${hero.x.toFixed(1)} ${hero.y.toFixed(1)})`);p.setAttribute('class',(pendingMove?'walking ':'')+(activeWork?'working ':''));$('heroFacing').setAttribute('transform',`scale(${hero.face} 1)`);const t=$('twigPosition');if(t)t.setAttribute('transform',`translate(${petX.toFixed(1)} ${(ground(petX,s)+1).toFixed(1)}) scale(${hero.face} 1)`);const d=$('davidFollow'),fr=$('fridaFollow');if(d)d.setAttribute('transform',`translate(${clamp(hero.x-175,85,1490)} ${ground(clamp(hero.x-175,85,1490),s)+4})`);if(fr)fr.setAttribute('transform',`translate(${clamp(hero.x-270,65,1490)} ${ground(clamp(hero.x-270,65,1490),s)+7})`);if($('workRing'))$('workRing').setAttribute('transform',`translate(${hero.x} ${hero.y-245})`);}
function isPaused(){return modal||document.hidden||titleMode;}
function canAct(){return started&&!isPaused()&&!dialogue&&!locked&&!activeWork&&!sequenceActive;}
function walkLimit(x){if(s.scene===2&&!s.f.bridge)return clamp(x,135,545);if(s.scene===9&&!s.f.davidSafe)return clamp(x,200,466);if(s.scene===10&&!s.f.reunited)return clamp(x,145,1036);return clamp(x,90,1510);}
function walkTo(x,after){x=walkLimit(x);if(!inspection)camera.manual=false;hero.face=x<hero.x?-1:1;if(Math.abs(x-hero.x)<8){after?.();return;}pendingMove={target:x,after};$('hoverLabel').classList.remove('show');}
function interact(id,itemOverride){if(!canAct())return;const h=activeHotspots.find(v=>v.id===id);if(!h)return;const item=itemOverride??selected;if(item&&!s.inventory.includes(item))return;if(item&&!Items.canUse(s.scene,id,item)){sound('wood');toast('「'+Story.items[item]+'」不适合这个位置。先取消选中，再观察「'+h.label+'」。');return;}toggleBag(false);$('hoverLabel').classList.remove('show');const current=s.scene;walkTo(h.walkX??h.x,()=>{if(current!==s.scene)return;try{Story.scenes[current].act(G,id,item);if(item&&selected===item){selected=null;renderInventory();}save();}catch(e){console.error('Interaction failed:',e);toast('这个动作没有完成，进度仍保留。可重新点击或从菜单导出存档。');}});}
let typewriter={timer:null,fullText:'',index:0,who:'',busy:false};
function say(lines,after){if(!Array.isArray(lines)||!lines.length){after?.();return;}pendingMove=null;dialogue={lines,index:0,after};toggleBag(false);$('speech').classList.remove('hidden');showLine();}
function showLine(){
 if(!dialogue)return;
 const [who,line]=dialogue.lines[dialogue.index];
 $('speaker').textContent=who;
 $('portrait').innerHTML=Art.portrait(who);
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
 typewriter.timer=setTimeout(stepTypewriter,s.settings.reduced?10:delay);
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
  save();
 }else showLine();
}
function work(ms,label,after){pendingMove=null;activeWork={duration:s.settings.reduced?Math.min(ms,350):ms,elapsed:0,after};actionLabel(label,true);updateActors();}
function effect(kind){if(s.settings.reduced)return;if(kind==='shake'||kind==='water'){ui.viewport.animate?.([{transform:'translate(0,0)'},{transform:'translate(-4px,2px)'},{transform:'translate(4px,-2px)'},{transform:'translate(-2px,1px)'},{transform:'translate(0,0)'}],{duration:620});}if(kind==='water'&&s.scene!==0){$('flash').classList.remove('lightning');void $('flash').offsetWidth;$('flash').classList.add('lightning');} }
function pulse(id,n=0){requestAnimationFrame(()=>{const el=$(id)?.querySelector('circle');if(el){el.classList.add('spark-active');setTimeout(()=>el.isConnected&&el.classList.remove('spark-active'),550);}});if(s.settings.sound){try{if(!audio)audio=new Soundscape(()=>s.settings);audio.resume().catch(()=>{});audio.note([293.66,369.99,493.88][n],.7,0,.4);}catch{}}}
async function playSequence(seq){if(sequenceActive)return;sequenceActive=true;actionLabel('石壁上的记号亮起了，跟着光慢慢记住它。',true);let current=s.scene,request=sceneRequest;for(let i=0;i<seq.length;i++){await new Promise(r=>setTimeout(r,i===0?180:850));while(isPaused())await new Promise(r=>setTimeout(r,150));if(s.scene!==current||sceneRequest!==request)break;pulse('tone'+seq[i],seq[i]);toast((i+1)+' / '+seq.length+' · '+['溪流','松针','月亮'][seq[i]],750);}await new Promise(r=>setTimeout(r,650));if(sceneRequest!==request)return;sequenceActive=false;$('actionLabel').classList.remove('show');}
function resetRoof(){if(s.scene!==9||s.f.roofDone)return;pendingMove=null;activeWork=null;for(const k of ['roofAnchor','davidSafe','fridaSafe','beacon','twigSafe'])delete s.f[k];s.danger=0;s.beaconAngle=-65;s.failures++;if(!s.inventory.includes('line'))s.inventory.push('line');hero.x=315;petX=245;selected=null;render();say([['芙丽达','抓住了！先退回这根稳固的横梁，我们重新来。'],['希尔达','大家都没受伤。绳子也取回来了。这次我们一步一步做。']],()=>toast('已回到屋顶安全检查点。之前章节的进度没有丢失。'));save(true);}
function go(index){closeInspection();if(index<0||index>=Story.scenes.length)return;sceneRequest++;const request=sceneRequest;locked=true;pendingMove=null;activeWork=null;selected=null;toggleBag(false);$('transition').classList.add('dark');$('hoverLabel').classList.remove('show');clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>{if(request!==sceneRequest)return;clearTimeout(chapterTimer);s.scene=index;hero.x=Story.scenes[index].start;petX=hero.x-85;camera.manual=false;sceneClock=0;if(!s.visited.includes(index))s.visited.push(index);if(index===9&&!s.f.roofDone)s.danger=0;render();calcCamera(true);$('sceneLabel').classList.remove('quiet');if(s.settings.sound&&audio)audio.scene(index);save(true);$('transition').classList.remove('dark');let first=!s.seen.includes(index);if(first)s.seen.push(index);if(first&&Story.scenes[index].chapter)chapter(Story.scenes[index].chapter);transitionTimer=setTimeout(()=>{if(request!==sceneRequest)return;locked=false;if(first)say(Story.scenes[index].intro);else actionLabel(Story.scenes[index].objective(s));save();},first&&Story.scenes[index].chapter?1300:380);},s.settings.reduced?120:480);}
function chapter(data){const el=$('chapterCard');el.querySelector('span').textContent=data[0];el.querySelector('h2').textContent=data[1];el.querySelector('p').textContent=data[2];el.classList.remove('hidden');el.style.animation='none';void el.offsetWidth;el.style.animation='';clearTimeout(chapterTimer);chapterTimer=setTimeout(()=>el.classList.add('hidden'),3700);}
function start(resume=false){closeInspection();clearTimeout(typewriter.timer);typewriter.busy=false;clearTimeout(transitionTimer);clearTimeout(chapterTimer);clearTimeout(saveTimer);if(resume&&saved)s=clone(saved);else{s=fresh();saved=null;}started=true;titleMode=false;selected=null;dialogue=null;activeWork=null;pendingMove=null;sequenceActive=false;modal=false;locked=false;bagOpen=false;input=null;inventoryDrag=null;hideGhost();$('pocket').classList.add('hidden');sceneRequest++;$('titleScreen').classList.add('hidden');$('speech').classList.add('hidden');$('panelLayer').classList.add('hidden');$('chapterCard').classList.add('hidden');ui.game.classList.remove('paused');hero.x=s.heroX||Story.scenes[s.scene].start;petX=hero.x-85;camera.manual=false;render();calcCamera(true);if(resume){if(!s.visited.includes(s.scene))s.visited.push(s.scene);toast('旅程已继续 · '+Story.scenes[s.scene].name);if(s.settings.sound)setSound(true);if(s.scene===9&&!s.f.roofDone)s.danger=0;save();}else go(0);}
function finish(){save(true);say([['希尔达','手记最后一行：本次夜行，所有同行者均已安全抵达。'],['妈妈','很好。现在，把第一句话讲给我们听吧。']],openEnding);}
function showPanel(html,type='menu'){focusBeforePanel=document.activeElement;panelReturn=type;modal=true;ui.game.classList.add('paused');$('panelLayer').classList.remove('hidden');$('panel').innerHTML=`<button class="closePanel" aria-label="回到冒险" data-close>×</button>${html}`;$('panel').querySelector('[data-close]').addEventListener('click',closePanel);$('panel').focus();$('hoverLabel').classList.remove('show');if(audio&&s.settings.sound)audio.master.gain.setTargetAtTime(.035,audio.ctx.currentTime,.1);}
function closePanel(){modal=false;$('panelLayer').classList.add('hidden');ui.game.classList.remove('paused');if(audio&&s.settings.sound)audio.master.gain.setTargetAtTime(.12,audio.ctx.currentTime,.15);if(focusBeforePanel&&focusBeforePanel.isConnected)focusBeforePanel.focus({preventScroll:true});}
function openMenu(){if(!started)return;showPanel(`<div class="eyebrow">TAKE A BREATH</div><h2>旅途中的一小会儿</h2><p>${esc(Story.scenes[s.scene].name)}<br><span class="progressText">已到访 ${s.visited.length} / 12 个场景 · 观察手记 ${s.sketches.length} / 6</span></p><div class="settingsRow"><span>环境音乐与机关音效</span><button id="soundSetting">${s.settings.sound?'已开启':'已关闭'}</button></div><div class="settingsRow"><span>舒缓模式 <small>· 屋顶风暴不计时</small></span><button id="relaxSetting">${s.settings.relaxed?'已开启':'已关闭'}</button></div><div class="settingsRow"><span>减少动态与闪光</span><button id="motionSetting">${s.settings.reduced?'已开启':'已关闭'}</button></div><div class="btnrow"><button class="panelBtn primary" id="resumePlay">回到冒险</button><button class="panelBtn" id="helpOpen">操作说明</button></div><div class="btnrow"><button class="panelBtn" id="exportBtn">导出进度</button><button class="panelBtn" id="importBtn">导入进度</button><button class="panelBtn danger" id="restartBtn">重新开始</button></div><p class="fineprint">${storageOK?'进度自动保存在当前浏览器。关闭网页不会抹去已完成的章节。':'此浏览器阻止了本地存储。请用“导出进度”保留旅程。'}<br>暂停菜单、手记、背包、对话和机关操作期间，风暴计时会暂停。</p>`,'menu');
 $('resumePlay').onclick=closePanel;$('helpOpen').onclick=openHelp;$('soundSetting').onclick=()=>{setSound(!s.settings.sound);openMenu();};$('relaxSetting').onclick=()=>{s.settings.relaxed=!s.settings.relaxed;save();render();openMenu();};$('motionSetting').onclick=()=>{s.settings.reduced=!s.settings.reduced;save();render();openMenu();};$('exportBtn').onclick=exportSave;$('importBtn').onclick=()=>{$('importFile').value='';$('importFile').click();};$('restartBtn').onclick=confirmRestart;
}
function openHelp(){showPanel(`<div class="eyebrow">THE WORLD IS THE INTERFACE</div><h2>用好奇心来操作</h2><h3>在场景里行动</h3><p>点击地面，希尔达会走过去。点击人物、门、物件，她会走近后互动。手记只在你打开时出现，没有常驻任务列表。</p><h3>物件与机关</h3><p>打开背包，选择一件物品，再点场景目标；也可以直接拖过去。选中物品后背包会收起，避免遮挡场景；再打开背包，点另一件物品可以尝试组合。雨棚绳圈、档案梯子、配重和信标均可拖动，也都有点击或键盘操作。</p><h3>看清整个世界</h3><p>手机建议横屏。竖屏可在空白处左右拖动画面，或点击边缘箭头；超宽屏可上下拖动画面查看高处。点击眼睛按钮，或按 H，会短暂标出能互动的对象。背包物品不需要丢弃。</p><h3>键盘和节奏</h3><p>Tab 选择对象，Enter / 空格互动；方向键移动；I 打开背包，J 打开手记，H 显示线索对象，F 切换全屏，Esc 暂停。对话可点“继续”或按空格。浏览器不支持系统全屏时，游戏仍铺满网页视口。</p><p>只有屋顶救援有风暴压力。失败会回到该场景的安全检查点，不会死亡或丢失前面章节。开启舒缓模式后不计时，剧情和结局相同。声音不是任何谜题的必要条件。</p><p class="fineprint">这是《希尔达》的非官方同人互动故事。剧情与代码矢量画面为本版本原创，不包含动画截图、配音或原声音乐。灵感参考的是场景式点触冒险的交互，不是《机械迷城》的素材或故事。</p><div class="btnrow"><button class="panelBtn primary" id="helpBack">回到冒险</button></div>`,'help');$('helpBack').onclick=closePanel;}
function openJournal(){if(!started)return;const count=s.hints[s.scene];const hints=Story.scenes[s.scene].hints(s);const hint=hints[Math.min(hints.length-1,Math.max(0,count-1))];showPanel(`<div class="eyebrow">FIELD NOTES · ${String(s.scene+1).padStart(2,'0')}</div><h2>这次冒险的手记</h2><h3>眼前的一步</h3><p>${esc(Story.scenes[s.scene].objective(s))}</p>${count?`<p class="spoiler-hint">提示 ${count} / 3<br>${esc(hint)}</p>`:''}<div class="btnrow"><button class="panelBtn" id="hintBtn">${count<3?'给我一点'+(count?'更明确的':'')+'提示':'查看明确提示'}</button><button class="panelBtn primary" id="backFromNotes">收好手记</button></div><h3>已经发现的事</h3>${s.notes.length?s.notes.map(k=>`<div class="journalNote"><h3>${esc(Story.notes[k][0])}</h3><p>${esc(Story.notes[k][1])}</p></div>`).join(''):'<p>第一页还空着。故事会随着你的脚步慢慢展开。</p>'}<h3>路边的小小发现 ${s.sketches.length} / 6</h3>${s.sketches.map(k=>`<div class="journalNote"><h3>${esc(sketches[k][0])}</h3><p>${esc(sketches[k][1])}</p></div>`).join('')}<p class="fineprint">提示不扣分，也不会改变结局。尚未发生的剧情不会提前写在这里。</p>`,'journal');$('hintBtn').onclick=()=>{s.hints[s.scene]=Math.min(3,s.hints[s.scene]+1);save();openJournal();};$('backFromNotes').onclick=closePanel;}
function openEnding(){showPanel(`<div class="eyebrow">EVERYONE MADE IT HOME</div><h2>所有人，平安归来。</h2><p>希尔达把围巾留给了一个害怕黑夜的孩子。<br>山里的灯照见了一对母子。<br>城里的窗，等回了一群朋友。</p><div class="journalNote"><h3>本次夜行 · 安全记录</h3><p>希尔达、芙丽达、大卫、枝枝、阿尔弗：全部平安。<br>小巨魔：已与妈妈团聚。<br>妈妈：不用再守着那盏灯等了。</p></div><p class="progressText">十二幕旅程 · ${s.sketches.length} / 6 幅观察手记 · 完整归家结局</p><p>窗外的钟声再一次响起。很轻，很准。<br>这次，它只是在提醒大家：早饭时间到了。</p><div class="btnrow"><button class="panelBtn primary" id="stayHome">留在客厅里</button><button class="panelBtn" id="endingExport">保存这次旅程</button></div><p class="fineprint">《黄昏的回声：归途》 · 非官方同人作品<br>没有必须马上开始的下一次冒险。你可以和朋友继续说说话。</p>`,'ending');$('stayHome').onclick=closePanel;$('endingExport').onclick=exportSave;}
function confirmRestart(){showPanel(`<div class="eyebrow">A NEW FIRST PAGE</div><h2>重新翻开第一页？</h2><p>新旅程会替换这个浏览器中的 V3 当前进度。第一版《黄昏的回声》的存档不受影响。先导出一份存档，就能保留这次冒险。</p><div class="btnrow"><button class="panelBtn" id="cancelRestart">继续现在的旅程</button><button class="panelBtn danger" id="confirmRestart">确认重新开始</button></div><div class="btnrow"><button class="panelBtn" id="beforeRestartExport">先导出当前进度</button></div>`,'confirm');$('cancelRestart').onclick=closePanel;$('confirmRestart').onclick=()=>{closePanel();start(false);};$('beforeRestartExport').onclick=exportSave;}
function exportSave(){save(true);const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='hilda-homeward-v2-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('进度文件已生成。请妥善保留。');}
async function importSave(file){if(!file)return;if(file.size>256000)return toast('这份文件太大，不像有效的游戏存档。');try{const v=validate(JSON.parse(await file.text()));showPanel(`<div class="eyebrow">CONTINUE A JOURNEY</div><h2>载入这份进度？</h2><p>地点：${esc(Story.scenes[v.scene].name)}<br>已探索：${v.visited.length} / 12 个场景。</p><p>载入后将替换当前 V3 进度。取消不会改变正在进行的旅程。</p><div class="btnrow"><button class="panelBtn" id="cancelImport">取消</button><button class="panelBtn primary" id="confirmImport">确认载入</button></div>`,'import');$('cancelImport').onclick=closePanel;$('confirmImport').onclick=()=>{saved=clone(v);closePanel();start(true);save(true);};}catch(e){toast('无法载入：'+e.message);}}
function reveal(){if(!started)return;ui.world.classList.add('revealing');$('revealBtn').classList.add('active');clearTimeout(revealTimer);revealTimer=setTimeout(()=>{ui.world.classList.remove('revealing');$('revealBtn').classList.remove('active');},3800);actionLabel('人物、机关、出口：留意画面里亮起的轮廓。');}
async function fullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen();}else if(ui.game.requestFullscreen){await ui.game.requestFullscreen();}else toast('当前浏览器不支持系统全屏。游戏仍会铺满网页视口。');}catch{toast('浏览器没有进入系统全屏。可以继续在当前视口游玩。');}}
function hover(e){if(input?.moved||inventoryDrag||!canAct()){ $('hoverLabel').classList.remove('show');return;}const h=atPoint(worldPoint(e.clientX,e.clientY));if(!h){$('hoverLabel').classList.remove('show');return;}$('hoverLabel').textContent=(selected?Story.items[selected]+' → ':'')+h.label;$('hoverLabel').classList.add('show');const r=$('hoverLabel').getBoundingClientRect();$('hoverLabel').style.left=clamp(e.clientX-r.width/2,8,innerWidth-r.width-8)+'px';$('hoverLabel').style.top=clamp(e.clientY+22,8,innerHeight-r.height-85)+'px';}
ui.viewport.addEventListener('pointerdown',e=>{if(e.button!==0||!canAct())return;e.preventDefault();const p=worldPoint(e.clientX,e.clientY),h=atPoint(p);input={sx:e.clientX,sy:e.clientY,x:p.x,y:p.y,camX:camera.x,camY:camera.y,h,moved:false,pid:e.pointerId,oldLadder:s.f.ladderX,oldAngle:s.beaconAngle};ui.viewport.setPointerCapture?.(e.pointerId);});
ui.viewport.addEventListener('pointermove',e=>{if(!input){if(e.pointerType==='mouse')hover(e);return;}if(input.pid!==e.pointerId)return;const dx=e.clientX-input.sx,dy=e.clientY-input.sy;if(Math.hypot(dx,dy)>9)input.moved=true;if(!input.moved)return;$('hoverLabel').classList.remove('show');if(!input.h){camera.manual=true;camera.x=clamp(input.camX-dx/innerWidth*camera.w,0,1600-camera.w);camera.y=clamp(input.camY-dy/innerHeight*camera.h,0,900-camera.h);setView();return;}let p=worldPoint(e.clientX,e.clientY);if(input.h.drag==='ladder'){s.f.ladderX=clamp(p.x,640,1260);if(performance.now()-lastRenderTime>55){render();lastRenderTime=performance.now();}}else if(input.h.drag==='beacon'&&s.f.fridaSafe&&!s.f.beacon){s.beaconAngle=Math.atan2(p.y-492,p.x-1292)*180/Math.PI;if(performance.now()-lastRenderTime>55){render();lastRenderTime=performance.now();}}else if(input.h.drag==='weight'){showGhost('gearM',e.clientX,e.clientY);} });
ui.viewport.addEventListener('pointerup',e=>{if(!input||input.pid!==e.pointerId)return;const down=input;input=null;hideGhost();if(!canAct())return;const p=worldPoint(e.clientX,e.clientY);if(down.moved){if(down.h?.drag&&Story.scenes[s.scene].drag){const used=Story.scenes[s.scene].drag(G,down.h.id,{x:p.x,y:p.y,dx:(e.clientX-down.sx)/innerWidth*camera.w,dy:(e.clientY-down.sy)/innerHeight*camera.h});if(!used){if(down.h.drag==='ladder'){if(down.oldLadder===undefined)delete s.f.ladderX;else s.f.ladderX=down.oldLadder;}if(down.h.drag==='beacon')s.beaconAngle=down.oldAngle;render();toast('拖动后放在合适的位置。也可以点按操作。');}}save();return;}if(down.h)interact(down.h.id);else if(p.y>Story.scenes[s.scene].ground(p.x,s)-210)walkTo(p.x,()=>save());else actionLabel('点击人物或物件调查；点击地面移动。');});
ui.viewport.addEventListener('pointercancel',()=>{if(input?.h?.drag==='ladder'){if(input.oldLadder===undefined)delete s.f.ladderX;else s.f.ladderX=input.oldLadder;}if(input?.h?.drag==='beacon')s.beaconAngle=input.oldAngle;input=null;hideGhost();render();});
ui.viewport.addEventListener('pointerleave',()=>{$('hoverLabel').classList.remove('show');});
function showGhost(id,x,y){$('dragGhost').classList.remove('hidden');$('dragGhost').innerHTML=Art.itemArt(id);$('dragGhost').style.left=x+'px';$('dragGhost').style.top=y+'px';}
function hideGhost(){$('dragGhost').classList.add('hidden');}
document.addEventListener('pointermove',e=>{if(!inventoryDrag||inventoryDrag.pid!==e.pointerId)return;const d=inventoryDrag;if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>9)d.moved=true;if(d.moved){showGhost(d.id,e.clientX,e.clientY);const t=document.elementFromPoint(e.clientX,e.clientY);if(!t?.closest('#pocket')){$('pocket').classList.add('hidden');bagOpen=false;}}});
document.addEventListener('pointerup',e=>{if(!inventoryDrag||inventoryDrag.pid!==e.pointerId)return;const d=inventoryDrag;inventoryDrag=null;hideGhost();if(!canAct())return;if(!d.moved){selectItem(d.id);return;}const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-item]');if(el&&el.dataset.item!==d.id){if(!combo(d.id,el.dataset.item)){selected=d.id;renderInventory();toast('这些物品暂时不能组合。');}return;}const h=atPoint(worldPoint(e.clientX,e.clientY));selected=d.id;renderInventory();if(h)interact(h.id,d.id);else{toggleBag(false);toast('物品没有丢失。选好它以后，再点场景里的目标。');}});
document.addEventListener('pointercancel',()=>{inventoryDrag=null;hideGhost();});
$('focusBtn').onclick=toggleInspection;$('focusExit').onclick=closeInspection;$('inspectSelected').onclick=()=>inspectItem(selected);
$('nextLine').onclick=nextLine;$('speech').onclick=e=>{if(e.target!==$('nextLine')&&!$('nextLine').contains(e.target))nextLine();};$('bagBtn').onclick=()=>{if(started&&!modal)toggleBag();};$('closeBag').onclick=()=>toggleBag(false);$('cancelItem').onclick=()=>{selected=null;renderInventory();};$('journalBtn').onclick=openJournal;$('menuBtn').onclick=openMenu;$('audioBtn').onclick=()=>setSound(!s.settings.sound);$('revealBtn').onclick=reveal;$('fullBtn').onclick=fullscreen;$('startBtn').onclick=()=>{if(saved){started=true;s=clone(saved);hero.x=s.heroX;showPanel(`<div class="eyebrow">A NEW JOURNEY</div><h2>已有一段旅程</h2><p>要从头开始，还是继续之前的冒险？新的旅程会替换当前 V3 进度。</p><div class="btnrow"><button class="panelBtn" id="keepSaved">继续已有旅程</button><button class="panelBtn primary" id="newFromTitle">重新开始</button></div>`);$('keepSaved').onclick=()=>{closePanel();start(true);};$('newFromTitle').onclick=()=>{closePanel();start(false);};}else start(false);};$('continueBtn').onclick=()=>start(true);$('importFile').onchange=e=>importSave(e.target.files[0]);
function panBy(dir){if(!started||modal)return;camera.manual=true;camera.x=clamp(camera.x+dir*camera.w*.55,0,1600-camera.w);setView();}
$('panLeft').onclick=()=>panBy(-1);$('panRight').onclick=()=>panBy(1);
document.addEventListener('keydown',e=>{if(e.key==='Tab'&&modal){let els=[...$('panel').querySelectorAll('button:not([disabled]),input,a')];if(!els.length)return;let first=els[0],last=els[els.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('panel'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}if(!started)return;if(e.key==='Escape'){e.preventDefault();if(modal)closePanel();else if(inspection){closeInspection();}else if(bagOpen){toggleBag(false);selected=null;renderInventory();}else openMenu();return;}if(modal)return;if((e.key===' '||e.key==='Enter')&&dialogue){e.preventDefault();nextLine();return;}const key=e.key.toLowerCase();if(key==='e'){e.preventDefault();if(selected)inspectItem(selected);else toggleInspection();}else if(key==='h'){e.preventDefault();reveal();}else if(key==='j'){e.preventDefault();openJournal();}else if(key==='i'){e.preventDefault();toggleBag();}else if(key==='f'){e.preventDefault();fullscreen();}else if(key==='arrowleft'||key==='arrowright'||key==='a'||key==='d'){if(!canAct())return;e.preventDefault();walkTo(hero.x+((key==='arrowleft'||key==='a')?-85:85),()=>save());}});
window.addEventListener('resize',()=>{if(inspection)Object.assign(camera,focusFrame(s.scene,innerWidth/innerHeight));calcCamera(false);});document.addEventListener('fullscreenchange',()=>calcCamera(false));window.addEventListener('pagehide',()=>save(true));
document.addEventListener('visibilitychange',()=>{ui.game.classList.toggle('paused',document.hidden||modal);if(document.hidden){save(true);if(audio)audio.ctx.suspend().catch(()=>{});}else if(audio&&s.settings.sound)audio.resume().catch(()=>{});frameTime=performance.now();});
function tick(now){let dt=Math.min(.055,Math.max(0,(now-frameTime)/1000));frameTime=now;if(!document.hidden){elapsed+=dt;if(!isPaused()){s.playSeconds+=dt;sceneClock+=dt;if(pendingMove&&!dialogue&&!locked&&!activeWork){let dx=pendingMove.target-hero.x,step=Math.sign(dx)*Math.min(Math.abs(dx),dt*485);hero.x+=step;if(camera.w<1580&&!camera.manual&&!inspection){let target=clamp(hero.x-camera.w*.45,0,1600-camera.w);camera.x+=(target-camera.x)*Math.min(1,dt*5);setView();}if(Math.abs(dx)<3){hero.x=pendingMove.target;const cb=pendingMove.after;pendingMove=null;cb?.();}}if(activeWork&&!dialogue&&!locked){activeWork.elapsed+=dt*1000;const progress=clamp(activeWork.elapsed/activeWork.duration,0,1);$('workRing')?.setAttribute('opacity','1');$('workProgress')?.setAttribute('stroke-dashoffset',String(100.53*(1-progress)));if(progress>=1){const cb=activeWork.after;activeWork=null;$('workRing')?.setAttribute('opacity','0');$('actionLabel').classList.remove('show');cb?.();}}if(s.scene===9&&!s.f.roofDone&&!s.settings.relaxed&&!dialogue&&!locked&&!sequenceActive&&!bagOpen&&!activeWork&&!inventoryDrag){s.danger=Math.min(1,s.danger+dt/110);$('hazard').querySelector('b').style.width=s.danger*100+'%';$('hazard').setAttribute('aria-valuenow',String(Math.round(s.danger*100)));if(s.danger>=1)resetRoof();}if(sceneClock>14)$('sceneLabel').classList.add('quiet');if(s.scene===9&&!s.settings.reduced&&Math.floor(sceneClock/13)!==Math.floor((sceneClock-dt)/13))effect('water');}if(!isPaused()&&!s.settings.reduced){rainNodes.forEach((el,i)=>{let y=((elapsed*(s.scene===9?530:315)+i*43)%1120)-160;el.setAttribute('transform',`translate(${s.scene===9?-y*.16:-y*.08} ${y})`);});}petX+=(clamp(hero.x-hero.face*85,60,1540)-petX)*Math.min(1,dt*3.5);updateActors();}requestAnimationFrame(tick);}
const G={get s(){return s;},set:setFlag,commit,take,consume,toast,sound,say,go,work,effect,note:addNote,sketch,pulse,playSequence,finish,openEnding};
updateTools();if(saved){$('continueBtn').classList.remove('hidden');$('continueBtn').innerHTML='继续旅程 <span>→</span>';}render();calcCamera(true);requestAnimationFrame(tick);
if(new URLSearchParams(location.search).has('test')||window.__HILDA_TEST_REQUESTED__===true)window.HildaTest={state:()=>clone(s),ui:()=>({started,titleMode,locked,dialogue:dialogue?clone({lines:dialogue.lines,index:dialogue.index}):null,moving:!!pendingMove,working:!!activeWork,sequenceActive,modal,selected,bagOpen,inspection,camera:clone(camera),hero:clone(hero),storageOK}),hotspots:()=>clone(activeHotspots),validate,loadFixture:v=>{saved=validate(v);start(true);},resetRoof,flush:()=>save(true)};

return G;
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function registry(){
  const context=vm.createContext({console,URLSearchParams});
  vm.runInContext(fs.readFileSync(path.join(root,'src/engine/modules.js'),'utf8'),context);
  for(const file of files(path.join(root,'src')).filter(p=>p.endsWith('.js')&&!p.endsWith('/modules.js')&&!p.endsWith('/bootstrap.js')))vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  return context.Homeward;
}
const H=registry(),plain=x=>JSON.parse(JSON.stringify(x)),State=H.use('engine/state');
const Hydraulics=H.use('engine/hydraulics'),Items=H.use('content/items'),Story=H.use('story');
const key='hilda-echoes-homeward-v3';
function memory(){let data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),data};}
test('Every module resolves without unexpected dependency cycles',()=>{
 for(const name of H.modules().filter(name=>name!=='engine/runtime'))assert.ok(H.use(name),name);
});
test('Registry reports missing and duplicate definitions',()=>{
 assert.throws(()=>H.use('missing'),/Missing/);assert.throws(()=>H.define('story',[],()=>0),/Duplicate/);
 const x=registry();x.define('cycle/a',['cycle/b'],b=>b);x.define('cycle/b',['cycle/a'],a=>a);assert.throws(()=>x.use('cycle/a'),/Circular/);
});
test('All 64 pipe orientations are traced; exactly one reaches the outlet',()=>{
 let solutions=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++){
  const input=[a,b,c],result=Hydraulics.trace(input,true);
  assert.ok(result.pressure>=0&&result.pressure<=1);assert.ok(result.wet.length<=3);
  assert.equal(new Set(result.wet).size,result.wet.length);
  if(result.connected)solutions.push(input);
  else assert.ok(result.leaks.length>0);
 }
 assert.deepEqual(solutions,[[2,0,3]]);
});
test('No intake means no flow, even with all joints aligned',()=>assert.deepEqual(plain(Hydraulics.trace([2,0,3],false)),{connected:false,wet:[],leaks:[],pressure:0}));
test('Leak stops propagation at the first disconnected port',()=>{
 assert.deepEqual(plain(Hydraulics.trace([0,0,3]).wet),[]);
 assert.deepEqual(plain(Hydraulics.trace([2,1,3]).wet),[0]);
 assert.deepEqual(plain(Hydraulics.trace([2,0,0]).wet),[0,1]);
});
test('Graph rejects malformed or fractional rotations',()=>{
 for(const v of [null,[],[0,1],[0,1,4],[0,1,.5],[0,1,NaN]])assert.throws(()=>Hydraulics.trace(v));
});
test('Recipe is order independent, never combines an item with itself',()=>{
 assert.equal(Items.recipeFor('rope','hook'),'grapple');assert.equal(Items.recipeFor('hook','rope'),'grapple');
 assert.equal(Items.recipeFor('lamp','scarf'),'shade');assert.equal(Items.recipeFor('lamp','lamp'),null);
 assert.equal(Items.recipeFor('felt','hook'),null);
});
test('All items have an illustration and authored physical description',()=>{
 const art=H.use('art');
 for(const id of Object.keys(Story.items)){assert.ok(Items.itemSpecs[id]?.detail,id);assert.match(art.itemArt(id),/<svg/);assert.doesNotMatch(art.itemArt(id),/undefined|NaN/);}
});
test('Affordance rules block remote generic item activation',()=>{
 assert.equal(Items.canUse(4,'pipe0','crank'),false);assert.equal(Items.canUse(4,'pipe0','pole'),true);
 assert.equal(Items.canUse(9,'frida','crank'),false);assert.equal(Items.canUse(9,'frida','pole'),true);
 assert.equal(Items.canUse(1,'wheel','felt'),false);assert.equal(Items.canUse(0,'mom','gearL'),false);
 assert.equal(Items.canUse(0,'mom',null),true);
});
test('Fresh state round trips through strict V3 validation',()=>{
 const state=State.fresh();assert.equal(state.version,3);assert.deepEqual(plain(State.validate(state)),plain(state));
});
test('V2 progression migrates without replaying completed mechanical puzzles',()=>{
 const legacy=State.fresh();legacy.version=2;legacy.f={filter:true,pump:true,towerGate:true};legacy.valves=[2,0,3];
 const result=State.validate(legacy);assert.equal(result.version,3);assert.equal(result.f.pumpPrimed,true);assert.equal(result.f.gearAligned,true);assert.equal(result.f.gearIndex,3);
 assert.ok(result.inventory.includes('pole'));assert.equal(legacy.version,2);assert.equal(legacy.f.poleTaken,undefined);
});
test('Malformed state, impossible chapter, and prototype keys are rejected',()=>{
 for(const mutate of [s=>s.version=9,s=>s.scene=12,s=>s.scene=9,s=>s.inventory=['bad'],s=>s.valves=[2,-1,3],s=>s.settings.sound='yes',s=>s.f.gearIndex=1.2,s=>s.f.pump=true,s=>s.f.ended=true,s=>s.f=JSON.parse('{"__proto__":true}')]){
  const state=State.fresh();mutate(state);assert.throws(()=>State.validate(state));
 }
});
test('Backup is validated separately and a broken primary cannot poison it',()=>{
 const storage=memory(),SaveStore=H.use('engine/storage'),state=State.fresh();
 storage.setItem(key,'{broken');storage.setItem(key+'-backup',JSON.stringify(state));
 const store=new SaveStore(storage,State.validate);assert.equal(store.load().version,3);assert.equal(store.recovered,true);
 state.f.letter=true;store.save(state);assert.equal(JSON.parse(storage.getItem(key+'-backup')).f.letter,undefined);
 assert.equal(JSON.parse(storage.getItem(key)).f.letter,true);
});
test('V2 storage is read but never overwritten by V3 writes',()=>{
 const storage=memory(),SaveStore=H.use('engine/storage'),state=State.fresh();state.version=2;
 const old=JSON.stringify(state);storage.setItem('hilda-echoes-homeward-v2',old);
 const store=new SaveStore(storage,State.validate);store.save(store.load());
 assert.equal(storage.getItem('hilda-echoes-homeward-v2'),old);assert.equal(JSON.parse(storage.getItem(key)).version,3);
});
test('Quota errors propagate without replacing the known-good in-memory snapshot',()=>{
 const storage=memory(),SaveStore=H.use('engine/storage'),store=new SaveStore(storage,State.validate);store.save(State.fresh());
 const old=store.lastGood;storage.setItem=()=>{throw Error('quota');};const next=State.fresh();next.f.letter=true;
 assert.throws(()=>store.save(next),/quota/);assert.equal(store.lastGood,old);
});
test('All scenes have complete content, unique hotspots and deterministic SVG',()=>{
 const art=H.use('art');
 Story.scenes.forEach((scene,i)=>{
  let state=State.fresh();state.scene=i;state.f={};
  const hotspots=scene.hotspots(state);assert.equal(new Set(hotspots.map(h=>h.id)).size,hotspots.length);
  for(const h of hotspots){assert.ok(h.x>=0&&h.x<=1600&&h.y>=0&&h.y<=900,`${i}/${h.id}`);assert.ok(h.w>0&&h.h>0);}
  assert.ok(scene.objective(state));assert.ok(scene.hints(state).length>0);assert.ok(scene.intro.length);
  const svg=art.scene(state);assert.equal(art.scene(state),svg);assert.doesNotMatch(svg,/undefined|NaN/);
 });
});
test('Inspection framing stays inside the playable world on every aspect ratio',()=>{
 const {focusFrame}=H.use('engine/camera');
 for(let i=0;i<12;i++)for(const ratio of [.45,.6,1,16/9,2.4,3.5]){
  const c=focusFrame(i,ratio);assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=1600.001&&c.y+c.h<=900.001);assert.ok(Math.abs(c.w/c.h-ratio)<1e-9);
 }
});
test('Single-file release copies match and contain no remote scripts or styles',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal(html,fs.readFileSync(path.join(root,'hilda-homeward-v2.html'),'utf8'));
 assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href="https?:/);assert.match(html,/engine\/hydraulics/);
});
test('Gear pitch geometry and socket hit boxes agree with the art',()=>{
 const {gears}=H.use('content/mechanisms');
 for(const other of [gears[0],gears[2]]){
   const middle=gears[1],distance=Math.hypot(other.x-middle.x,other.y-middle.y),sum=other.radius+middle.radius;
   assert.ok(distance>sum*.88&&distance<sum,`Teeth must engage: ${other.item}`);
 }
 const state=State.fresh();state.scene=7;
 for(const gear of gears){const h=Story.scenes[7].hotspots(state).find(h=>h.id===gear.socket);assert.equal(h.x,gear.x);assert.equal(h.y,gear.y);}
});
test('Every scene action handles empty and completed states without missing helper functions',()=>{
 for(const filled of [false,true])for(let sceneIndex=0;sceneIndex<12;sceneIndex++){
   const state=State.fresh();state.scene=sceneIndex;state.inventory=Object.keys(Story.items);
   if(filled){for(const f of State.boolFlags)state.f[f]=true;for(const [key,[min,max]] of Object.entries(State.numericFlags))state.f[key]=max;}
   state.f.ended=false;state.f.hug=filled;
   const game={s:state,set:(k,v=true)=>state.f[k]=v,commit(){},take:id=>{if(!state.inventory.includes(id))state.inventory.push(id);},consume:id=>state.inventory=state.inventory.filter(v=>v!==id),toast(){},sound(){},say:(lines,after)=>after?.(),go(){},work:(ms,label,after)=>after?.(),effect(){},note:id=>state.notes.push(id),sketch(){},pulse(){},playSequence(){},finish(){},openEnding(){}};
   const scene=Story.scenes[sceneIndex];
   for(const hotspot of scene.hotspots(state))assert.doesNotThrow(()=>scene.act(game,hotspot.id,null),`${sceneIndex}/${hotspot.id}/${filled}`);
 }
});

test('Action track prepares, contacts and settles without a timer',()=>{
 const {ActionTrack}=H.use('engine/action-track'),t=new ActionTrack(1000,{kind:'pull'});
 assert.equal(t.sample().phase,'prepare');t.advance(300);assert.equal(t.sample().phase,'contact');
 assert.ok(t.sample().reach>.99);t.advance(560);assert.equal(t.sample().phase,'settle');
 t.advance(1000);assert.equal(t.sample().progress,1);assert.equal(t.claim(),true);assert.equal(t.claim(),false);
});
test('Paused and cancelled actions cannot complete or consume twice',()=>{
 const {ActionTrack}=H.use('engine/action-track'),t=new ActionTrack(1000);
 t.advance(420);t.advance(10000,true);assert.equal(t.sample().progress,.42);assert.equal(t.claim(),false);
 t.cancel();t.advance(10000);assert.equal(t.sample().progress,.42);assert.equal(t.claim(),false);
});
test('Action track rejects invalid durations and clocks',()=>{
 const {ActionTrack}=H.use('engine/action-track');
 for(const n of [0,-2,NaN,Infinity])assert.throws(()=>new ActionTrack(n));
 const t=new ActionTrack(300);for(const n of [-1,NaN,Infinity])assert.throws(()=>t.advance(n));
});
test('Arm solver preserves both rigid lengths over a target grid',()=>{
 const {solve}=H.use('engine/kinematics');
 for(let x=-140;x<=140;x+=10)for(let y=-140;y<=140;y+=10)for(const bend of [-1,1]){
  const o=[3,-11],r=solve(o,[x,y],31,33,bend);
  assert.ok(Math.abs(Math.hypot(r.elbow[0]-o[0],r.elbow[1]-o[1])-31)<1e-6);
  assert.ok(Math.abs(Math.hypot(r.end[0]-r.elbow[0],r.end[1]-r.elbow[1])-33)<1e-6);
  assert.ok([...r.elbow,...r.end].every(Number.isFinite));
 }
});
test('Coincident and unreachable contacts never produce NaN or stretching',()=>{
 const {solve}=H.use('engine/kinematics');
 for(const target of [[0,0],[1000,1000],[-1000,0]]){
  const result=solve([0,0],target,25,25);assert.ok([...result.elbow,...result.end].every(Number.isFinite));
  assert.ok(Math.hypot(...result.end)<=50.000001);
 }
 assert.throws(()=>solve([0,0],[NaN,1],25,25));
});
test('Service deck visual profile and actor feet share continuous geometry',()=>{
 const W=H.use('content/walkways'),scene=Story.scenes[4];
 for(let x=61;x<=1540;x++){assert.equal(scene.ground(x),W.waterworksGround(x));assert.ok(Math.abs(scene.ground(x)-scene.ground(x-1))<=.731);}
 for(const [x,y] of W.waterworks)assert.equal(scene.ground(x),y);
 assert.match(W.waterworksPath(),/^M60 793/);assert.throws(()=>W.waterworksGround(NaN));
});
test('All authored action contacts are finite and deterministic',()=>{
 const C=H.use('content/choreography'),s=State.fresh();
 for(const scene of [1,2,4])for(const h of Story.scenes[scene].hotspots(s)){
  const score=C.score(scene,h.id,s,null);if(score.target)assert.ok(score.target.every(Number.isFinite));
  assert.deepEqual(plain(C.score(scene,h.id,s,null)),plain(score));
 }
});
test('New chapter flags round trip without a save schema reset',()=>{
 const s=State.fresh();s.f.bridgeBrace=true;s.f.intakeClosed=true;
 const result=State.validate(s);assert.equal(result.version,3);assert.equal(result.f.intakeClosed,true);assert.equal(result.f.bridgeBrace,true);
});
test('Completed V3 checkpoints keep their solved puzzles after the additive upgrade',()=>{
 const s=State.fresh();s.f={filter:true,poleTaken:true,pumpPrimed:true,pump:true,bridge:true};s.inventory=['pole'];
 const result=State.validate(s);assert.equal(result.f.pump,true);assert.equal(result.f.bridge,true);assert.equal(result.f.intakeClosed,undefined);
});
test('A running pump cannot import with a closed inlet or fractional detents',()=>{
 for(const flags of [{pump:true,pumpPrimed:true,intakeClosed:true},{gateTurns:.2},{bypassTurns:1.8}]){
  const s=State.fresh();s.f=flags;assert.throws(()=>State.validate(s));
 }
});
test('SVG primitives preserve authored stroke and animation attributes',()=>{
 const K=H.use('art/kit');assert.match(K.circle(1,2,3,'#fff','none',0,'class="test"'),/class="test"/);
 assert.match(K.ell(0,0,2,1,'#aaa','#bbb',3),/stroke="#bbb" stroke-width="3"/);
 assert.match(K.ell(0,0,2,1,'#aaa','opacity=".2"'),/opacity=".2"/);
});
test('Filter is not removed until inlet is isolated; objects commit at contact completion',()=>{
 const s=State.fresh(),callbacks=[];
 const g={s,set:(k,v=true)=>s.f[k]=v,take:id=>s.inventory.push(id),toast(){},sound(){},say(){},work:(ms,label,after)=>callbacks.push(after)};
 Story.scenes[4].act(g,'filter',null);assert.equal(callbacks.length,0);assert.equal(s.f.filter,undefined);
 s.f.intakeClosed=true;Story.scenes[4].act(g,'filter',null);assert.equal(callbacks.length,1);assert.equal(s.f.filter,undefined);
 callbacks.shift()();assert.equal(s.f.filter,true);assert.ok(s.inventory.includes('pole'));
});
test('Bridge cannot lift without both anchorage and a companion on the brake',()=>{
 const s=State.fresh(),callbacks=[];
 const g={s,toast(){},say(){},work:(ms,label,after)=>callbacks.push(after)};
 Story.scenes[2].act(g,'winch',null);assert.equal(callbacks.length,0);
 s.f.grappleSet=true;Story.scenes[2].act(g,'winch',null);assert.equal(callbacks.length,0);
 s.f.bridgeBrace=true;Story.scenes[2].act(g,'winch',null);assert.equal(callbacks.length,1);
});


const Stage=H.use('content/setpieces'),Motion=H.use('engine/setpiece-motion');
function gameFor(state){return {s:state,tasks:[],messages:[],set(k,v=true){state.f[k]=v;},work(ms,label,after,score){this.tasks.push({ms,after,score});},toast(t){this.messages.push(t);},say(lines,after){this.messages.push(lines);after?.();},commit(){},sound(){},note(){},take(id){state.inventory.push(id);},consume(id){state.inventory=state.inventory.filter(x=>x!==id);}};}
test('Archive docking is bounded, snapped and rejects non-finite destinations',()=>{
 for(const x of [-100,650,707,940,1165,2500])assert.ok(Stage.snapLadder(x)>=640&&Stage.snapLadder(x)<=1260);
 assert.equal(Stage.snapLadder(1165),1170);assert.equal(Stage.snapLadder(1050),1050);
 for(const x of [NaN,Infinity,undefined])assert.throws(()=>Stage.snapLadder(x));
 const s=State.fresh();assert.equal(Stage.nextDock(s),925);s.f.ladderX=925;assert.equal(Stage.nextDock(s),1170);
});
test('A locked but misaligned ladder cannot grant the archive',()=>{
 const s=State.fresh();s.f.ladderBrake=true;const g=gameFor(s);
 Story.scenes[3].act(g,'book');assert.equal(g.tasks.length,0);assert.ok(!s.f.planTaken);
 s.f.ladderX=1170;assert.equal(Stage.canRead(s),true);Story.scenes[3].act(g,'book');assert.equal(g.tasks.length,1);
 assert.ok(!s.inventory.includes('plan'));g.tasks[0].after();assert.ok(s.f.planTaken);assert.equal(s.inventory.filter(x=>x==='plan').length,1);
});
test('Ladder movement cannot bypass the wheel brake through drag',()=>{
 const s=State.fresh();s.f.ladderBrake=true;const g=gameFor(s);Story.scenes[3].drag(g,'ladder',{x:1170});
 assert.equal(g.tasks.length,0);assert.equal(s.f.ladderX,undefined);
 s.f.ladderBrake=false;Story.scenes[3].drag(g,'ladder',{x:1170});assert.equal(g.tasks.length,1);
 assert.equal(s.f.ladderX,undefined);g.tasks[0].after();assert.equal(s.f.ladderX,1170);
});
test('Archive climb returns to ground; its presentation never moves the saved hero',()=>{
 const {ActionTrack}=H.use('engine/action-track'),base={x:1153,y:819},a=new ActionTrack(3800,{effect:'archiveBook',ladder:1170,origin:base});
 a.advance(1900);const pose=Motion.actor(base,a);assert.equal(pose.y,529);assert.equal(base.y,819);
 assert.equal(Motion.actor(base,a,true).y,819);a.advance(1900);assert.deepEqual(plain(Motion.actor(base,a)),base);
});
test('Rescue anchoring consumes equipment only when the completed action commits',()=>{
 const s=State.fresh();s.inventory=['line'];const g=gameFor(s);Story.scenes[9].act(g,'anchor','line');
 assert.ok(s.inventory.includes('line'));assert.ok(!s.f.roofAnchor);assert.equal(g.tasks.length,1);
 g.tasks[0].after();assert.ok(s.f.roofAnchor);assert.ok(!s.inventory.includes('line'));
});
test('Rescuing David and bracing the beam are distinct, ordered actions',()=>{
 const s=State.fresh(),g=gameFor(s);Story.scenes[9].act(g,'david');assert.equal(g.tasks.length,0);
 s.f.roofAnchor=true;Story.scenes[9].act(g,'david');assert.ok(!s.f.davidSafe);g.tasks.pop().after();assert.ok(s.f.davidSafe);assert.ok(!s.f.roofBrace);
 Story.scenes[9].act(g,'david');g.tasks.pop().after();assert.ok(s.f.roofBrace);
});
test('A pole cannot bypass the companion fulcrum prerequisite and is reusable',()=>{
 const s=State.fresh();s.f.roofAnchor=true;s.f.davidSafe=true;s.inventory=['pole'];const g=gameFor(s);
 Story.scenes[9].act(g,'frida','pole');assert.equal(g.tasks.length,0);assert.ok(!s.f.fridaSafe);
 s.f.roofBrace=true;Story.scenes[9].act(g,'frida','pole');assert.ok(!s.f.fridaSafe);g.tasks[0].after();assert.ok(s.f.fridaSafe);assert.ok(s.inventory.includes('pole'));
});
test('Beacon drag angles use the reachable control wheel, not the high lamp',()=>{
 const a=Stage.wheelAngle({x:1096,y:501});assert.ok(a<-125&&a>-132);
 assert.equal(Stage.wheelAngle({x:1300,y:657}),0);assert.throws(()=>Stage.wheelAngle({x:NaN,y:0}));
});
test('Retreat preserves every completed rescue and never duplicates a secured rope',()=>{
 const s=State.fresh();s.scene=9;s.f={roofAnchor:true,davidSafe:true,roofBrace:true,fridaSafe:true,twigSafe:true,heart:true};s.inventory=['pole'];s.danger=.95;
 const before=plain(s),r=Stage.retreat(s);assert.deepEqual(plain(s),before);assert.deepEqual(plain(r.f),before.f);
 assert.deepEqual(plain(r.inventory),['pole']);assert.equal(r.danger,0);assert.equal(r.failures,1);assert.equal(r.heroX,802);
 assert.notEqual(r.f,s.f);assert.notEqual(r.inventory,s.inventory);
});
test('Retreat before anchoring restores exactly one rope',()=>{
 const s=State.fresh();const r=Stage.retreat(s),r2=Stage.retreat(r);assert.deepEqual(plain(r2.inventory),['line']);assert.equal(r2.heroX,315);
});
test('Completed legacy archives and rescues gain prerequisites without replay',()=>{
 const s=State.fresh();s.f.planTaken=true;s.f.davidSafe=true;s.f.fridaSafe=true;
 const o=State.validate(s);assert.equal(o.f.ladderBrake,true);assert.equal(o.f.roofBrace,true);assert.equal(s.f.roofBrace,undefined);
 const bad=State.fresh();bad.f.roofBrace=true;assert.throws(()=>State.validate(bad));
});
test('Staged actor and companion coordinates stay finite at every phase',()=>{
 const {ActionTrack}=H.use('engine/action-track'),s=State.fresh();s.scene=9;
 for(const effect of ['archiveBook','ladderSlide','roofRescue','roofBrace','roofLever','roofTwig','roofBoard']) {
   const a=new ActionTrack(1000,{effect,origin:{x:950,y:773},ladder:1170,from:769,to:1170});
   for(let i=0;i<=100;i++) {
     const actor=Motion.actor({x:950,y:773},a),cast=Motion.cast(s,a);
     for(const p of [[actor.x,actor.y],...Object.values(cast)])assert.ok(p.every(Number.isFinite),effect);
     a.advance(10);
   }
 }
});

test('Roof beam is drawn behind rescuers so the lifted plank cannot cover their faces',()=>{
 const s=State.fresh();s.scene=9;s.f={roofAnchor:true,davidSafe:true,roofBrace:true,fridaSafe:true};
 const svg=H.use('scene/9/art')(s);
 assert.ok(svg.indexOf('id="roofBeam"')<svg.indexOf('id="roofDavid"'));
 assert.ok(svg.indexOf('id="roofBeam"')<svg.indexOf('id="roofFrida"'));
});

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

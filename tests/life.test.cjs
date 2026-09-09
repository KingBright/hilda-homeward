const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c=vm.createContext({console});
for(const name of ['engine/modules','engine/kinematics','engine/animal-life','engine/idle-life','art/twig-design'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),c);
const A=c.Homeward.use('engine/animal-life'),I=c.Homeward.use('engine/idle-life'),D=c.Homeward.use('art/twig-design');
const plain=v=>JSON.parse(JSON.stringify(v)),distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

test('Twig has exactly four independently addressable limbs and separate secondary parts',()=>{
 const markup=D.markup();assert.equal((markup.match(/data-twig-leg=/g)||[]).length,4);
 for(const part of ['torso','head','ear-a','ear-b','eye','tail'])assert.match(markup,new RegExp('twig-'+part));
 assert.doesNotMatch(markup,/id=/);
});
test('Repositioning a companion increments the render revision, even in the same scene',()=>{
 const f=new A.Follower(540);const a=f.snapshot();f.reset(680);assert.equal(f.snapshot().revision,a.revision+1);assert.equal(f.v,0);
});
test('Follower accelerates, catches up, brakes and comes to rest without endless drift',()=>{
 const f=new A.Follower(0,1);let previous=0;
 for(let i=0;i<480;i++){f.update(400,1/60);assert.ok(f.x>=previous-1e-6);assert.ok(Math.abs(f.v)<=410);previous=f.x;}
 assert.ok(Math.abs(f.x-400)<2.1);assert.equal(f.v,0);const x=f.x;
 for(let i=0;i<100;i++)f.update(400,1/60);assert.equal(f.x,x);
});
test('Follower reversal has a stopped turning phase rather than copying hero facing',()=>{
 const f=new A.Follower(0,1);for(let i=0;i<60;i++)f.update(300,1/60);
 let turning=false,reversed=false;for(let i=0;i<300;i++){f.update(-100,1/60);if(f.turn>0){turning=true;assert.equal(f.v,0);}if(f.face===-1)reversed=true;}
 assert.ok(turning&&reversed);assert.ok(Math.abs(f.x+100)<2.1);
});
test('Follower pause is a true no-op and frame rates converge to the same endpoint',()=>{
 const f=new A.Follower(100,1),before=plain(f.snapshot());f.update(700,100,{paused:true});assert.deepEqual(plain(f.snapshot()),before);
 const results=[30,60,120].map(rate=>{const f=new A.Follower(0,1);for(let i=0;i<rate*6;i++)f.update(500,1/rate);return f.x;});
 assert.ok(Math.max(...results)-Math.min(...results)<.25);
});
for(const speed of [45,120,250,400])test(`Planted hooves retain world contacts at ${speed} units per second`,()=>{
 for(const face of [-1,1])for(const rate of [30,60]){
  const rig=new A.Feet();let worst=0;
  for(let i=0;i<rate*4;i++){
   const x=i*speed/rate*face,y=100,scale=1.4,feet=rig.update({x,y,scale,face,speed:speed*face,dt:1/rate,ground:()=>y});
   const secondary=A.secondary({time:i/rate,speed:speed*face}),pose=A.pose(feet,{x,y,scale,face,secondary});
   assert.ok(feet.filter(f=>f.phase===1).length>=2,'at least two support legs');
   for(let k=0;k<4;k++){
    assert.ok(Math.abs(distance(pose[k].origin,pose[k].elbow)-19)<1e-6);
    assert.ok(Math.abs(distance(pose[k].elbow,pose[k].end)-20)<1e-6);
    if(pose[k].planted){const actual=[x-face*pose[k].end[0]*scale,y+pose[k].end[1]*scale];worst=Math.max(worst,distance(actual,[feet[k].x,feet[k].y]));}
   }
  }
  assert.ok(worst<.02,`rate=${rate},face=${face},contact residual=${worst}`);
 }
});
test('Slope-aware feet and body reach the same inclined ground',()=>{
 for(const slope of [-1.5,-.5,.5,1.5])for(const face of [-1,1]){
  const rig=new A.Feet(),ground=x=>100+x*slope;let worst=0;
  for(let i=0;i<180;i++){const x=i*1.2*face,y=ground(x),scale=1.4,feet=rig.update({x,y,scale,face,speed:72*face,dt:1/60,ground});
   const secondary=A.secondary({time:i/60,speed:72}),pose=A.pose(feet,{x,y,scale,face,secondary,ground});
   for(let k=0;k<4;k++)if(pose[k].planted)worst=Math.max(worst,distance([x-face*pose[k].end[0]*scale,y+pose[k].end[1]*scale],[feet[k].x,feet[k].y]));
  }assert.ok(worst<.02,`slope=${slope},face=${face},residual=${worst}`);
 }
});
test('Side turn retains the existing hoof contact set',()=>{
 const rig=new A.Feet(),ground=()=>0;rig.update({x:100,y:0,face:1,scale:1.4,ground});const before=rig.feet.map(f=>f.x).sort((a,b)=>a-b);
 rig.update({x:100,y:0,face:-1,scale:1.4,ground});assert.deepEqual(plain(rig.feet.map(f=>f.x).sort((a,b)=>a-b)),plain(before));
});
test('A stopped animal finishes its last steps and then keeps all four feet planted',()=>{
 const rig=new A.Feet();for(let i=0;i<60;i++)rig.update({x:i*2,y:0,scale:1.4,face:1,speed:120,dt:1/60,ground:()=>0});
 for(let i=0;i<180;i++)rig.update({x:118,y:0,scale:1.4,face:1,speed:0,dt:1/60,ground:()=>0});
 const before=plain(rig.feet);for(let i=0;i<120;i++)rig.update({x:118,y:0,scale:1.4,face:1,speed:0,dt:1/60,ground:()=>0});
 assert.deepEqual(plain(rig.feet),before);assert.ok(rig.feet.every(f=>f.phase===1));
});
test('Sniffing and listening occur with pauses, while dialogue and rescue suppress them',()=>{
 const modes=new Set();for(let i=0;i<180;i++)modes.add(A.secondary({time:i/10,idle:20}).mode);
 for(const mode of ['rest','sniff','listen'])assert.ok(modes.has(mode));
 for(let i=0;i<180;i++){assert.notEqual(A.secondary({time:i/10,idle:20,attentive:true}).mode,'sniff');assert.equal(A.secondary({time:i/10,idle:20,airborne:true}).mode,'carried');}
});
test('Reduced animal life is time invariant; invalid inputs fail explicitly',()=>{
 const sample=A.secondary({reduced:true});for(const time of [0,1,5,100])assert.deepEqual(plain(A.secondary({reduced:true,time,speed:300,idle:20})),plain(sample));
 assert.throws(()=>new A.Follower(NaN));assert.throws(()=>new A.Follower().update(0,-1));assert.throws(()=>A.secondary({time:Infinity}));
});
test('Four NPCs have distinct gestures, quiet beats and asynchronous breathing',()=>{
 const signatures=[];
 for(const who of ['希尔达','大卫','芙丽达','妈妈']){
  const samples=Array.from({length:250},(_,i)=>I.sample({who,time:i/10}));
  assert.ok(samples.some(s=>s.gesture>.95));assert.ok(samples.filter(s=>s.gesture===0).length>150);
  signatures.push(JSON.stringify(samples));
 }
 assert.equal(new Set(signatures).size,4);
});
test('Occupied NPCs leave their work pose alone and reduced NPCs stop secondary motion',()=>{
 for(const who of Object.keys(I.profiles))for(let i=0;i<200;i++){
  const reserved=I.sample({who,time:i/10,reserved:true});assert.equal(reserved.gesture,0);assert.equal(reserved.shift,0);assert.equal(reserved.breath,0);
  const r=I.sample({who,time:i/10,reduced:true});for(const key of ['gesture','shift','breath','lean','look','head'])assert.equal(Math.abs(r[key]),0);
 }
});

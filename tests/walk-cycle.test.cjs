const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c=vm.createContext({console});
for(const f of ['engine/modules','engine/kinematics','engine/action-track','engine/idle-life','engine/walk-cycle','engine/body-motion'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f+'.js'),'utf8'),c);
const W=c.Homeward.use('engine/walk-cycle'),B=c.Homeward.use('engine/body-motion');
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const bend=j=>Math.acos(Math.max(-1,Math.min(1,((j.elbow[0]-j.origin[0])*(j.end[0]-j.elbow[0])+(j.elbow[1]-j.origin[1])*(j.end[1]-j.elbow[1]))/(dist(j.origin,j.elbow)*dist(j.elbow,j.end)))))*180/Math.PI;
test('Walking has a nearly straight support leg and low-clearance swing, without a crouched pelvis',()=>{
 for(const scale of [1.36,1.52,1.6,1.92])for(let i=0;i<=1000;i++){
  const p=W.sample({distance:i/1000*scale*W.stride,scale});
  assert.ok(p.bodyY<=.1&&p.bodyY>=-2.71,p.bodyY);
  for(const leg of Object.values(p.legs)){
   assert.ok(bend(leg)<32,`knee ${bend(leg)}`);
   if(leg.planted)assert.ok(Math.abs(leg.end[1]+3)<1e-6,'support ankle remains at its floor height');
   assert.ok(Math.abs(dist(leg.origin,leg.elbow)-24)<1e-6);
   assert.ok(Math.abs(dist(leg.elbow,leg.end)-24)<1e-6);
  }
 }
});
test('Walking arm swing preserves relaxed elbow flexion and both bone lengths at every phase',()=>{
 for(let i=0;i<=1000;i++)for(const amount of [0,.25,.6,1]){
  const p=W.sample({distance:i/1000*W.stride,amount});
  for(const arm of [p.armFront,p.armBack]){
   assert.ok(bend(arm)>5&&bend(arm)<18,`elbow ${bend(arm)}`);
   assert.ok(Math.abs(dist(arm.origin,arm.elbow)-25)<1e-6);
   assert.ok(Math.abs(dist(arm.elbow,arm.end)-27)<1e-6);
  }
 }
});
test('During steady translation each supporting foot stays fixed in world coordinates',()=>{
 for(const side of ['Back','Front']){let old=null;
  for(let i=0;i<1000;i++){
   const x=i*.13,p=W.sample({distance:x,scale:1.6}),j=p.legs[side],world=x+j.end[0]*1.6;
   if(old&&j.planted&&old.planted)assert.ok(Math.abs(world-old.world)<1e-7);
   old={world,planted:j.planted};
  }
 }
});
test('The loop seam and settle blend have no joint teleport and zero-blend is phase independent',()=>{
 const signature=p=>[...p.armFront.end,...p.armBack.end,...p.legs.Front.end,...p.legs.Back.end,p.bodyY];
 const a=signature(W.sample({distance:W.stride-1e-6})),b=signature(W.sample({distance:1e-6}));assert.ok(Math.max(...a.map((v,i)=>Math.abs(v-b[i])))<.001);
 const zero=signature(W.sample({amount:0}));for(let i=0;i<64;i++)assert.deepEqual(signature(W.sample({distance:i,amount:0})),zero);
});
test('Neutral left and right hands are exact mirrors and both are outside the coat silhouette',()=>{
 const p=W.sample({amount:0});for(const k of ['origin','elbow','end']){assert.ok(Math.abs(p.armFront[k][0]+p.armBack[k][0])<1e-6);assert.ok(Math.abs(p.armFront[k][1]-p.armBack[k][1])<1e-6);}
 assert.ok(p.armFront.end[0]>30&&p.armBack.end[0]<-30);
});
test('Body renderer delegates walking to the shared gait instead of superimposing a squat',()=>{
 for(let i=0;i<64;i++){
  const p=B.sample({moving:true,distance:i,scale:1.52,time:2}),g=W.sample({distance:i,scale:1.52});
  assert.equal(JSON.stringify(p.legs),JSON.stringify(g.legs));assert.equal(p.offset[1],g.bodyY);
 }
});
test('Reduced motion is stationary and invalid inputs fail before producing a transform',()=>{
 const p=W.sample({reduced:true,distance:0});for(const distance of [1,10,100]){
  const q=W.sample({reduced:true,distance});assert.equal(JSON.stringify(q.legs),JSON.stringify(p.legs));
 }
 for(const input of [{distance:NaN},{scale:0},{scale:-1},{amount:Infinity}])assert.throws(()=>W.sample(input));
});

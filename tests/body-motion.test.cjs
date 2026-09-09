const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context=vm.createContext({console});
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
vm.runInContext(fs.readFileSync(path.join(root,'src/engine/modules.js'),'utf8'),context);
for(const f of files(path.join(root,'src')).filter(f=>f.endsWith('.js')&&!f.endsWith('/modules.js')&&!f.endsWith('/bootstrap.js')))vm.runInContext(fs.readFileSync(f,'utf8'),context);
const H=context.Homeward,Motion=H.use('engine/body-motion'),Staging=H.use('content/staging'),Choreo=H.use('content/choreography'),Story=H.use('story'),State=H.use('engine/state'),{ActionTrack}=H.use('engine/action-track');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const pickups=[[0,'lamp'],[0,'bird'],[0,'mom'],[1,'crank'],[2,'rope'],[5,'line'],[7,'gearS'],[7,'gearM'],[7,'gearL'],[8,'felt']];
function sample(scene,id,p,faceOverride){
 const state=State.fresh();if(scene===1)state.f.awning=true;
 const score=Choreo.score(scene,id,state),hotspot=Story.scenes[scene].hotspots(state).find(h=>h.id===id);
 const x=score.approachX??hotspot.walkX??hotspot.x-48,y=Story.scenes[scene].ground(x,state),scale=Staging.scale(scene),face=faceOverride??(score.target[0]<x?-1:1);
 const track=new ActionTrack(1000,score);track.advance(p*1000);
 return {x,y,scale,face,score,pose:Motion.sample({x,y,face,scale,score,frame:track.sample()})};
}
for(const [scene,id] of pickups)test(`Physical pickup ${scene}/${id} contacts before moving to backpack`,()=>{
 const {x,y,scale,face,score,pose}=sample(scene,id,.45);
 assert.equal(score.pickup,true);
 const actual=[x+pose.armFront.end[0]*scale*face,y+pose.armFront.end[1]*scale];
 assert.ok(distance(actual,score.target)<2,`${scene}/${id}: contact residual ${distance(actual,score.target)} px`);
 assert.equal(sample(scene,id,.3).pose.propVisible,false);
 assert.equal(sample(scene,id,.55).pose.propVisible,true);
 assert.equal(sample(scene,id,1).pose.propVisible,false);
});
test('Arm bones stay exactly 25 and 27 units through all pickup and mirrored poses',()=>{
 for(const [scene,id] of pickups)for(const face of [-1,1])for(let i=0;i<=100;i++){
  const {pose}=sample(scene,id,i/100,face);
  for(const arm of [pose.armFront,pose.armBack]){
   assert.ok(Math.abs(distance(arm.origin,arm.elbow)-25)<1e-7);
   assert.ok(Math.abs(distance(arm.elbow,arm.end)-27)<1e-7);
   assert.ok([...arm.origin,...arm.elbow,...arm.end,arm.wrist].every(Number.isFinite));
  }
 }
});
test('Pickup motion is continuous across approach, grasp, transfer and settle boundaries',()=>{
 for(const [scene,id] of pickups){let previous=sample(scene,id,0).pose;
  for(let i=1;i<=1000;i++){
   const current=sample(scene,id,i/1000).pose;
   assert.ok(distance(previous.armFront.end,current.armFront.end)<3,`${scene}/${id}/${i}`);
   assert.ok(distance(previous.armBack.end,current.armBack.end)<3);
   previous=current;
  }
 }
});
test('Same pose inputs are seekable, do not mutate the action, and return to rest',()=>{
 const a=sample(0,'lamp',.4),b=sample(0,'lamp',.4);
 assert.deepEqual(JSON.parse(JSON.stringify(a.pose)),JSON.parse(JSON.stringify(b.pose)));
 for(const [scene,id] of pickups){const start=sample(scene,id,0).pose,end=sample(scene,id,1).pose;
  assert.ok(distance(start.armFront.end,end.armFront.end)<1e-6);
  assert.ok(distance(start.armBack.end,end.armBack.end)<1e-6);
 }
});
test('Home sill sits below the child face; the adult is taller without being a giant',()=>{
 const scale=Staging.scale(0),eye=Staging.home.floor-111*scale;
 assert.ok(Staging.home.sill>eye+35 && Staging.home.sill<Staging.home.floor-100);
 const adult=Staging.castScale('妈妈',1.9,0);
 assert.ok(adult/scale>1.15&&adult/scale<1.4);
 assert.equal(Staging.scale(11),scale);
 assert.ok(Story.scenes[0].start-579>180);
 assert.ok(Staging.petDistance(0)>115);
 assert.equal(Staging.petDistance(9),85);
});
test('Home portrait coordinates stay independent of stage scaling',()=>{
 const K=H.use('art/kit'),P=H.use('art/props');
 const s=State.fresh();K.setVisualState(s);const home=P.portrait('希尔达');
 s.scene=4;K.setVisualState(s);assert.equal(P.portrait('希尔达'),home);
});
test('Tower ramp lets fixed-length hands reach all three actual sockets',()=>{
 for(const id of ['socketS','socketM','socketL']){
  const {x,y,scale,face,score,pose}=sample(7,id,.45),actual=[x+pose.armFront.end[0]*scale*face,y+pose.armFront.end[1]*scale];
  assert.ok(distance(actual,score.target)<2,id+': '+distance(actual,score.target));
 }
 const W=H.use('content/walkways');for(let x=61;x<1540;x++)assert.ok(Math.abs(W.towerGround(x)-W.towerGround(x-1))<2.1);
});
test('Clock access presentation returns to its starting floor without changing the base',()=>{
 const S=H.use('engine/setpiece-motion'),base=Object.freeze({x:789,y:833,face:1});
 const track=new ActionTrack(2800,{effect:'clockPad',accessY:617});
 track.advance(1400);assert.equal(S.actor(base,track).y,617);
 track.advance(1400);assert.equal(S.actor(base,track).y,833);assert.equal(base.y,833);
});
test('Invalid actor coordinates are rejected before generating SVG',()=>{
 for(const input of [{x:NaN},{y:Infinity},{scale:0},{time:Infinity}])assert.throws(()=>Motion.sample(input));
});

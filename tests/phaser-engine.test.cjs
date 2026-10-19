const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
function scan(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
function createRegistry(){
  const context=vm.createContext({console,URLSearchParams});
  vm.runInContext(fs.readFileSync(path.join(root,'src/engine/modules.js'),'utf8'),context);
  for(const file of scan(path.join(root,'src')).filter(p=>p.endsWith('.js')&&!p.endsWith('/modules.js')&&!p.endsWith('/bootstrap.js'))){
    vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  }
  return context.Homeward;
}

const H=createRegistry();
const State=H.use('engine/state');
const Story=H.use('story');
const HDAssets=H.use('engine/hd-assets');
const Contraptions=H.use('engine/contraptions');
const PhaserStage=H.use('engine/phaser-stage');

test('HDAssets decomposes all 12 scenes into 5 parallax depth layers with dynamic lights',()=>{
  assert.equal(HDAssets.DEFAULT_HD_SCALE,2);
  assert.equal(HDAssets.WORLD_W,1600);
  assert.equal(HDAssets.WORLD_H,900);
  for(let i=0;i<12;i++){
    const s=State.fresh();
    s.scene=i;
    const desc=HDAssets.decomposeSceneLayers(s,false);
    assert.equal(desc.sceneIndex,i);
    assert.equal(desc.parallax.length,5,`scene ${i} has 5 parallax planes`);
    assert.deepEqual([...desc.parallax.map(p=>p.key)],['sky','midground','architecture','actors','foreground']);
    assert.ok(Array.isArray(desc.lights)&&desc.lights.length>=1,`scene ${i} has dynamic point lights`);
    for(const l of desc.lights){
      assert.ok(Number.isFinite(l.x)&&Number.isFinite(l.y)&&l.r>0,`scene ${i} light ${l.id}`);
    }
  }
});

test('Machinarium contraptions define 12 bespoke workbenches and pictographic thought doodles',()=>{
  assert.equal(Contraptions.CONTRAPTION_SPECS.length,12);
  const ids=new Set();
  for(let i=0;i<12;i++){
    const spec=Contraptions.specFor(i);
    assert.equal(spec.scene,i);
    assert.ok(spec.id&&!ids.has(spec.id),`unique contraption id for scene ${i}`);
    ids.add(spec.id);
    assert.ok(spec.code&&spec.title&&spec.subtitle,`scene ${i} has code, title, subtitle`);
    const freshState=State.fresh();
    freshState.scene=i;
    const steps=spec.steps(freshState);
    assert.ok(Array.isArray(steps)&&steps.length>=3,`scene ${i} has multi-step contraption`);
    assert.equal(steps.every(st=>st.done),false,`scene ${i} starts unsolved`);
    const doodle=Contraptions.doodleMarkup(i,freshState);
    assert.match(doodle,/<svg viewBox="0 0 232 108"/);
    assert.doesNotMatch(doodle,/undefined|NaN/);
  }
});

test('Machinarium contraption steps execute cleanly and respect puzzle state across all 12 scenes',()=>{
  for(let sceneIndex=0;sceneIndex<12;sceneIndex++){
    const state=State.fresh();
    state.scene=sceneIndex;
    state.inventory=Object.keys(Story.items);
    const game={
      s:state,
      set:(k,v=true)=>{state.f[k]=v;},
      commit(){},
      take:id=>{if(!state.inventory.includes(id))state.inventory.push(id);},
      consume:id=>{state.inventory=state.inventory.filter(v=>v!==id);},
      toast(){},
      sound(){},
      say:(lines,after)=>after?.(),
      go(){},
      work:(ms,label,after)=>after?.(),
      effect(){},
      note:id=>{if(!state.notes.includes(id))state.notes.push(id);},
      sketch(){},
      pulse(){},
      playSequence(){},
      finish(){},
      openEnding(){}
    };
    const spec=Contraptions.specFor(sceneIndex);
    for(const step of spec.steps(state)){
      const res=Contraptions.executeContraptionStep(game,sceneIndex,step.id);
      assert.equal(typeof res,'boolean',`scene ${sceneIndex} step ${step.id}`);
    }
  }
});

test('PhaserStageController posture stretch/crouch clamps safely and syncs rig snapshot',()=>{
  const ctrl=new PhaserStage.PhaserStageController();
  assert.equal(ctrl.postureOffset,0);
  ctrl.setPosture(40);
  assert.equal(ctrl.targetPosture,18);
  ctrl.setPosture(-40);
  assert.equal(ctrl.targetPosture,-22);
  ctrl.setPosture(0);
  assert.equal(ctrl.targetPosture,0);
  const snap=ctrl.syncFrame({state:State.fresh(),elapsed:1.2,hero:{x:790,y:775,face:1}});
  assert.ok(Number.isFinite(snap.hero.pelvis[0])&&Number.isFinite(snap.hero.pelvis[1]));
  const status=ctrl.getStatus();
  assert.equal(typeof status.engine,'string');
  assert.equal(status.frameCount,1);
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),c=vm.createContext({console,URLSearchParams});
const scan=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(path.join(d,e.name)):[path.join(d,e.name)]);
vm.runInContext(fs.readFileSync(path.join(root,'src/engine/modules.js'),'utf8'),c);
for(const f of scan(path.join(root,'src')).filter(f=>f.endsWith('.js')&&!f.endsWith('/modules.js')&&!f.endsWith('/bootstrap.js')))vm.runInContext(fs.readFileSync(f,'utf8'),c);
const H=c.Homeward,M=H.use('engine/body-motion'),I=H.use('engine/idle-life'),K=H.use('engine/kinematics'),R=H.use('engine/readability'),C=H.use('art/cast-design'),S=H.use('art/species-life');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const bend=j=>{const a=[j.elbow[0]-j.origin[0],j.elbow[1]-j.origin[1]],b=[j.end[0]-j.elbow[0],j.end[1]-j.elbow[1]];return Math.acos(Math.max(-1,Math.min(1,(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b)))))*180/Math.PI;};
test('Hero relaxed arms are mirrored and mildly bent, not folded into the waist',()=>{
 const p=M.sample({reduced:true});const a=p.armFront,b=p.armBack;
 for(const key of ['origin','elbow','end']){assert.ok(Math.abs(a[key][0]+b[key][0])<1e-6);assert.ok(Math.abs(a[key][1]-b[key][1])<1e-6);}
 assert.ok(bend(a)>5&&bend(a)<35);assert.ok(a.end[1]>-33);
});
test('Every human neutral arm uses the opposite elbow branch and a relaxed wrist height',()=>{
 for(const who of Object.keys(I.profiles)){const s=I.sample({who,reduced:true}),a={origin:[19,-79],...K.solve([19,-79],s.front,25,27,-1)},b={origin:[-19,-79],...K.solve([-19,-79],s.back,25,27,1)};
  assert.ok(bend(a)<35&&bend(b)<35,who);assert.ok(Math.abs(a.elbow[0]+b.elbow[0])<1e-6);assert.equal(a.end[1],b.end[1]);}
});
test('NPC hands have a prepaint mirrored outline and species do not become fallback humans',()=>{
 const markup=C.standing('妈妈');assert.match(markup,/scale\(-1 1\)/);
 for(const [fn,name] of [['elf','阿尔弗'],['troll','小巨魔'],['woff','沃夫']]){const art=C[fn]();assert.ok(art.includes(`data-cast="${name}"`));assert.ok(art.includes('data-life-eye'));assert.ok(art.includes('data-life-mouth'));}
 assert.ok(C.troll(true).includes('data-other-life="mother"'));
});
test('Ground objects outrank an overlapping NPC for both hit testing and visual hotspot order',()=>{
 const actor={id:'david',x:331,y:705,w:120,h:180},rope={id:'rope',kind:'take',x:331,y:725,w:72,h:65};
 for(const input of [[actor,rope],[rope,actor]]){assert.equal(R.pick(input,{x:331,y:725}).id,'rope');assert.equal(R.order(input).at(-1).id,'rope');}
 assert.equal(R.pick([actor,rope],{x:331,y:655}).id,'david');
});
test('The rescued rooftop companion and secured anchor remain separately clickable',()=>{
 const state=H.use('engine/state').fresh();state.scene=9;state.f.roofAnchor=true;state.f.davidSafe=true;
 const hotspots=H.use('story').scenes[9].hotspots(state),stage=H.use('content/setpieces');
 for(const id of ['anchor','david']){const h=hotspots.find(h=>h.id===id);assert.equal(R.pick(hotspots,{x:h.x,y:h.y}).id,id);}
 assert.equal(hotspots.find(h=>h.id==='david').x,stage.roof.safe[0]);
 assert.equal(stage.roofGround(stage.roof.safe[0]),stage.roof.safe[1]);
});
test('All twelve worlds omit prose labels without removing number-based puzzle markings',()=>{
 const art=H.use('art'),State=H.use('engine/state');
 for(let scene=0;scene<12;scene++){const s=State.fresh();s.scene=scene;const labels=[...art.scene(s).matchAll(/<text\b[^>]*>(.*?)<\/text>/g)].map(m=>m[1]);assert.ok(labels.every(t=>!/[\u3400-\u9fff]/u.test(t)),scene+': '+labels.join(','));}
 const kit=H.use('art/kit');assert.equal(kit.sceneText(0,0,'下一步去哪里'),'');assert.match(kit.sceneText(0,0,'Ⅳ'),/<text/);assert.match(kit.sceneText(0,0,3),/>3<\/text>/);
});
test('Removed guide boards are replaced by spoken observation and a real archive book glyph',()=>{
 for(const scene of ['02-forest','04-waterworks'])assert.doesNotMatch(fs.readFileSync(path.join(root,'src/scenes',scene,'logic.js'),'utf8'),/铭牌|检修牌|沿路标/);
 const state=H.use('engine/state').fresh();state.scene=3;assert.match(H.use('art').scene(state),/data-clue="water"/);
});
test('Species blinking stays bounded, deterministic and respects reduced motion',()=>{
 for(const kind of Object.keys(S.profiles)){let low=1,high=0;
  for(let i=0;i<1200;i++){const a=S.sample({kind,time:i/100}),b=S.sample({kind,time:i/100});assert.equal(JSON.stringify(a),JSON.stringify(b));assert.ok(a.blink>=.059&&a.blink<=1);low=Math.min(low,a.blink);high=Math.max(high,a.blink);}
  assert.ok(low<.1&&high===1,kind);const still=S.sample({kind,reduced:true});for(const time of [0,3,15])assert.equal(JSON.stringify(S.sample({kind,time,reduced:true})),JSON.stringify(still));}
});

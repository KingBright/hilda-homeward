/** Apply animal life to the live game, shared portraits and isolated workbenches. */
Homeward.define('art/creature-life', ['engine/animal-life'], Animal => {
  const roots=new WeakMap(),tracks=new WeakMap();
  const fixed=x=>x.toFixed(3);
  const put=(n,k,v)=>{if(n&&n.getAttribute(k)!==String(v))n.setAttribute(k,String(v));};
  function refresh(root){
    if(!root)return;
    roots.set(root,[...root.querySelectorAll('[data-animal-rig="twig"]')].map(actor=>{
      const parts=Object.fromEntries(['heading','torso','head','tail','ear-a','ear-b','eye','shadow'].map(k=>[k,actor.querySelector('.twig-'+k)]));
      const legs=[0,1,2,3].map(i=>{const group=actor.querySelector(`[data-twig-leg="${i}"]`);return {group,paths:[...group.querySelectorAll(':scope > path')],hoof:group.querySelector('.twig-hoof')};});
      if(parts.eye){parts.eye.setAttribute('data-scripted-eye','true');parts.eye.style.transformOrigin='0px 0px';parts.eye.style.transformBox='view-box';}
      return {actor,parts,legs};
    }));
  }
  function paint(root,time,{paused=false,reduced=false,scene=0,flags={},pet=null,heroX=null,ground=null,portrait=false,speaking=false}={}){
    if(!root||paused)return;if(!roots.has(root))refresh(root);
    const svg=root.tagName?.toLowerCase()==='svg'?root:root.querySelector('svg');
    const base=svg?.getCTM();if(!base)return;
    const inverse=base.inverse();
    const entries=roots.get(root).map(e=>({...e,m:inverse.multiply(e.actor.getCTM())}));
    for(const {actor,parts,legs,m} of entries){
      const x=m.e,y=m.f,scale=Math.max(.01,Math.hypot(m.a,m.b));
      const followed=!portrait&&!!actor.closest('#twigPosition');
      let track=tracks.get(actor);
      if(!track||track.scene!==scene||followed&&track.revision!==pet?.revision){track={x,time,scene,revision:pet?.revision,idle:0,face:pet?.face??1,feet:new Animal.Feet()};tracks.set(actor,track);}
      const dt=Math.max(0,Math.min(.1,time-track.time)),dx=x-track.x;
      const airborne=scene===9&&(!!flags.roofDone||!!pet?.boarding);
      let speed=portrait||airborne?0:followed&&pet?pet.speed:dt>0&&Math.abs(dx)<100?dx/dt:0;
      if(Math.abs(speed)>4)track.face=speed<0?-1:1;
      if(followed&&pet)track.face=pet.face;
      if(portrait)track.face=-1;
      track.idle=Math.abs(speed)<3?track.idle+dt:0;
      const face=track.face;
      const floor=portrait||airborne||!ground?()=>y:px=>ground(px)+(y-ground(x));
      const feet=track.feet.update({x,y,scale,face,dt,speed,reduced,airborne,ground:floor});
      const attentive=speaking||(!portrait&&Number.isFinite(heroX)&&Math.abs(heroX-x)<80);
      const secondary=Animal.secondary({time,idle:track.idle,speed,turn:followed?pet?.turn??0:0,attentive,airborne,reduced,seed:portrait?2.4:0});
      const pose=Animal.pose(feet,{x,y,scale,face,secondary,airborne,ground:floor});
      const slope=airborne?0:-face*Animal.terrain(x,scale,floor)*180/Math.PI;
      // Width changes affect the torso only, so planted hooves do not slide during a turn.
      put(parts.heading,'transform',`scale(${-face} 1)`);
      put(parts.torso,'transform',`translate(0 ${fixed(secondary.bodyY)}) rotate(${fixed(slope)}) scale(${fixed(secondary.turnWidth)} 1)`);
      put(parts.head,'transform',`translate(0 ${fixed(secondary.headY)}) rotate(${fixed(secondary.head)} -22 -28)`);
      put(parts.tail,'transform',`rotate(${fixed(secondary.tail)} 20 -26)`);
      put(parts['ear-a'],'transform',`rotate(${fixed(secondary.earA)} -42 -51)`);
      put(parts['ear-b'],'transform',`rotate(${fixed(secondary.earB)} -29 -53)`);
      put(parts.eye,'transform',`translate(0 -42) scale(1 ${fixed(secondary.blink)}) translate(0 42)`);
      put(parts.shadow,'opacity',airborne?.15:1);
      for(let i=0;i<4;i++){
        const leg=pose[i],node=legs[i];
        const d=`M${leg.origin.map(fixed)}L${leg.elbow.map(fixed)}L${leg.end.map(fixed)}`;
        node.paths.forEach(p=>put(p,'d',d));put(node.hoof,'transform',`translate(${leg.end.map(fixed).join(' ')})`);
        put(node.group,'data-planted',leg.planted);put(node.group,'data-contact',feet[i].contact);
      }
      put(actor,'data-life',secondary.mode);put(actor,'data-speed',fixed(speed));put(actor,'data-facing',face);
      track.x=x;track.time=time;
    }
  }
  return {refresh,paint};
});

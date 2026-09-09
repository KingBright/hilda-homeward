/** Pure, seekable staging. An interrupted performance has no permanent effects. */
Homeward.define('engine/setpiece-motion', ['engine/action-track','content/setpieces'], ({smooth}, Stage) => {
  const segment=(p,a,b)=>smooth((p-a)/(b-a));
  const mix=(a,b,t)=>a+(b-a)*t;
  function actor(base,action,reduced=false) {
    if(!action)return {...base};
    const c=action.score,p=action.sample().progress,e=action.sample().effort;
    if(reduced)return {...base};
    if(c.effect==='ladderSlide')return {...base,x:c.origin.x+(c.to-c.from)*e};
    if(c.effect==='archiveBook') {
      const climb=segment(p,.10,.43)*(1-segment(p,.69,.95));
      const position=segment(p,0,.14)*(1-segment(p,.93,1));
      return {...base,x:mix(base.x,c.ladder+5,position),y:base.y-Stage.archive.climb*climb};
    }
    if(c.effect==='roofBoard')return {...base,x:mix(base.x,1392,segment(p,.08,.68)),y:mix(base.y,575,segment(p,.08,.68))-Math.sin(segment(p,.08,.68)*Math.PI)*25};
    return {...base};
  }
  function cast(state,action,reduced=false) {
    const f=state.f,c=action?.score,p=action?.sample().progress??0;
    let david=f.roofBrace?[...Stage.roof.brace]:f.davidSafe?[...Stage.roof.safe]:[...Stage.roof.david];
    let frida=f.fridaSafe?[842,759]:[1160,773],twig=[929,723];
    if(!reduced&&c?.effect==='roofRescue') {
      const t=segment(p,.34,.90);david=[mix(670,466,t),mix(710,767,t)-Math.sin(t*Math.PI)*58];
    }
    if(!reduced&&c?.effect==='roofBrace') {
      const t=segment(p,.12,.88),x=mix(466,1069,t);david=[x,Stage.roofGround(x)];
    }
    if(!reduced&&c?.effect==='roofLever') {
      const t=segment(p,.43,.84);frida=[mix(1160,842,t),mix(773,759,t)];
    }
    if(!reduced&&c?.effect==='roofTwig') {
      const t=segment(p,.23,.85);twig=[mix(929,c.origin.x+45,t),mix(723,c.origin.y,t)-Math.sin(t*Math.PI)*64];
    }
    if(!reduced&&c?.effect==='roofBoard') {
      const t=segment(p,.05,.78);
      david=[mix(david[0],1368,t),mix(david[1],578,t)];frida=[mix(frida[0],1428,t),mix(frida[1],578,t)];
    }
    if(state.f.roofDone){david=[1368,578];frida=[1428,578];twig=[1345,590];}
    return {david,frida,twig};
  }
  return {segment,actor,cast};
});

/** Distance-driven companion gait. No simulation state or puzzle flags are written. */
Homeward.define('art/cast-motion', [], () => {
 const tracks=new WeakMap();
 function animate(root,time,reduced=false,action=null,paused=false){
  if(paused)return;
  for(const id of ['davidFollow','fridaFollow','roofDavid','roofFrida']){
   const actor=root.querySelector('#'+id);if(!actor)continue;
   const value=actor.getAttribute('transform')||'',match=/translate\(([-\d.]+)/.exec(value),x=Number(match?.[1]||0);
   let track=tracks.get(actor);if(!track){track={x,time,distance:0,movingUntil:0,amount:0};tracks.set(actor,track);}
   const dx=x-track.x;
   if(Math.abs(dx)>.04&&Math.abs(dx)<55){track.distance+=Math.abs(dx);track.movingUntil=time+.075;}
   const dt=Math.max(0,Math.min(.06,time-track.time));track.x=x;track.time=time;
   const moving=!reduced&&time<track.movingUntil&&action?.score.effect!=='roofBoard'&&!actor.classList.contains('bracing');
   track.amount=reduced?0:Math.max(0,Math.min(1,track.amount+(moving?1:-1)*dt*8));
   const drawing=actor.querySelector('[data-cast]'),m=drawing?.getCTM(),base=root.getCTM();
   const scale=m&&base?Math.hypot(m.a,m.b)/Math.max(.01,Math.hypot(base.a,base.b)):1;
   actor.dataset.gait=moving?'walking':'idle';
   actor.dataset.walkDistance=(track.distance/scale).toFixed(5);actor.dataset.walkAmount=track.amount.toFixed(5);
  }
 }
 return {animate};
});

/** Distance-driven companion gait. No simulation state or puzzle flags are written. */
Homeward.define('art/cast-motion', [], () => {
 const tracks=new WeakMap();
 function animate(root,time,reduced=false,action=null){
  for(const id of ['davidFollow','fridaFollow','roofDavid','roofFrida']){
   const actor=root.querySelector('#'+id);if(!actor)continue;
   const value=actor.getAttribute('transform')||'',match=/translate\(([-\d.]+)/.exec(value),x=Number(match?.[1]||0);
   let track=tracks.get(actor);if(!track){track={x,time,distance:0,movingUntil:0};tracks.set(actor,track);}
   const dx=x-track.x;
   if(Math.abs(dx)>.04&&Math.abs(dx)<55){track.distance+=Math.abs(dx);track.movingUntil=time+.075;}
   track.x=x;track.time=time;
   const moving=!reduced&&time<track.movingUntil&&action?.score.effect!=='roofBoard'&&!actor.classList.contains('bracing');
   const angle=moving?Math.sin(track.distance/19)*11:0;
   actor.dataset.gait=moving?'walking':'idle';
   for(const [name,sign] of [['back',-1],['front',1]]){
    const leg=actor.querySelector('.cast-leg-'+name);if(leg)leg.setAttribute('transform',`rotate(${(angle*sign).toFixed(2)} ${sign<0?-11:13} -43)`);
   }
  }
 }
 return {animate};
});

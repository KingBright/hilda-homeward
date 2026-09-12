/** Human gait in local drawing units. A stance leg supports the pelvis instead
 * of solving two raised feet beneath an already crouched body. No timers/state.
 */
Homeward.define('engine/walk-cycle', ['engine/kinematics'], ({solve}) => {
  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=t=>t*t*(3-2*t);
  const stride=64,halfStride=16,reach=47.7;
  const rest=Object.freeze({shoulderX:22,shoulderY:-79,handX:31.5,handY:-28.3,hipY:-48,ankleY:-3,bootOffset:-5});
  function rotateArm(j,angle){
    const cs=Math.cos(angle),sn=Math.sin(angle),turn=p=>{const x=p[0]-j.origin[0],y=p[1]-j.origin[1];return [j.origin[0]+x*cs-y*sn,j.origin[1]+x*sn+y*cs];};
    const elbow=turn(j.elbow),end=turn(j.end);
    return {...j,elbow,end,wrist:Math.atan2(end[1]-elbow[1],end[0]-elbow[0])*180/Math.PI-90};
  }
  function arm(side,bodyY=0,swing=0){
    const origin=[side*rest.shoulderX,rest.shoulderY+bodyY],target=[side*rest.handX,rest.handY+bodyY];
    return rotateArm({origin,...solve(origin,target,25,27,side>0?-1:1),requested:target},swing);
  }
  function sample({distance=0,scale=1,amount=1,reduced=false}={}){
    if(![distance,scale,amount].every(Number.isFinite)||scale<=0)throw new TypeError('Invalid walk-cycle input');
    const blend=reduced?0:clamp(amount,0,1),phase=((distance/(scale*stride))%1+1)%1;
    const feet=[['Back',-1],['Front',1]].map(([name,side])=>{
      const step=(phase+(side<0?.5:0))%1,swing=step>=.5,u=swing?(step-.5)*2:0;
      const travel=swing?-halfStride+stride*.5*smooth(u):halfStride-step*stride;
      const lift=swing?1.4*Math.sin(Math.PI*u)**2:0;
      return {name,side,step,swing,x:travel*blend,y:rest.ankleY-lift*blend,roll:swing?-5*Math.sin(Math.PI*u)*blend:0};
    });
    // Both legs must reach. This raises the pelvis over the supporting foot and
    // avoids stretching the opposite leg at heel strike. No extra walking squat.
    const hipY=Math.max(...feet.map(f=>f.y-Math.sqrt(reach*reach-f.x*f.x)));
    const bodyY=hipY-rest.hipY,legs={};
    for(const f of feet){
      const origin=[f.side*11,hipY],target=[f.side*11+f.x,f.y];
      legs[f.name]={origin,...solve(origin,target,24,24,-1),planted:!f.swing||blend===0,roll:f.roll};
    }
    // Swing at the shoulder. The elbow does not repeatedly fold and unfold as a
    // Cartesian wrist target crosses the body. Back and front arms counter-swing.
    const swing=Math.sin(phase*TAU)*.11*blend;
    return {phase,bodyY,legs,armFront:arm(1,bodyY,swing),armBack:arm(-1,bodyY,-swing),amount:blend};
  }
  return {sample,arm,rotateArm,rest,stride};
});

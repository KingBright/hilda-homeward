/** Seekable whole-body posing. Rigid bones; joint-space reach arcs; no accumulated state. */
Homeward.define('engine/body-motion', ['engine/kinematics','engine/action-track','engine/idle-life','engine/walk-cycle'], ({solve},{smooth},Idle,Walk) => {
  const mix=(a,b,t)=>a+(b-a)*t;
  const point=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
  const limit=(x,a,b)=>Math.max(a,Math.min(b,x));
  const segment=(p,a,b)=>smooth((p-a)/(b-a));
  const bones=Object.freeze({upperArm:25,forearm:27,thigh:24,shin:24});
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function articulated(origin,rest,target,bend,reach){
    const a=bones.upperArm,b=bones.forearm;
    const neutral=solve(origin,rest,a,b,bend),contact=solve(origin,target,a,b,bend);
    const angle=j=>Math.atan2(j.elbow[1]-origin[1],j.elbow[0]-origin[0]);
    const elbowAngle=j=>wrap(Math.atan2(j.end[1]-j.elbow[1],j.end[0]-j.elbow[0])-angle(j));
    const upper=angle(neutral)+wrap(angle(contact)-angle(neutral))*reach;
    // Interpolating joint angles preserves both lengths, including the approach arc.
    const lower=upper+mix(elbowAngle(neutral),elbowAngle(contact),reach);
    const elbow=[origin[0]+a*Math.cos(upper),origin[1]+a*Math.sin(upper)];
    return {origin,elbow,end:[elbow[0]+b*Math.cos(lower),elbow[1]+b*Math.sin(lower)],wrist:lower*180/Math.PI-90,requested:target};
  }
  function sample({x=0,y=0,face=1,scale=1.36,time=0,distance=0,moving=false,walkAmount=moving?1:0,reduced=false,score=null,frame=null}={}){
    if(![x,y,face,scale,time,distance].every(Number.isFinite)||scale<=0)throw new TypeError('Invalid actor coordinates');
    if(!score||score.kind==='walk'){
      const gait=Walk.sample({distance,scale,amount:walkAmount,reduced});
      // Locomotion owns the whole body; rare idle gestures never alter walking elbows.
      const idle=gait.amount===0?Idle.sample({who:'希尔达',time,reduced}):null;
      let front=gait.armFront;
      if(idle?.gesture>0){const target=[idle.front[0],idle.front[1]+gait.bodyY];front=articulated(front.origin,front.end,target,-1,idle.gesture*.3);}
      return {offset:[0,gait.bodyY],armFront:front,armBack:gait.armBack,legs:gait.legs,
        gaitPhase:gait.phase,walkAmount:gait.amount,contact:null,pickup:false,acquired:false,transfer:0,
        grip:false,propVisible:false,propOpacity:0,headTilt:0};
    }
    const p=frame?.progress??0,effort=frame?.effort??0;
    const pickup=!!score?.pickup,place=!!score?.place;
    const envelope=pickup?segment(p,.05,.40)*(1-segment(p,.88,1)):frame?.reach??0;
    const transfer=pickup?segment(p,.53,.87):0;
    const acquired=pickup&&p>=.45&&p<.97;
    const gait=distance/(scale*60),wave=moving&&!reduced?Math.sin(gait*Math.PI*2):0;
    const breathe=reduced||score?0:Math.sin(time*2.1)*.35;
    let world=score?.target?[...score.target]:[x+face*scale*36,y-scale*63];
    if(score?.effect==='ladderSlide')world[0]+=(score.to-score.from)*effort;
    if(score?.kind==='turn'){
      const angle=(score.fromAngle??-90)*Math.PI/180+effort*(score.sweep??Math.PI*1.15);
      world[0]+=Math.cos(angle)*(score.radius??18);world[1]+=Math.sin(angle)*(score.radius??18);
    }
    if(score?.kind==='pull')world[1]+=effort*(score.travel??18);
    if(score?.kind==='pour'){world[0]-=face*40;world[1]-=42;}
    const local=[(world[0]-x)/scale*face,(world[1]-y)/scale];
    const low=limit((local[1]+43)*.85,0,34);
    const crouch=low*envelope*(1-transfer*.7)-2.7*(1-envelope);
    const anticipation=score&&!reduced?Math.sin(segment(p,0,.18)*Math.PI)*-1.4:0;
    const lean=score?limit((local[0]-27)*.13,-7,10)*envelope+anticipation:wave*.6;
    const bob=moving&&!reduced?-Math.abs(Math.cos(gait*Math.PI*2))*1.1:breathe;
    const offset=[lean,crouch+bob];
    let front=local,back=[local[0]-17,local[1]+6];
    if(pickup){front=point(local,[-18,-59],transfer);back=score.twoHands?point(back,[-35,-59],transfer):[-25,-50];}
    if(score?.kind==='tool'){front=[31,-91];back=[4,-74];}
    if(score?.kind==='lever'){front=[34,-70-effort*17];back=[15,-67-effort*17];}
    if(score?.kind==='throw'){front=[25+Math.sin(effort*Math.PI)*18,-92-Math.sin(effort*Math.PI)*24];back=[-18,-57];}
    if(score?.kind==='gesture'){front=[38,-69];back=[-24,-45];}
    // Climbing is gameplay communication, not decorative motion: keep it visible in reduced mode.
    const climbing=score?.kind==='climb';
    if(climbing){
      const atShelf=p>.43&&p<.70;
      front=atShelf?local:[22,-97-Math.sin(p*24)*14];
      back=[-16,-94+Math.sin(p*24)*14];
    }
    const idle=!score&&!moving?Idle.sample({who:'希尔达',time,reduced}):null;
    const armFront=articulated([22+lean,-79+crouch+bob],[31.5+lean,-28.3+crouch+bob],idle?idle.front:front,-1,idle?idle.gesture*.55:envelope);
    const backReach=pickup&&!score.twoHands?envelope*.3:envelope*.9;
    const armBack=articulated([-22+lean,-79+crouch+bob],[-31.5+lean,-28.3+crouch+bob],back,1,backReach);
    const legs={};
    for(const [name,sign] of [['Back',-1],['Front',1]]){
      const step=(gait+(sign<0?.5:0))%1;
      const stride=moving&&!reduced?(step<.5?15-step*60:-15+(step-.5)*60):0;
      const lift=moving&&!reduced&&step>=.5?Math.sin((step-.5)*Math.PI*2)*8:0;
      const rung=climbing?Math.sin(p*24+sign*Math.PI/2):0;
      const foot=[sign*11+stride+(climbing?3:0),-3-lift-(climbing?Math.max(0,rung)*18:0)];
      const origin=[sign*11+lean,-48+crouch+bob];
      legs[name]={origin,...solve(origin,foot,bones.thigh,bones.shin,-1)};
    }
    return {offset,armFront,armBack,legs,contact:world,pickup,acquired,transfer,
      grip:acquired||place&&p<.78||!!score&&!pickup&&envelope>.55,
      propVisible:acquired||place&&p>.02&&p<.78,
      propOpacity:pickup?1-segment(p,.87,.97):1,
      headTilt:score?limit(local[1]+65,-30,30)*envelope*.14:0};
  }
  return {bones,articulated,sample};
});

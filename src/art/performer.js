/** The playable actor: anchored feet, articulated arms and contact-driven tools. */
Homeward.define('art/performer', ['engine/kinematics','art/cast-design'], ({solve},Cast) => {
  const path=(id,d,fill,stroke='#24434a',width=2)=>`<path id="${id}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(id,color,width)=>path(id,'M0 0L0 1','none','#203c45',width+3)+path(id+'Fill','M0 0L0 1','none',color,width);
  function markup(){return `<g id="performer" data-cast="希尔达" transform="scale(1.36)"><ellipse id="rigShadow" cy="3" rx="28" ry="5" fill="#0b2c353d"/>
    ${limb('rigLegBack','#2b404e',9)}<g id="rigBootBack"></g>
    ${limb('rigLegFront','#354b59',10)}<g id="rigBootFront"></g>
    ${Cast.upper('希尔达',true)}
    ${limb('rigArmBack','#a95043',9)}<ellipse id="rigHandBack" rx="4.4" ry="5.5" fill="#efc49d" stroke="#35464e" stroke-width="1.3"/>
    ${limb('rigArmFront','#c66d57',10)}<ellipse id="rigHandFront" rx="4.8" ry="5.8" fill="#f3cda8" stroke="#35464e" stroke-width="1.3"/>
    <g id="rigTool" pointer-events="none"></g>
  </g>`;}
  let cachedRoot=null,nodes={};
  const mix=(a,b,t)=>a+(b-a)*t;
  const p=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
  const fixed=n=>Number(n).toFixed(2);
  function paint(root,{x,y,face,time,distance,moving,reduced,action,selected,scene=0,flags={},speaking=false}){
    if(!root)return;
    if(root!==cachedRoot){cachedRoot=root;nodes={};root.querySelectorAll('[id]').forEach(el=>nodes[el.id]=el);}
    const attr=(id,k,v)=>nodes[id]?.setAttribute(k,v);
    const draw=(id,origin,target,a,b,bend,color)=>{
      const joint=solve(origin,target,a,b,bend),d=`M${origin.map(fixed)}L${joint.elbow.map(fixed)}L${joint.end.map(fixed)}`;
      attr(id,'d',d);attr(id+'Fill','d',d);return joint.end;
    };
    const score=action?.score,frame=action?.sample(),reach=frame?.reach||0,effort=frame?.effort||0;
    const phase=distance/28,walk=moving&&!reduced?Math.sin(phase):0;
    let crouch=['crouch','clear','tie'].includes(score?.kind)?reach*15:['pull','haul','lever'].includes(score?.kind)?reach*7:0;
    if(moving&&!reduced)crouch+=3;
    const lean=score&&['pull','haul','throw','clear','lever'].includes(score.kind)?reach*(['pull','haul'].includes(score.kind)?-7:7):0;
    const bob=moving&&!reduced?-Math.abs(Math.cos(phase))*1.4:reduced?0:Math.sin(time*2.1)*.4;
    const off=[lean,crouch+bob];attr('rigUpper','transform',`translate(${fixed(off[0])} ${fixed(off[1])})`);
    attr('rigHead','transform',`rotate(${fixed(reach*(score?.kind==='tool'?-8:score?.kind==='clear'?7:0))} 0 -87)`);
    attr('rigEyes','transform',!reduced&&!score&&time%5.6>5.44?'translate(0 -103) scale(1 .12) translate(0 103)':'');
    const mood=Cast.expression(scene,flags,'希尔达'),resolve=!!score||mood==='resolve';
    attr('rigBrows','d',resolve?'M-13-125l10 4m12 0 10-5':'M-13-123q5-3 10-1m12-1q5-2 10 1');
    attr('rigMouth','d',speaking&&!reduced&&Math.sin(time*15)>.1?'M0-95q6-2 12 0q-5 8-12 0Z':resolve?'M1-94q5 1 10-1':mood==='relieved'?'M-1-96q7 9 14-1':'M0-95q6 5 12-1');
    attr('rigMouth','fill',speaking&&!reduced&&Math.sin(time*15)>.1?'#8e534a':'none');
    const wind=reduced?0:Math.sin(time*3)*2+Math.abs(walk)*4;
    attr('rigScarf','d',`M16-82Q31 ${-74-wind} 44 ${-70-wind}L37 ${-61-wind} 18-70Z`);
    for(const [name,sign] of [['Back',-1],['Front',1]]){
      const step=(distance/(1.36*60)+(sign<0?.5:0))%1;
      const stride=moving&&!reduced?(step<.5?15-step*60:-15+(step-.5)*60):0;
      const lift=moving&&!reduced&&step>=.5?Math.sin((step-.5)*Math.PI*2)*9:0;
      const climbing=score?.kind==='climb'&&!reduced;
      const rung=climbing?Math.sin(frame.progress*24+sign*Math.PI/2):0;
      const foot=[sign*11+stride+(climbing?3:0),-3-lift-(climbing?Math.max(0,rung)*19:0)];
      draw('rigLeg'+name,[sign*11+off[0],-48+crouch],foot,22.5,22.5,-1);
      const boot=nodes['rigBoot'+name];if(boot){const drawing=Cast.boot(0,0,name==='Back');if(!boot.firstChild)boot.innerHTML=drawing;boot.setAttribute('transform',`translate(${fixed(foot[0])} ${fixed(foot[1])})`);}
    }
    let target=[27+walk*12,-38],back=[-27-walk*11,-40];
    if(score?.target){
      let world=[...score.target];
      if(score.effect==='ladderSlide')world[0]+=(score.to-score.from)*effort;
      if(score.kind==='turn'){const angle=(1-effort)*Math.PI;world[0]+=Math.cos(angle)*(score.radius||20);world[1]+=Math.sin(angle)*(score.radius||20);}
      if(score.kind==='pull')world[1]+=effort*(score.travel||24);
      const local=[(world[0]-x)/1.36*face,(world[1]-y)/1.36];
      if(score.kind==='climb'&&!reduced){
        const reaching=frame.progress>.43&&frame.progress<.69;
        target=reaching?p(target,local,reach):[22,-98-Math.sin(frame.progress*24)*16];
        back=[-16,-97+Math.sin(frame.progress*24)*16];
      }
      else if(score.kind==='lever'){target=p(target,[34,-70-effort*17],reach);back=p(back,[15,-67-effort*17],reach);}
      else if(score.kind==='tool'){target=p(target,[28,-97],reach);back=p(back,[3,-75],reach);}
      else if(score.kind==='throw'){target=p(target,[25+Math.sin(effort*Math.PI)*18,-92-Math.sin(effort*Math.PI)*27],reach);}
      else {target=p(target,local,reach);back=p(back,[local[0]-14,local[1]+9],reach*.85);}
    }
    const handBack=draw('rigArmBack',[-19+off[0],-79+off[1]],back,22+reach*5,23+reach*5,action?-1:1);
    const hand=draw('rigArmFront',[17+off[0],-79+off[1]],target,22+reach*6,23+reach*5,action?1:-1);
    for(const [name,h] of [['Back',handBack],['Front',hand]]){attr('rigHand'+name,'cx',fixed(h[0]));attr('rigHand'+name,'cy',fixed(h[1]));}
    let tool='';
    attr('rigShadow','opacity',score?.kind==='climb'&&!reduced?'.15':'1');
    if(score?.kind==='climb'&&frame.progress>.57&&frame.progress<.98){tool=`<g transform="translate(${hand[0]-13} ${hand[1]-9})"><rect width="27" height="36" rx="2" fill="#d0bb81" stroke="#365751" stroke-width="2"/><path d="M7 9h13M7 15h13M7 21h9" stroke="#607e6a" stroke-width="1.5"/></g>`;}
    else if(['tool','lever'].includes(score?.kind)&&reach>.1){let tip=[...score.target];
      if(score.kind==='lever'){const t=Math.max(0,Math.min(1,(frame.progress-.12)/.35)),a=t*t*(3-2*t)*24*Math.PI/180,dx=tip[0]-1225,dy=tip[1]-720;tip=[1225+dx*Math.cos(a)-dy*Math.sin(a),720+dx*Math.sin(a)+dy*Math.cos(a)];}
      const tx=(tip[0]-x)/1.36*face,ty=(tip[1]-y)/1.36;
      tool=`<path d="M${hand[0]-6} ${hand[1]+18}L${tx} ${ty+4}q5-12 10-5" fill="none" stroke="#253d43" stroke-width="5" stroke-linecap="round"/><path d="M${hand}L${tx} ${ty+4}" stroke="#ccb384" stroke-width="3"/>`;
    }else if(score?.prop==='rope'&&reach>.1){tool=`<ellipse cx="${hand[0]}" cy="${hand[1]+12}" rx="12" ry="15" fill="none" stroke="#c4ad7d" stroke-width="3"/>`;}
    else if(!action&&['lamp','shade'].includes(selected)){tool=`<g transform="translate(${hand[0]} ${hand[1]+13})"><circle r="23" fill="#e5ba5830"/><path d="M-6-5V-12Q0-22 6-12V-5" fill="none" stroke="#b49767" stroke-width="2"/><rect x="-9" y="-5" width="18" height="23" rx="4" fill="#dab779" stroke="#635444" stroke-width="2"/><path d="M0 14Q-8 5 0 0Q6 8 0 14" fill="#fff0b0"/></g>`;}
    if(nodes.rigTool&&nodes.rigTool.innerHTML!==tool)nodes.rigTool.innerHTML=tool;
    root.dataset.pose=score?.kind||(moving?'walk':'idle');
    root.dataset.phase=frame?.phase||'idle';
  }
  return {markup,paint};
});

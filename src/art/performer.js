/** The playable actor: anchored feet, articulated arms and contact-driven tools. */
Homeward.define('art/performer', ['engine/kinematics'], ({solve}) => {
  const path=(id,d,fill,stroke='#24434a',width=2)=>`<path id="${id}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(id,color,width)=>path(id,'M0 0L0 1','none','#203c45',width+3)+path(id+'Fill','M0 0L0 1','none',color,width);
  function markup(){return `<g id="performer" transform="scale(1.36)"><ellipse cy="3" rx="28" ry="5" fill="#0b2c353d"/>
    ${limb('rigLegBack','#293e48',9)}${path('rigBootBack','M0 0','none')}
    ${limb('rigLegFront','#30434a',10)}${path('rigBootFront','M0 0','none')}
    <g id="rigUpper">
      <path d="M-18-121Q-40-106-33-65L-16-58 17-63 26-80Q35-110 16-124Z" fill="#438fa2" stroke="#24424c" stroke-width="2.3"/>
      <path d="M-24-80Q-32-65-26-46H24L16-84Z" fill="#35484b" stroke="#203f47" stroke-width="2"/>
      <path d="M-20-83Q-29-68-24-53H21L15-83Z" fill="#bc7054" stroke="#28414a" stroke-width="2"/>
      <path d="M-15-75L-17-57M8-76L12-56M-23-60H18" fill="none" stroke="#df9c71" stroke-width="1.4"/>
      <path d="M-23-77Q-36-76-32-56L-26-54" fill="#45616a" stroke="#203f47" stroke-width="2"/>
      <g id="rigHead">
        <path d="M-13-123Q8-133 22-119L26-103Q24-85 6-84-12-86-14-104Z" fill="#f0d2af" stroke="#28464c" stroke-width="2"/>
        <path d="M-16-122Q-4-137 15-127L27-118 18-110 1-118-12-105-17-88-23-94Z" fill="#70c0ca" stroke="#24464f" stroke-width="2"/>
        <path d="M-23-125Q-34-139-15-144 0-155 19-143 36-139 29-126 3-130-23-125Z" fill="#28434e" stroke="#193743" stroke-width="2.4"/>
        <path d="M1-148V-155" stroke="#243d46" stroke-width="3" stroke-linecap="round"/>
        <g id="rigEyes"><circle cx="3" cy="-106" r="2.1" fill="#24434b"/><circle cx="18" cy="-105" r="2.1" fill="#24434b"/></g>
        <path d="M12-102L14-99 11-98M5-93Q10-90 16-94" fill="none" stroke="#65554d" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M-9-95L-3-94" stroke="#d2957e" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      </g>
      <path d="M-19-86Q-2-93 21-86L19-77Q0-82-18-77Z" fill="#e2b86a" stroke="#2c4445" stroke-width="2"/>
      <path id="rigScarf" d="M16-82L40-70 35-61 18-70Z" fill="#e2b86a" stroke="#344b47" stroke-width="2"/>
    </g>
    ${limb('rigArmBack','#b87755',9)}<ellipse id="rigHandBack" rx="4.4" ry="5.5" fill="#f0d1aa" stroke="#35505a" stroke-width="1.4"/>
    ${limb('rigArmFront','#c9845e',10)}<ellipse id="rigHandFront" rx="4.8" ry="5.8" fill="#f3d5b0" stroke="#35505a" stroke-width="1.4"/>
    <g id="rigTool" pointer-events="none"></g>
  </g>`;}
  let cachedRoot=null,nodes={};
  const mix=(a,b,t)=>a+(b-a)*t;
  const p=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t)];
  const fixed=n=>Number(n).toFixed(2);
  function paint(root,{x,y,face,time,distance,moving,reduced,action,selected}){
    if(!root)return;
    if(root!==cachedRoot){cachedRoot=root;nodes={};root.querySelectorAll('[id]').forEach(el=>nodes[el.id]=el);}
    const attr=(id,k,v)=>nodes[id]?.setAttribute(k,v);
    const draw=(id,origin,target,a,b,bend,color)=>{
      const joint=solve(origin,target,a,b,bend),d=`M${origin.map(fixed)}L${joint.elbow.map(fixed)}L${joint.end.map(fixed)}`;
      attr(id,'d',d);attr(id+'Fill','d',d);return joint.end;
    };
    const score=action?.score,frame=action?.sample(),reach=frame?.reach||0,effort=frame?.effort||0;
    const phase=distance/28,walk=moving&&!reduced?Math.sin(phase):0;
    let crouch=['crouch','clear'].includes(score?.kind)?reach*15:score?.kind==='pull'?reach*5:0;
    if(moving&&!reduced)crouch+=3;
    const lean=score&&['pull','throw','clear'].includes(score.kind)?reach*(score.kind==='pull'?-5:7):0;
    const bob=moving&&!reduced?-Math.abs(Math.cos(phase))*1.4:reduced?0:Math.sin(time*2.1)*.4;
    const off=[lean,crouch+bob];attr('rigUpper','transform',`translate(${fixed(off[0])} ${fixed(off[1])})`);
    attr('rigHead','transform',`rotate(${fixed(reach*(score?.kind==='tool'?-8:score?.kind==='clear'?7:0))} 0 -87)`);
    attr('rigEyes','opacity',!reduced&&!score&&time%5.6>5.44?'.15':'1');
    const wind=reduced?0:Math.sin(time*3)*2+Math.abs(walk)*4;
    attr('rigScarf','d',`M16-82Q31 ${-74-wind} 44 ${-70-wind}L37 ${-61-wind} 18-70Z`);
    for(const [name,sign] of [['Back',-1],['Front',1]]){
      const step=(distance/(1.36*60)+(sign<0?.5:0))%1;
      const stride=moving&&!reduced?(step<.5?15-step*60:-15+(step-.5)*60):0;
      const lift=moving&&!reduced&&step>=.5?Math.sin((step-.5)*Math.PI*2)*9:0;
      const foot=[sign*11+stride,-3-lift];
      draw('rigLeg'+name,[sign*11+off[0],-48+crouch],foot,22.5,22.5,-1);
      attr('rigBoot'+name,'d',`M${foot[0]-6} ${foot[1]-3}L${foot[0]+6} ${foot[1]-3}L${foot[0]+14} ${foot[1]+5}H${foot[0]-7}Z`);
      attr('rigBoot'+name,'fill',name==='Front'?'#b57a54':'#965e48');
    }
    let target=[28+walk*16,-26],back=[-28-walk*13,-30];
    if(score?.target){
      let world=[...score.target];
      if(score.kind==='turn'){const angle=(1-effort)*Math.PI;world[0]+=Math.cos(angle)*(score.radius||20);world[1]+=Math.sin(angle)*(score.radius||20);}
      if(score.kind==='pull')world[1]+=effort*(score.travel||24);
      const local=[(world[0]-x)/1.36*face,(world[1]-y)/1.36];
      if(score.kind==='tool'){target=p(target,[28,-97],reach);back=p(back,[3,-75],reach);}
      else if(score.kind==='throw'){target=p(target,[25+Math.sin(effort*Math.PI)*18,-92-Math.sin(effort*Math.PI)*27],reach);}
      else {target=p(target,local,reach);back=p(back,[local[0]-14,local[1]+9],reach*.85);}
    }
    const handBack=draw('rigArmBack',[-19+off[0],-79+off[1]],back,27,28,action?-1:1);
    const hand=draw('rigArmFront',[17+off[0],-79+off[1]],target,28,28,action?1:-1);
    for(const [name,h] of [['Back',handBack],['Front',hand]]){attr('rigHand'+name,'cx',fixed(h[0]));attr('rigHand'+name,'cy',fixed(h[1]));}
    let tool='';
    if(score?.kind==='tool'&&reach>.1){const tx=(score.target[0]-x)/1.36*face,ty=(score.target[1]-y)/1.36;
      tool=`<path d="M${hand[0]-6} ${hand[1]+18}L${tx} ${ty+4}q5-12 10-5" fill="none" stroke="#253d43" stroke-width="5" stroke-linecap="round"/><path d="M${hand}L${tx} ${ty+4}" stroke="#ccb384" stroke-width="3"/>`;
    }else if(score?.prop==='rope'&&reach>.1){tool=`<ellipse cx="${hand[0]}" cy="${hand[1]+12}" rx="12" ry="15" fill="none" stroke="#c4ad7d" stroke-width="3"/>`;}
    else if(!action&&['lamp','shade'].includes(selected)){tool=`<g transform="translate(${hand[0]} ${hand[1]+13})"><circle r="23" fill="#e5ba5830"/><path d="M-6-5V-12Q0-22 6-12V-5" fill="none" stroke="#b49767" stroke-width="2"/><rect x="-9" y="-5" width="18" height="23" rx="4" fill="#dab779" stroke="#635444" stroke-width="2"/><path d="M0 14Q-8 5 0 0Q6 8 0 14" fill="#fff0b0"/></g>`;}
    if(nodes.rigTool&&nodes.rigTool.innerHTML!==tool)nodes.rigTool.innerHTML=tool;
    root.dataset.pose=score?.kind||(moving?'walk':'idle');
    root.dataset.phase=frame?.phase||'idle';
  }
  return {markup,paint};
});

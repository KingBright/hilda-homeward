/** Shared drawings driven by rigid, seekable whole-body motion. */
Homeward.define('art/performer', ['engine/body-motion','art/cast-design','art/props','content/staging'], (Motion,Cast,Props,Staging) => {
  const path=(id,d,fill,stroke='#24434a',width=2)=>`<path id="${id}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(id,color,width)=>path(id,'M0 0L0 1','none','#263c48',width+2.2)+path(id+'Fill','M0 0L0 1','none',color,width);
  const hand=name=>`<g id="rigHand${name}">${path('rigPalm'+name,'M-4-5Q0-7 4-4L5 2Q4 7 1 8L-3 6-5 1-7-1Q-8-4-5-3Z','#f3cda8','#35464e',1.1)}${path('rigFingers'+name,'M0 2l1 4m-4-5 1 4','none','#c28f71',.7)}</g>`;
  function markup(){return `<g id="performer" data-cast="希尔达" transform="scale(1.36)"><ellipse id="rigShadow" cy="3" rx="28" ry="5" fill="#0b2c353d"/>
    ${limb('rigLegBack','#2b404e',9)}<g id="rigBootBack"></g>
    ${limb('rigLegFront','#354b59',10)}<g id="rigBootFront"></g>
    ${Cast.upper('希尔达',true)}
    <g id="rigRearArm">${limb('rigArmBack','#a95043',9)}${hand('Back')}</g>
    ${limb('rigArmFront','#c66d57',10)}
    <g id="rigTool" pointer-events="none"></g>${hand('Front')}
  </g>`;}
  let cachedRoot=null,nodes={};
  const fixed=n=>Number(n).toFixed(3);
  const artwork=new Map();
  function item(id){
    if(!artwork.has(id))artwork.set(id,Props.itemArt(id).replace(/<svg[^>]*>|<\/svg>/g,''));
    return artwork.get(id);
  }
  function paint(root,{x,y,face,time,distance,moving,walkAmount,reduced,action,selected,scene=0,flags={}}){
    if(!root)return;
    if(root!==cachedRoot||!nodes.rigHead?.isConnected){cachedRoot=root;nodes={};root.querySelectorAll('[id]').forEach(el=>nodes[el.id]=el);}
    const attr=(id,k,v)=>{const n=nodes[id];if(n&&n.getAttribute(k)!==String(v))n.setAttribute(k,String(v));};
    const scale=Staging.scale(scene),score=action?.score,frame=action?.sample();
    const pose=Motion.sample({x,y,face,scale,time,distance,moving,walkAmount,reduced,score,frame});
    root.setAttribute('transform',`scale(${scale})`);root.dataset.scale=scale;
    attr('rigUpper','transform',`translate(${pose.offset.map(fixed).join(' ')})`);
    attr('rigHead','transform',`rotate(${fixed(pose.headTilt)} 0 -87)`);
    // Shared cast acting owns eye timing so a paused blink is not overwritten.
    const mood=Cast.expression(scene,flags,'希尔达');
    attr('rigBrows','d',score||mood==='resolve'?'M-13-125l10 4m12 0 10-5':'M-13-123q5-3 10-1m12-1q5-2 10 1');
    const wind=reduced?0:Math.sin(time*3)*1.4+(moving?3:0);
    attr('rigScarf','d',`M16-82Q31 ${-74-wind} 44 ${-70-wind}L37 ${-61-wind} 18-70Z`);
    const draw=(id,j)=>{const d=`M${j.origin.map(fixed)}L${j.elbow.map(fixed)}L${j.end.map(fixed)}`;attr(id,'d',d);attr(id+'Fill','d',d);};
    for(const name of ['Back','Front']){
      const leg=pose.legs[name];draw('rigLeg'+name,leg);
      const boot=nodes['rigBoot'+name];if(boot){if(!boot.firstChild)boot.innerHTML=Cast.boot(0,-5,name==='Back');attr('rigBoot'+name,'transform',`translate(${leg.end.map(fixed).join(' ')}) rotate(${fixed(leg.roll||0)} 0 3)`);}
      const arm=pose['arm'+name];draw('rigArm'+name,arm);
      attr('rigHand'+name,'transform',`translate(${arm.end.map(fixed).join(' ')}) rotate(${fixed(arm.wrist)}) scale(${name==='Front'?1:-1} 1)`);
      attr('rigPalm'+name,'d',pose.grip?'M-4-5Q1-7 5-3L5 3Q2 7-3 5L-6 1-7-3Q-6-5-3-1L0 0-1-4Z':'M-4-5Q0-7 4-4L5 2Q4 7 1 8L-3 6-5 1-7-1Q-8-4-5-3Z');
      attr('rigFingers'+name,'d',pose.grip?'M-2 1l5 1m-5 1 4 1':'M0 2l1 4m-4-5 1 4');
    }
    const h=pose.armFront.end;let tool='';
    if((score?.pickup||score?.place)&&pose.propVisible){
      const prop=score.prop||score.item;
      if(prop){
        const size={gearS:.89,gearM:1.10,gearL:1.31,scarf:.62,fork:.65,letter:.58}[prop]??.64;
        tool=`<g data-held-item="${prop}" opacity="${fixed(pose.propOpacity)}" transform="translate(${fixed(h[0])} ${fixed(h[1]+14)}) scale(${size})">${prop==='letter'?item('plan'):item(prop)}</g>`;
      }
    }else if(score?.kind==='pour'&&frame.reach>.2){
      const tilt=Math.sin(frame.effort*Math.PI)*28,tx=(score.target[0]-x)/scale*face,ty=(score.target[1]-y)/scale;
      tool=`<g data-held-item="teapot" transform="translate(${h[0]} ${h[1]}) rotate(${tilt})"><path d="M-15-8Q-19-21 0-22Q20-20 18-6L14 11H-13Z" fill="#739b97" stroke="#355952" stroke-width="1.5"/><path d="M15-10l15-10-8 20M-15-12q-21-9-14 9l13 7" fill="none" stroke="#88aaa1" stroke-width="4"/><path d="M-10-22h20" stroke="#31534f" stroke-width="3"/></g>`;
      if(frame.effort>.15&&frame.effort<.83)tool+=`<path d="M${h[0]+24} ${h[1]-3}Q${tx} ${h[1]+12} ${tx} ${ty}" fill="none" stroke="#dbb36d" stroke-width="1.3" opacity=".8"/>`;
    }else if(score?.kind==='climb'&&score.effect==='archiveBook'&&frame.progress>.57&&frame.progress<.98){
      tool=`<g transform="translate(${h[0]-13} ${h[1]-9})"><rect width="27" height="36" rx="2" fill="#d0bb81" stroke="#365751" stroke-width="2"/><path d="M7 9h13M7 15h13M7 21h9" stroke="#607e6a" stroke-width="1.5"/></g>`;
    }else if(['tool','lever'].includes(score?.kind)&&frame.reach>.1){
      let tip=[...score.target];
      if(score.kind==='lever'){
        const t=Math.max(0,Math.min(1,(frame.progress-.12)/.35)),a=t*t*(3-2*t)*24*Math.PI/180,dx=tip[0]-1225,dy=tip[1]-720;
        tip=[1225+dx*Math.cos(a)-dy*Math.sin(a),720+dx*Math.sin(a)+dy*Math.cos(a)];
      }
      const tx=(tip[0]-x)/scale*face,ty=(tip[1]-y)/scale;
      tool=`<path d="M${h[0]-6} ${h[1]+18}L${tx} ${ty+4}q5-12 10-5" fill="none" stroke="#253d43" stroke-width="5" stroke-linecap="round"/><path d="M${h}L${tx} ${ty+4}" stroke="#ccb384" stroke-width="3"/>`;
    }else if(score?.prop==='rope'&&frame.reach>.1){
      tool=`<ellipse cx="${h[0]}" cy="${h[1]+12}" rx="12" ry="15" fill="none" stroke="#c4ad7d" stroke-width="3"/>`;
    }else if(!action&&['lamp','shade'].includes(selected)){
      tool=`<g transform="translate(${h[0]} ${h[1]+13})"><circle r="23" fill="#e5ba5830"/><path d="M-6-5V-12Q0-22 6-12V-5" fill="none" stroke="#b49767" stroke-width="2"/><rect x="-9" y="-5" width="18" height="23" rx="4" fill="#dab779" stroke="#635444" stroke-width="2"/><path d="M0 14Q-8 5 0 0Q6 8 0 14" fill="#fff0b0"/></g>`;
    }
    if(nodes.rigTool&&nodes.rigTool.innerHTML!==tool)nodes.rigTool.innerHTML=tool;
    attr('rigShadow','opacity',score?.kind==='climb'&&!reduced?'.15':'1');
    root.dataset.gaitPhase=String(pose.gaitPhase??0);root.dataset.walkAmount=String(pose.walkAmount??0);
    root.dataset.pose=score?.kind||(moving?'walk':'idle');root.dataset.phase=frame?.phase||'idle';
    root.dataset.grip=pose.grip?'closed':'open';root.dataset.pickup=score?.pickup?frame.progress<.45?'approach':frame.progress<.87?'carrying':'stowing':'none';
  }
  return {markup,paint};
});

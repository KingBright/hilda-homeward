/** Shared drawings driven by rigid, seekable whole-body motion. */
Homeward.define('art/performer', ['engine/body-motion','art/cast-design','art/props','content/staging'], (Motion,Cast,Props,Staging) => {
  const ink='#233844';
  const path=(id,d,fill,stroke=ink,width=2)=>`<path id="${id}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(id,color,width,highlight)=>path(id,'M0 0L0 1','none',ink,width+2.6)+path(id+'Fill','M0 0L0 1','none',color,width)+(highlight?path(id+'Light','M0 0L0 1','none',highlight,Math.max(1.4,width*.26)):'');
  const hand=name=>{
    const sleeve=name==='Front'?'#8a3c35':'#6e302b';
    const trim=name==='Front'?'#f3e2c0':'#d9c7a6';
    const skin=name==='Front'?'#f4cfb0':'#e2b896';
    return `<g id="rigHand${name}">`+
      `<path id="rigCuff${name}" d="M-5.2-6.4Q0-7.4 5.2-6.4L5.6-2.5Q0-1.6-5.6-2.5Z" fill="${sleeve}" stroke="${ink}" stroke-width="1.25" stroke-linejoin="round"/>`+
      `<path id="rigTrim${name}" d="M-4.6-3.2Q0-2.4 4.6-3.2" fill="none" stroke="${trim}" stroke-width="1.5" stroke-linecap="round"/>`+
      `${path('rigPalm'+name,'M-4.2-2.4Q0-3.3 4.2-2.4L4.6 2.8Q4.2 7.2.8 7.8L-2.8 6.4Q-4.8 4-4.4-.5Z',skin,ink,1.2)}`+
      `${path('rigThumb'+name,'M3-1.5Q6.3-.7 5.8 2.4Q4.4 3.5 2.5 1.7',skin,ink,1.15)}`+
      `${path('rigFingers'+name,'M-.8 2.2l.7 3.6m-2.3-3.4.5 3.2','none','#c58d6e',.85)}`+
    `</g>`;
  };
  function markup(){return `<g id="performer" data-cast="希尔达" transform="scale(1.36)"><ellipse id="rigShadow" cy="3" rx="28" ry="5" fill="#0b2c353d"/>
    ${limb('rigLegBack','#293e4c',9.2)}<g id="rigBootBack"></g>
    ${limb('rigLegFront','#354d5d',10.2,'#527084')}<g id="rigBootFront"></g>
    <g id="rigRearArm">${limb('rigArmBack','#9e473c',9.2)}${hand('Back')}</g>
    ${Cast.upper('希尔达',true)}
    <g id="rigTool" pointer-events="none"></g>
    ${limb('rigArmFront','#c45b49',10.2,'#e28870')}${hand('Front')}
  </g>`;}
  let cachedRoot=null,nodes={};
  const fixed=n=>Number(n).toFixed(3);
  const artwork=new Map();
  function item(id){
    if(!artwork.has(id))artwork.set(id,Props.itemArt(id).replace(/<svg[^>]*>|<\/svg>/g,''));
    return artwork.get(id);
  }
  const ITEM_GRIPS={
    lamp:{dx:0,dy:21,size:.86},
    shade:{dx:0,dy:21,size:.86},
    gearS:{dx:2,dy:17,size:.76},
    gearM:{dx:2,dy:21,size:.82},
    gearL:{dx:2,dy:25,size:.88},
    line:{dx:2,dy:18,size:.68},
    rope:{dx:2,dy:18,size:.68},
    felt:{dx:2,dy:14,size:.64},
    crank:{dx:0,dy:10,size:.66},
    scarf:{dx:2,dy:12,size:.64},
    fork:{dx:0,dy:14,size:.65},
    letter:{dx:2,dy:12,size:.58},
    hook:{dx:0,dy:15,size:.64},
    grapple:{dx:0,dy:15,size:.64},
    weight1:{dx:0,dy:23,size:.70},
    weight2:{dx:0,dy:23,size:.70},
    weight3:{dx:0,dy:23,size:.70}
  };
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
    attr('rigBrows','d',score||mood==='resolve'?'M-13.5-125l10.2 3.8m11.6 0 10.2-4.8':'M-13.5-123.2q5.2-3.4 10.4-.8m11.6-1q5.2-2.2 10.2 1.2');
    const wind=reduced?0:Math.sin(time*3)*1.4+(moving?3:0);
    attr('rigScarf','d',`M16-82Q31 ${-74-wind} 44 ${-70-wind}L37 ${-61-wind} 18-70Z`);
    const draw=(id,j)=>{
      const d=`M${j.origin.map(fixed)}L${j.elbow.map(fixed)}L${j.end.map(fixed)}`;
      attr(id,'d',d);attr(id+'Fill','d',d);
      if(nodes[id+'Light'])attr(id+'Light','d',d);
    };
    const holdingLantern=!action&&['lamp','shade'].includes(selected);
    const gripActive=pose.grip||holdingLantern;
    for(const name of ['Back','Front']){
      const leg=pose.legs[name];draw('rigLeg'+name,leg);
      const boot=nodes['rigBoot'+name];if(boot){if(!boot.firstChild)boot.innerHTML=Cast.boot(0,-5,name==='Back');attr('rigBoot'+name,'transform',`translate(${leg.end.map(fixed).join(' ')}) rotate(${fixed(leg.roll||0)} 0 3)`);}
      const arm=pose['arm'+name];draw('rigArm'+name,arm);
      const closed=name==='Front'?gripActive:(pose.grip&&!!score?.twoHands);
      attr('rigHand'+name,'transform',`translate(${arm.end.map(fixed).join(' ')}) rotate(${fixed(arm.wrist)}) scale(${name==='Front'?1:-1} 1)`);
      attr('rigPalm'+name,'d',closed?'M-4.2-2.4Q0-3.4 4.4-2.2L5 1.8Q4.4 5.5.8 5.8L-3.2 5Q-4.8 2.8-4.4-.5Z':'M-4.2-2.4Q0-3.3 4.2-2.4L4.6 2.8Q4.2 7.2.8 7.8L-2.8 6.4Q-4.8 4-4.4-.5Z');
      attr('rigThumb'+name,'d',closed?'M2.2-.8Q5.5-.2 5 2.3Q3.4 3.3 1.2 1.7':'M3-1.5Q6.3-.7 5.8 2.4Q4.4 3.5 2.5 1.7');
      attr('rigFingers'+name,'d',closed?'M-2.8 1.2Q0 2.1 3.4 1M-2.4 3.1Q.2 3.9 3 2.7':'M-.8 2.2l.7 3.6m-2.3-3.4.5 3.2');
    }
    const h=pose.armFront.end,b=pose.armBack.end;let tool='';
    if((score?.pickup||score?.place)&&pose.propVisible){
      const prop=score.prop||score.item||(score.weightValue?'weight'+score.weightValue:null);
      if(prop){
        const cfg=ITEM_GRIPS[prop]||{dx:0,dy:15,size:.64};
        const sway=score.pickup&&pose.transfer>0?Math.sin(pose.transfer*Math.PI)*-6:0;
        tool=`<g data-held-item="${prop}" opacity="${fixed(pose.propOpacity)}" transform="translate(${fixed(h[0]+cfg.dx)} ${fixed(h[1]+cfg.dy)}) rotate(${fixed(sway)} 0 ${fixed(-cfg.dy)}) scale(${cfg.size})">${prop==='letter'?item('plan'):item(prop)}</g>`;
      }
    }else if(score?.kind==='pour'&&frame.reach>.2){
      const tilt=Math.sin(frame.effort*Math.PI)*28,tx=(score.target[0]-x)/scale*face,ty=(score.target[1]-y)/scale;
      tool=`<g data-held-item="teapot" transform="translate(${fixed(h[0]+16)} ${fixed(h[1]+4)}) rotate(${fixed(tilt)} -16 -4)"><path d="M-15-8Q-19-21 0-22Q20-20 18-6L14 11H-13Z" fill="#739b97" stroke="#355952" stroke-width="1.5"/><path d="M15-10l15-10-8 20M-15-12q-21-9-14 9l13 7" fill="none" stroke="#88aaa1" stroke-width="4"/><path d="M-10-22h20" stroke="#31534f" stroke-width="3"/></g>`;
      if(frame.effort>.15&&frame.effort<.83)tool+=`<path d="M${fixed(h[0]+38)} ${fixed(h[1]+1)}Q${fixed(tx)} ${fixed(h[1]+14)} ${fixed(tx)} ${fixed(ty)}" fill="none" stroke="#dbb36d" stroke-width="1.5" opacity=".85"/>`;
    }else if(score?.kind==='climb'&&score.effect==='archiveBook'&&frame.progress>.57&&frame.progress<.98){
      tool=`<g transform="translate(${fixed(h[0]-13)} ${fixed(h[1]-6)})"><rect width="27" height="36" rx="2" fill="#d0bb81" stroke="#365751" stroke-width="2"/><path d="M7 9h13M7 15h13M7 21h9" stroke="#607e6a" stroke-width="1.5"/></g>`;
    }else if(['tool','lever'].includes(score?.kind)&&frame.reach>.1){
      let tip=[...score.target];
      if(score.kind==='lever'){
        const t=Math.max(0,Math.min(1,(frame.progress-.12)/.35)),a=t*t*(3-2*t)*24*Math.PI/180,dx=tip[0]-1225,dy=tip[1]-720;
        tip=[1225+dx*Math.cos(a)-dy*Math.sin(a),720+dx*Math.sin(a)+dy*Math.cos(a)];
      }
      const tx=(tip[0]-x)/scale*face,ty=(tip[1]-y)/scale;
      tool=`<path d="M${fixed(b[0]-4)} ${fixed(b[1]+3)}L${fixed(h[0])} ${fixed(h[1])}L${fixed(tx)} ${fixed(ty+2)}q5-12 10-5" fill="none" stroke="#253d43" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M${fixed(b[0]-4)} ${fixed(b[1]+3)}L${fixed(h[0])} ${fixed(h[1])}L${fixed(tx)} ${fixed(ty+2)}" fill="none" stroke="#d4bc8c" stroke-width="3.2" stroke-linecap="round"/>`;
    }else if(score?.prop==='rope'&&frame.reach>.1){
      tool=`<ellipse cx="${fixed(h[0])}" cy="${fixed(h[1]+13)}" rx="12" ry="15" fill="none" stroke="#c4ad7d" stroke-width="3.2"/>`;
    }else if(holdingLantern){
      tool=`<g transform="translate(${fixed(h[0])} ${fixed(h[1]+15)})"><circle r="24" fill="#e5ba5834"/><path d="M-6-5V-12Q0-21 6-12V-5" fill="none" stroke="#b49767" stroke-width="2.2"/><rect x="-9" y="-5" width="18" height="23" rx="4" fill="#dab779" stroke="#4a3e33" stroke-width="2"/><path d="M-6-2H6V14H-6Z" fill="#f5d993"/><path d="M0 13Q-7 5 0-1Q6 6 0 13" fill="#fff4bd"/></g>`;
    }
    if(nodes.rigTool&&nodes.rigTool.innerHTML!==tool)nodes.rigTool.innerHTML=tool;
    attr('rigShadow','opacity',score?.kind==='climb'&&!reduced?'.15':'1');
    root.dataset.gaitPhase=String(pose.gaitPhase??0);root.dataset.walkAmount=String(pose.walkAmount??0);
    root.dataset.pose=score?.kind||(moving?'walk':'idle');root.dataset.phase=frame?.phase||'idle';
    root.dataset.grip=pose.grip?'closed':'open';root.dataset.pickup=score?.pickup?frame.progress<.45?'approach':frame.progress<.87?'carrying':'stowing':'none';
  }
  return {markup,paint};
});

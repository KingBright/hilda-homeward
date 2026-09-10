/** Shared expressive life for Alfur, both trolls and Woff. Stage and portraits use the same clock.
 * Limb, body and eye pivots are local SVG coordinates, never CSS fill-box offsets.
 */
Homeward.define('art/species-life', [], () => {
  const caches=new WeakMap();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
  const pulse=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
  const profiles=Object.freeze({elf:{period:7.1,phase:1.3,breath:.002,head:.7},troll:{period:8.9,phase:3.7,breath:.0015,head:.15},mother:{period:9.7,phase:6.4,breath:.0012,head:.12},woff:{period:6.3,phase:2.9,breath:.005,head:0}});
  function sample({kind='elf',time=0,gaze=0,reduced=false,reserved=false,speaking=false}={}){
    const p=profiles[kind]||profiles.elf,t=(Number.isFinite(time)?Math.max(0,time):0)+p.phase;
    const blink=reduced?1:1-.94*pulse(t%p.period,.2,.27,.34,.44);
    const gesture=reduced||reserved?0:pulse(t%19,7,7.9,8.2,9.8);
    return {blink,gaze:clamp(Number.isFinite(gaze)?gaze:0,-1,1),
      breath:reduced||reserved?1:1+Math.sin(t*1.35)*p.breath,
      tilt:reduced||reserved?0:Math.sin(t*.65)*p.head,
      bob:reduced||reserved||kind!=='woff'?0:Math.sin(t*1.4)*1.6,
      gesture,open:!reduced&&speaking&&Math.sin(t*(kind==='elf'?10:6))>.15};
  }
  function refresh(root){
    if(!root)return;
    caches.set(root,[...root.querySelectorAll('[data-other-life]')].map(actor=>{
      const body=actor.querySelector('[data-life-body]'),head=actor.querySelector('[data-life-head]'),eye=actor.querySelector('[data-life-eye]'),mouth=actor.querySelector('[data-life-mouth]');
      if(eye){eye.style.animation='none';eye.style.transformOrigin='0px 0px';eye.style.transformBox='view-box';eye.setAttribute('data-scripted-eye','true');}
      return {actor,body,head,eye,mouth,gaze:actor.querySelector('[data-life-gaze]'),gesture:actor.querySelector('[data-life-gesture]'),closed:mouth?.getAttribute('d'),fill:mouth?.getAttribute('fill')||'none'};
    }));
  }
  const put=(n,k,v)=>{if(n&&n.getAttribute(k)!==String(v))n.setAttribute(k,String(v));};
  function paint(root,time,{reduced=false,paused=false,portrait=false,scene=0,working=false,speaker='',typing=false,character=''}={}){
    if(!root||paused)return;if(!caches.has(root))refresh(root);
    const source=root.querySelector(`[data-cast="${speaker||'希尔达'}"]`),target=source?.getCTM();
    for(const n of caches.get(root)){
      const m=n.actor.getCTM(),kind=n.actor.dataset.otherLife,who=n.actor.dataset.cast;
      const gaze=!portrait&&m&&target&&source!==n.actor?(target.e-m.e)/(Math.max(.01,Math.abs(m.a))*160):0;
      const speaking=who===speaker&&typing&&character&&!/^[\s，。！？、….,!?]+$/u.test(character);
      const pose=sample({kind,time,gaze,reduced,reserved:working&&scene===9,speaking});
      const y=Number(n.eye?.dataset.eyeY||0),pivot=n.body?.dataset.lifePivot||'0 0',headPivot=n.head?.dataset.lifePivot||'0 0';
      put(n.eye,'transform',`translate(0 ${y}) scale(1 ${pose.blink.toFixed(3)}) translate(0 ${-y})`);
      put(n.gaze,'transform',`translate(${(pose.gaze*.7).toFixed(3)} 0)`);
      const [px,py]=pivot.split(' ').map(Number);
      put(n.body,'transform',`translate(${px} ${py+pose.bob}) scale(1 ${pose.breath.toFixed(5)}) translate(${-px} ${-py})`);
      put(n.head,'transform',`rotate(${pose.tilt.toFixed(3)} ${headPivot})`);
      put(n.gesture,'transform',`rotate(${(pose.gesture*(kind==='elf'?-4:2)).toFixed(3)} 2 -29)`);
      if(n.mouth){const cy=kind==='elf'?-34:kind==='woff'?23:-56,cx=kind==='elf'?1:kind==='woff'?0:2;
        put(n.mouth,'d',pose.open?`M${cx-4} ${cy}q4-2 8 0q-4 6-8 0Z`:n.closed);
        put(n.mouth,'fill',pose.open?'#3a4c4d':n.fill);}
      put(n.actor,'data-role',speaker?who===speaker?'speaker':'listener':'idle');
      put(n.actor,'data-life',pose.gesture>.1?kind==='elf'?'check-notes':'settle':'rest');
    }
  }
  return {profiles,sample,refresh,paint};
});

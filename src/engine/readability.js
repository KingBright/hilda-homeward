/** Small tangible objects remain visible and selectable in front of nearby characters.
 * Reparent the original drawing, not a duplicate. Retain its animation-local transform.
 */
Homeward.define('engine/readability', [], () => {
  const sources=['homeLamp','homeBird','northCrank','forestRope','vineHook','gondolaLine','pickup-gearS','pickup-gearM','pickup-gearL','clockFelt','forestWinch','bridgeBrake','intakeRotor','primeHandle','roofControlWheel'];
  const people=new Set(['mom','david','frida','alfur','troll','child','twig','woff','friends']);
  const priority=h=>h.kind==='take'?3:people.has(h.id)?0:h.kind==='exit'?1:2;
  function pick(hotspots,p){return hotspots.filter(h=>Math.abs(p.x-h.x)<=h.w/2&&Math.abs(p.y-h.y)<=h.h/2).sort((a,b)=>priority(b)-priority(a)||a.w*a.h-b.w*b.h)[0];}
  function order(hotspots){return [...hotspots].sort((a,b)=>priority(a)-priority(b)||b.w*b.h-a.w*a.h);}
  function promote(root){
    const layer=root?.querySelector('#interactionObjects');if(!layer)return;
    const matrix=layer.getCTM();if(!matrix)return;
    const inverse=matrix.inverse();
    for(const id of sources){const source=root.querySelector('#'+id);if(!source||layer.contains(source))continue;
      const parent=source.parentNode.getCTM();if(!parent)continue;
      const m=inverse.multiply(parent),wrapper=document.createElementNS('http://www.w3.org/2000/svg','g');
      wrapper.dataset.objectLayer=id;wrapper.setAttribute('transform',`matrix(${[m.a,m.b,m.c,m.d,m.e,m.f].map(v=>v.toFixed(7)).join(' ')})`);
      layer.append(wrapper);wrapper.append(source);
    }
  }
  return {sources,priority,pick,order,promote};
});

/** Selection priority is not painting order. Scene objects stay in their authored
 * scenery hierarchy; only a held item belongs in an actor's hand layer.
 */
Homeward.define('engine/readability', [], () => {
  const sources=['homeLamp','homeBird','northCrank','forestRope','vineHook','gondolaLine','pickup-gearS','pickup-gearM','pickup-gearL','clockFelt','forestWinch','bridgeBrake','intakeRotor','primeHandle','roofControlWheel'];
  const people=new Set(['mom','david','frida','alfur','troll','child','twig','woff','friends']);
  const priority=h=>h.kind==='take'?3:people.has(h.id)?0:h.kind==='exit'?1:2;
  function pick(hotspots,p){return hotspots.filter(h=>Math.abs(p.x-h.x)<=h.w/2&&Math.abs(p.y-h.y)<=h.h/2).sort((a,b)=>priority(b)-priority(a)||a.w*a.h-b.w*b.h)[0];}
  function order(hotspots){return [...hotspots].sort((a,b)=>priority(a)-priority(b)||b.w*b.h-a.w*a.h);}
  const groundObjects=new Set(['forestRope','gondolaLine','pickup-gearS','pickup-gearM','pickup-gearL','clockFelt']);
  function prepare(root){
    if(!root)return;
    for(const id of sources){const source=root.querySelector('#'+id);if(source)source.dataset.sceneDepth=groundObjects.has(id)?'ground':'fixture';}
  }
  return {sources,priority,pick,order,prepare};
});

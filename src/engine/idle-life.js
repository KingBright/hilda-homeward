/** Authored, asynchronous idle beats. Feet stay put; pauses are real pauses between gestures. */
Homeward.define('engine/idle-life', [], () => {
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const pulse=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
  const profiles=Object.freeze({
    '希尔达':Object.freeze({period:13.1,phase:1.7,breath:2.1,hand:[-8,-58],label:'check-satchel'}),
    '大卫':Object.freeze({period:15.7,phase:5.3,breath:1.7,hand:[-8,-61],label:'hold-strap'}),
    '芙丽达':Object.freeze({period:17.3,phase:9.1,breath:1.9,hand:[12,-77],label:'adjust-scarf'}),
    '妈妈':Object.freeze({period:19.1,phase:2.7,breath:1.4,hand:[33,-44],label:'open-palm'})
  });
  function sample({who='妈妈',time=0,reduced=false,moving=false,reserved=false,speaker=false,scene=0}={}){
    const p=Object.hasOwn(profiles,who)?profiles[who]:profiles['妈妈'];
    const t=(Number.isFinite(time)?Math.max(0,time):0)+p.phase+scene*.37;
    const q=t%p.period,gesture=reserved||moving||reduced?0:pulse(q,3.2,4.6,5.1,6.8);
    const look=reserved||moving||reduced?0:pulse(q,7,7.5,8.4,9.2)*(Math.floor(t/p.period)%2?-.55:.55);
    const shift=reserved||moving||reduced?0:Math.sin(t*.37)*.35;
    const blinkPhase=t%(5.1+p.phase*.11),blink=reduced?1:1-.94*pulse(blinkPhase,.18,.235,.285,.36);
    const talk=reserved||moving||reduced||!speaker?0:pulse(q,1.2,1.8,2.1,2.9)*.14;
    const reach=Math.max(gesture,talk);
    const target=speaker&&gesture<.1?[36,-66]:p.hand;
    return {gesture:reach,front:[26+(target[0]-26)*reach,-29+(target[1]+29)*reach],
      back:[-26,-29],shift,
      breath:reserved||reduced?0:Math.sin(t*p.breath)*.28,
      lean:reserved||moving||reduced?0:Math.sin(t*.31)*.22,
      look,head:reduced||reserved?0:look*4,blink,
      beat:reserved?'occupied':moving?'walking':gesture>.1?p.label:Math.abs(look)>.1?'look-around':'rest'};
  }
  return {profiles,sample};
});

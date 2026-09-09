/** A real layered quadruped: four limbs and independent torso, head, ears and tail. */
Homeward.define('art/twig-design', [], () => {
  const p=(d,f='none',s='#344c54',w=1.5)=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(i,x,far)=>`<g data-twig-leg="${i}">${p(`M${x} -28L${x+3} -14L${x} 0`,'none','#354d56',far?7:8)}<path class="twig-leg-fill" d="M${x} -28L${x+3} -14L${x} 0" fill="none" stroke="${far?'#a8c1be':'#e8eddf'}" stroke-width="${far?4.5:5.5}" stroke-linecap="round" stroke-linejoin="round"/><g class="twig-hoof" transform="translate(${x} 0)">${p('M-3-2L-4 1H4L3-2Z',far?'#91aaa9':'#cbd8cc','#526f73',.7)}</g></g>`;
  function markup(){return `<g data-cast="枝枝" data-animal-rig="twig">
    <ellipse class="twig-shadow" cy="3" rx="39" ry="5" fill="#13394235"/>
    <g class="twig-heading">
      ${limb(0,-22,true)}${limb(2,12,true)}
      <g class="twig-torso"><g class="twig-tail">${p('M14-26Q31-55 49-55L44-47 58-45 52-39 59-38Q53-14 23-17Z','url(#cast-fur)')}${p('M28-26q17-3 23-17','none','#faf6df',3)}</g>
      ${p('M-29-39Q-7-54 22-37L25-25Q10-16-9-23L-24-25Z','url(#cast-fur)')}${p('M-15-41Q1-45 13-39','none','#fff9e7',2)}
      <g class="twig-head">
        ${p('M-30-24l-8-3-10-12 1-10q9-12 20-5 15-2 18 11l-6 16Z','url(#cast-fur)')}
        <g class="twig-ear-a">${p('M-44-49l-10-16 15 6 2 14Z','url(#cast-fur)')}${p('M-44-53l-4-7 3 10','#afbec2','none')}</g>
        <g class="twig-ear-b">${p('M-36-54l7-18 5 20-3 6Z','url(#cast-fur)')}${p('M-31-55l2-10 2 10','#afbec2','none')}</g>
        ${p('M-31-59l-6-17 2-13m-2 11-10-8m20 27 6-20 0-11m0 12 11-9','none','#758d8c',2.6)}${p('M-32-59l-5-17m11 15 6-19','none','#d7dcc4',1)}
        <g class="twig-eye"><ellipse cx="-31" cy="-42" rx="2.5" ry="3.6" fill="#263c48"/><ellipse cx="-30.3" cy="-43" rx=".7" ry="1" fill="#fff9ea"/></g>
        ${p('M-48-41l6 2-2 4Z','#263c48')}${p('M-45-32q5 3 9 0','none','#6d9193',1)}
      </g></g>
      ${limb(1,-29,false)}${limb(3,20,false)}
    </g></g>`;}
  return {markup};
});

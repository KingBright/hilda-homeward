/** A real layered quadruped: four limbs and independent torso, head, ears and tail. */
Homeward.define('art/twig-design', [], () => {
  const p=(d,f='none',s='#344c54',w=1.5)=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(i,x,far)=>`<g data-twig-leg="${i}">${p(`M${x} -28L${x+3} -14L${x} 0`,'none','#354d56',far?7:8)}<path class="twig-leg-fill" d="M${x} -28L${x+3} -14L${x} 0" fill="none" stroke="${far?'#a8c1be':'#e8eddf'}" stroke-width="${far?4.5:5.5}" stroke-linecap="round" stroke-linejoin="round"/><g class="twig-hoof" transform="translate(${x} 0)">${p('M-3-2L-4 1H4L3-2Z',far?'#91aaa9':'#cbd8cc','#526f73',.7)}</g></g>`;
  function markup(){return `<g data-cast="枝枝" data-animal-rig="twig">
    <ellipse class="twig-shadow" cy="3" rx="39" ry="5" fill="#13394235"/>
    <g class="twig-heading">
      ${limb(0,-22,true)}${limb(2,12,true)}
      <g class="twig-torso"><g class="twig-tail">${p('M14-26Q31-56 49-55Q46-48 58-45Q52-40 59-38Q52-13 22-17Z','url(#cast-fur)')}${p('M26-25q17-4 24-18','none','#faf6df',2.8)}</g>
      ${p('M-31-37Q-8-53 22-37Q27-29 24-23Q9-16-10-22Q-20-16-29-20Q-36-26-31-37Z','url(#cast-fur)')}${p('M-28-23q-7 5-2 9q7 2 12-4','url(#cast-fur)')}${p('M-15-41Q1-45 14-38','none','#fff9e7',2)}
      <g class="twig-head">
        ${p('M-29-23Q-40-24-48-37Q-49-47-39-52Q-27-59-16-50Q-6-45-9-32Q-15-21-29-23Z','url(#cast-fur)')}
        <g class="twig-ear-a">${p('M-44-49Q-53-62-53-65Q-43-62-39-58L-37-45Z','url(#cast-fur)')}${p('M-44-53l-4-7 3 10','#afbec2','none')}</g>
        <g class="twig-ear-b">${p('M-36-54Q-31-69-29-72Q-25-60-24-52L-27-46Z','url(#cast-fur)')}${p('M-31-55l2-10 2 10','#afbec2','none')}</g>
        ${p('M-31-59l-6-17 2-13m-2 11-10-8m20 27 6-20 0-11m0 12 11-9','none','#758d8c',2.6)}${p('M-32-59l-5-17m11 15 6-19','none','#d7dcc4',1)}
        <g class="twig-eye"><ellipse cx="-31" cy="-42" rx="2.5" ry="3.6" fill="#263c48"/><ellipse cx="-30.3" cy="-43" rx=".7" ry="1" fill="#fff9ea"/></g>
        ${p('M-48-40Q-44-42-42-39Q-43-35-46-35Z','#263c48')}${p('M-45-32q5 3 9 0','none','#6d9193',1)}
      </g></g>
      ${limb(1,-29,false)}${limb(3,20,false)}
    </g></g>`;}
  return {markup};
});

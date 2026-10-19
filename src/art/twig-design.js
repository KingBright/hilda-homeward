/** A real layered quadruped: four limbs and independent torso, head, ears and tail. */
Homeward.define('art/twig-design', [], () => {
  const p=(d,f='none',s='#2f464e',w=1.55)=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const limb=(i,x,far)=>`<g data-twig-leg="${i}">${p(`M${x} -28L${x+3} -14L${x} 0`,'none','#2f464e',far?7.2:8.2)}<path class="twig-leg-fill" d="M${x} -28L${x+3} -14L${x} 0" fill="none" stroke="${far?'#b2c8c5':'#eff3e6'}" stroke-width="${far?4.8:5.8}" stroke-linecap="round" stroke-linejoin="round"/><g class="twig-hoof" transform="translate(${x} 0)">${p('M-3.4-2.4L-4.4 1.2H4.2L3.2-2.4Z',far?'#4c6468':'#364d52','#263a40',.8)}</g></g>`;
  function markup(){return `<g data-cast="枝枝" data-animal-rig="twig">
    <ellipse class="twig-shadow" cy="3" rx="39" ry="5" fill="#13394238"/>
    <g class="twig-heading">
      ${limb(0,-22,true)}${limb(2,12,true)}
      <g class="twig-torso"><g class="twig-tail">${p('M13-26C28-55 46-58 53-53C49-47 58-45 61-41C55-37 61-34 59-29C50-11 26-14 19-18Z','url(#cast-fur)')}${p('M23-24C36-27 46-36 51-46','none','#fffdf0',2.8)}</g>
      ${p('M-32-37C-12-54 16-48 23-36C28-28 25-21 17-19C4-16-9-21-19-18C-27-15-35-22-32-37Z','url(#cast-fur)')}${p('M-30-24C-37-18-32-11-23-13C-17-14-12-19-15-24','url(#cast-fur)')}${p('M-17-41Q1-46 15-37','none','#fffdf2',2.2)}
      <g class="twig-head">
        ${p('M-29-23C-40-24-49-35-48-41C-48-49-39-54-29-56C-19-57-10-49-9-38C-9-26-17-21-29-23Z','url(#cast-fur)')}
        <g class="twig-ear-a">${p('M-43-49C-52-60-54-65-51-67C-44-64-39-58-37-46Z','url(#cast-fur)')}${p('M-44-53l-4-8 4 10','#a9bcc0','none')}</g>
        <g class="twig-ear-b">${p('M-36-54C-32-68-30-73-27-72C-24-62-23-53-27-46Z','url(#cast-fur)')}${p('M-31-55l2-11 2 11','#a9bcc0','none')}</g>
        ${p('M-31-59l-6-17 2-13m-2 11-10-8m20 27 6-20 0-11m0 12 11-9','none','#6d8685',2.7)}${p('M-32-59l-5-17m11 15 6-19','none','#e4e8d3',1.1)}
        <g class="twig-eye"><ellipse cx="-31" cy="-42" rx="2.7" ry="3.8" fill="#233844"/><ellipse cx="-30.2" cy="-43.2" rx=".85" ry="1.15" fill="#fffdf4"/><ellipse cx="-31.8" cy="-40.8" rx=".45" ry=".55" fill="#ffffffb0"/></g>
        ${p('M-48.5-40.5Q-44.5-43-42-39.5Q-43-35-46.5-35.5Z','#233844')}${p('M-45-32q5 3 9.5-.2','none','#688a8c',1.1)}
      </g></g>
      ${limb(1,-29,false)}${limb(3,20,false)}
    </g></g>`;
  }
  return {markup};
});

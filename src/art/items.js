/** Larger inspection illustrations share their silhouettes with the playable inventory. */
Homeward.define('art/items',['art/kit','art/props'],(K,base)=>{
  const {path,circle,ell,rep,group}=K;
  function itemArt(id){
    let svg=base.itemArt(id),extra='';
    if(['gearS','gearM','gearL'].includes(id)){
      const r={gearS:26,gearM:30,gearL:34}[id];
      extra+=circle(0,0,r*.8,'none','#f2d6a4',.8)+circle(0,0,r*.46,'none','#183d41',1.2)+circle(0,0,5,'#c9b884','#35564e',1.2)+path('M-2-2 2 2','none','#466557',1);
      extra+=rep(6,i=>{let a=i*Math.PI/3;return circle(Math.cos(a)*r*.58,Math.sin(a)*r*.58,1.3,'#e7c992','#486355',.7);});
    }
    if(['rope','line','grapple'].includes(id))extra+=path('M-17-24q17 3 25 42M-12-26q17 4 26 37','none','#fff0b6',.65,'stroke-dasharray="1.6 3" opacity=".75"');
    if(id==='felt')extra+=path('M-21-17 18-22 25 17-17 24Z','none','#f2e4be',1,'stroke-dasharray="2 3"')+path('M-9-13v26M0-15v26M9-15v26','none','#647e6e',.6);
    if(id==='scarf')extra+=path('M-23-15Q0-28 23-17M-12-1l11 25','none','#f8e0a7',1,'stroke-dasharray="2.1 2"');
    if(['lamp','shade'].includes(id))extra+=ell(-2,-7,6,14,'#fff3cc','none',0,'opacity=".21"')+path('M-6-19 2-19M-6-16h8','none','#d2c99b',.8);
    if(id==='crank')extra+=path('M-26 11H-10V-16H18','none','#d4e0c0',1)+rep(3,i=>path(`M15 ${i*3}h11`,'none','#805d3b',.8));
    if(id==='pole')extra+=path('M-28 27 24-25','none','#f4daaa',.8)+rep(6,i=>path(`M${-30+i*2} ${24-i*2}l5 5`,'none','#4e6d61',1.3));
    if(id==='plan')extra+=path('M-19-13h15v25H16V-4H4','none','#588e8a',1.4)+circle(-19,-13,2,'#cc7f55')+circle(4,-4,2,'#cc7f55');
    if(id==='hook'||id==='fork')extra+=path(id==='hook'?'M-8-29 3-16V8':'M-20-31v13q0 13 20 11v32','none','#e0e9cf',1.1);
    return svg.replace('</svg>',`<g class="item-detail" pointer-events="none">${extra}</g></svg>`);
  }
  return {itemArt};
});

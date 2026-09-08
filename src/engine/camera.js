/** World-space inspection framing. Input uses the same transform as rendering. */
Homeward.define('engine/camera',[],()=>{
  const presets=[[825,460],[1060,560],[730,520],[1040,480],[855,474],[800,480],[1050,545],[1155,472],[918,447],[1115,462],[962,498],[825,460]];
  function focusFrame(scene,ratio,point){
    const [cx,cy]=point||presets[scene];
    let width=Math.min(990,Math.max(410,660*ratio)),height=width/ratio;
    if(height>760){height=760;width=height*ratio;}
    return {w:width,h:height,x:Math.max(0,Math.min(1600-width,cx-width/2)),y:Math.max(0,Math.min(900-height,cy-height/2)),manual:true};
  }
  return {focusFrame};
});

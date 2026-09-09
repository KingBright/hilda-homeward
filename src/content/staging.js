/** World scale is scene direction, not a CSS zoom. Contacts use the same units. */
Homeward.define('content/staging', [], () => {
  const scales=Object.freeze([1.92,1.52,1.52,1.60,1.52,1.56,1.52,1.52,1.60,1.36,1.52,1.92]);
  const home=Object.freeze({floor:775,windowOffset:90,sill:607,bird:[1090,577],lamp:[1292,645],lampGrip:[1292,570],motherScale:2.38});
  const scale=scene=>scales[scene]??1.52;
  function castScale(who,authored,scene){
    if(who==='妈妈'&&(scene===0||scene===11))return home.motherScale;
    return authored*scale(scene)/1.36;
  }
  const petDistance=scene=>85*scale(scene)/1.36;
  return {scale,castScale,petDistance,home};
});

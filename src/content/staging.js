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
  const ridgeGround=x=>x<=480?833:x<620?833-(x-480)*26/140:x<990?807:807+Math.min(1,(x-990)/80)*3;
  const mix=(a,b,t)=>a+(b-a)*t;
  const ridgeChild=t=>`translate(${mix(682,1188,t)} ${mix(785,794,t)}) scale(${mix(1.15,.95,t)})`;
  function ridgeArm(t){
    const a=[-58,-73,-107,-50,-73,-9,-51,-17,-60,-42,-58,-73],b=[-58,-43,-114,-81,-174,-55,-179,-33,-115,-52,-65,-19];
    const p=a.map((v,i)=>mix(v,b[i],t));
    return `M${p[0]} ${p[1]}Q${p[2]} ${p[3]} ${p[4]} ${p[5]}L${p[6]} ${p[7]}Q${p[8]} ${p[9]} ${p[10]} ${p[11]}Z`;
  }
  return {scale,castScale,petDistance,home,ridgeChild,ridgeArm,ridgeGround};
});

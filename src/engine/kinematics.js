/** Reach a target with two rigid segments. Unreachable targets are clamped, never stretched. */
Homeward.define('engine/kinematics', [], () => {
  function solve(origin, target, upper, lower, bend=1) {
    if (![...origin,...target,upper,lower,bend].every(Number.isFinite) || upper<=0 || lower<=0)
      throw new TypeError('Invalid limb geometry');
    const dx=target[0]-origin[0],dy=target[1]-origin[1],actual=Math.hypot(dx,dy);
    const d=Math.max(Math.abs(upper-lower)+1e-6,Math.min(upper+lower-1e-6,actual));
    const ux=actual>1e-8?dx/actual:0,uy=actual>1e-8?dy/actual:1;
    const cos=Math.max(-1,Math.min(1,(d*d+upper*upper-lower*lower)/(2*d*upper)));
    const sin=Math.sqrt(Math.max(0,1-cos*cos))*(bend>=0?1:-1);
    return {elbow:[origin[0]+upper*(ux*cos-uy*sin),origin[1]+upper*(uy*cos+ux*sin)],
      end:[origin[0]+ux*d,origin[1]+uy*d], reachable:actual<=upper+lower && actual>=Math.abs(upper-lower)};
  }
  return {solve};
});

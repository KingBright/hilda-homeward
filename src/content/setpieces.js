/** Shared stage geometry and puzzle rules. No DOM or presentation state. */
Homeward.define('content/setpieces', [], () => {
  const archive = Object.freeze({min:640,max:1260,initial:769,docks:[700,925,1170],book:[1170,342],baseY:798,gripY:707,climb:290});
  const roof = Object.freeze({wheel:[1220,657],lens:[1292,490],star:[1044,176],anchor:[426,652],david:[670,710],safe:[466,767],brace:[1069,773]});
  const ladderX = s => s.f.ladderX ?? archive.initial;
  function snapLadder(x) {
    if(!Number.isFinite(x)) throw new TypeError('Ladder destination must be finite');
    x=Math.max(archive.min,Math.min(archive.max,x));
    return archive.docks.find(d=>Math.abs(d-x)<=38) ?? x;
  }
  const nextDock = s => archive.docks.find(d=>d>ladderX(s)+12) ?? archive.docks[0];
  const aligned = s => Math.abs(ladderX(s)-archive.book[0])<=28;
  const canRead = s => aligned(s) && !!s.f.ladderBrake;
  function roofGround(x) {
    if(x<=480)return 767;
    if(x<=755)return 767-(x-480)*21/275;
    if(x<=920)return 746+(x-755)*27/165;
    return 773;
  }
  function wheelAngle(p) {
    if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new TypeError('Invalid wheel point');
    return Math.atan2(p.y-roof.wheel[1],p.x-roof.wheel[0])*180/Math.PI;
  }
  /** Retreat never undoes a completed rescue, consumes equipment or edits prior chapters. */
  function retreat(s) {
    const o={...s,f:{...s.f},inventory:[...s.inventory],danger:0,failures:s.failures+1};
    o.heroX=s.f.davidSafe?802:315;
    if(!s.f.roofAnchor&&!o.inventory.includes('line'))o.inventory.push('line');
    return o;
  }
  return {archive,roof,ladderX,snapLadder,nextDock,aligned,canRead,roofGround,wheelAngle,retreat};
});

/** Deterministic material detail. Geometry is decorative; puzzle hit regions stay in scene logic. */
Homeward.define('art/finishing', ['art/kit','content/details','content/mechanisms'], (K,details,Mechanisms) => {
  const {path,rect,circle,ell,group,rep,text,fern}=K;
  const defs=`<defs>
    <linearGradient id="v3Brass" x2=".2" y2="1"><stop stop-color="#fae5b2"/><stop offset=".25" stop-color="#bc9764"/><stop offset=".62" stop-color="#806849"/><stop offset="1" stop-color="#d3b377"/></linearGradient>
    <radialGradient id="v3Amber"><stop stop-color="#ffe2a3" stop-opacity=".45"/><stop offset=".35" stop-color="#e9b67b" stop-opacity=".15"/><stop offset="1" stop-color="#e9b67b" stop-opacity="0"/></radialGradient>
    <linearGradient id="v3Ray" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8e1a4" stop-opacity=".16"/><stop offset="1" stop-color="#f8e1a4" stop-opacity="0"/></linearGradient>
    <linearGradient id="v3Mist" x2="0" y2="1"><stop stop-color="#b4d3c4" stop-opacity="0"/><stop offset=".65" stop-color="#adc8b8" stop-opacity=".10"/><stop offset="1" stop-color="#577d74" stop-opacity="0"/></linearGradient>
    <pattern id="v3Stone" width="143" height="83" patternUnits="userSpaceOnUse"><path d="m9 17 21-2m44 33 23 4m28-36-4 7M24 69l3-4 14 2M109 72l8-4" fill="none" stroke="#d8d7b0" stroke-opacity=".10" stroke-width="1"/><path d="m12 44 3-9 15-3m66-10 11 3-2 9M66 75l10-2" fill="none" stroke="#112e35" stroke-opacity=".23"/></pattern>
    <pattern id="v3Fabric" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0h6M0 3h6M1 0v6M4 0v6" fill="none" stroke="#e2d5ac" stroke-opacity=".18" stroke-width=".5"/></pattern>
  </defs>`;
  const bolt=(x,y,r=4)=>circle(x,y,r,'#b4ad85','#213e43',1.5)+path(`M${x-r*.55} ${y+r*.55}l${r*1.1}-${r*1.1}`,'none','#54645a',1.3);
  function plate(x,y,w,label){return group(x,y,1,rect(-w/2,-17,w,34,'#2d4b4a',5,'#8b9977',1.2)+rect(-w/2+3,-14,w-6,28,'none',3,'#b9af8255',.8)+bolt(-w/2+8,0,2.5)+bolt(w/2-8,0,2.5)+text(0,4,label,10,'#d0c39c'));}
  function vine(x,y,scale=1,flip=1){return group(x,y,scale,`<g transform="scale(${flip} 1)">${path('M0 0Q67 1 59 71t36 98','none','#2b5148',4)}${rep(10,i=>{let xx=36+Math.sin(i*.75)*24,yy=i*16;return path(`M${xx} ${yy}q${i%2?28:-29} -25 ${i%2?26:-28} 3q${i%2?-12:13} 15 ${i%2?-26:28} -3`,'#4c7460','#234843',.8);})}</g>`);}
  function motes(scene){return `<g class="v3-motes" pointer-events="none">${rep(20,i=>{let x=(i*317+scene*79)%1560+20,y=(i*117)%700+70;return circle(x,y,i%4===0?2:1,'#ecd39b','none',0,`style="animation-delay:-${i*.73}s" class="v3-mote"`);})}</g>`;}
  function observation(state){let d=details[state.scene],x=d.x,y=d.y,s='';
    if([0,11].includes(state.scene)){
      s=rect(x-12,y-51,24,103,'#9c7650',3,'#604f3c',2)+rep(8,i=>path(`M${x-10} ${y+36-i*11}h${i%2?10:17}`,'none','#e6cba2',1.5))+text(x+22,y-42,state.scene===11?'今天':'去年',9,'#cdbd90','start');
    }else if(state.scene===2){
      s=path(`M${x-24} ${y+37}v-34q24-32 48 0v34Z`,'#183f40','#708776',3)+path(`M${x} ${y+35}V${y-8}`,'none','#69816d',2)+circle(x+11,y+12,3,'#d7b77a')+rep(4,i=>ell(x-32+i*20,y+46,10,3,'#78917a'));
    }else if(state.scene===6){s=path(`M${x-35} ${y+10}q30-30 57-1M${x-6} ${y-22}v39m-12-27 24 0m-12 11-15 18m15-18 12 18M${x+37} ${y-25}q20 5 5 23q-23 2-20-11q0-11 15-12`,'none','#b1b397',2.6);}
    else if(state.scene===10){s=path(`M${x-30} ${y+12}q45-12 70 4`,'none','#547662',4)+group(x,y,.7,path('M-15 0Q-13-20 3-13Q14-19 18-10L31-6 17-3Q7 18-15 0Z','#b78354','#36564e',2)+circle(12,-10,1.5,'#243f43')+path('M-4 7l-3 8m9-6v8','none','#355d55',2));}
    else if(state.scene===9){s=path(`M${x-22} ${y+30}v-55l22-17 22 17v55Z`,'#2c4c52','#8f9475',3)+rect(x-13,y-18,26,31,'#e9cb8b',2)+path(`M${x} ${y-18}v31`,'none','#465b52',3)+ell(x,y-2,83,101,'url(#v3Amber)');}
    else if(state.scene===1){s=path(`M${x-20} ${y+38}v-85h36v85`,'none','#a1ad8b',2)+rep(7,i=>path(`M${x-18} ${y+30-i*12}h${i%3?12:22}`,'none','#d1c99e',1.5))+path(`M${x-35} ${y+17}h68`,'none','#b59b69',2);}
    else{s=plate(x,y,Math.min(d.w,128),['','','','待送信件','旧城水务','最后一个','', '守钟人','夜班交接'][state.scene]||'归途');}
    return `<g id="scene-observation" class="v3-observation" opacity="${state.notes.includes(d.note)?'.66':'1'}">${s}</g>`;
  }
  function scenery(state){const i=state.scene,f=state.f;let b='';
    if([0,11].includes(i)){
      b+=path('M949 219H1160L702 824H232Z','url(#v3Ray)')+path('M1069 219H1106L425 820H377Z','url(#v3Ray)');
      b+=rep(20,j=>path(`M${465+j*31} 800q20-13 43 2`,'none','#dac193',.7,'opacity=".14"'));
      b+=ell(1015,577,264,269,'url(#v3Amber)')+plate(842,307,84,'北门 · 旧路');
    }
    if([1,7,8].includes(i))b+=rect(824,155,758,557,'url(#v3Stone)',8)+vine(887,124,1.2)+vine(1530,114,1.4,-1);
    if([1,2,5,7,9].includes(i)){
      b+=rep(14,j=>{let x=(j*211+i*127)%1560+20,y=817+(j%4)*17;return ell(x,y,13+j%3*7,1.7,'#98bba96b')+path(`M${x-25} ${y+7}q25 4 50 0`,'none','#a4c4b442',1);});
      b+=path('M0 841Q382 719 755 851T1600 818V900H0Z','url(#v3Mist)');
    }
    if(i===2){
      b+=vine(1250,151,1.6,-1)+vine(94,172,1.3)+path('M117 243Q372 382 556 234','none','#94ac8244',2);
      b+=rep(11,j=>circle(945+j*29,510+Math.sin(j)*24,1.8,'#e0d391','none',0,'class="v3-mote"'));
    }
    if(i===3){b+=path('M922 80H1140L821 732H422Z','url(#v3Ray)')+vine(1347,164,1.3,-1)+plate(721,389,102,'旧山路档案');}
    if(i===4){
      b+=rect(103,124,1390,624,'url(#v3Stone)',20);
      [[640,400],[640,570],[940,570]].forEach(([x,y])=>{
        b+=rep(8,j=>{let a=j*Math.PI/4;return bolt(x+Math.cos(a)*49,y+Math.sin(a)*49,2.7);});
      });
      b+=group(1128,668,1,rect(-36,-39,72,78,'#304f4a',8,'#9b9c78',2)+bolt(-27,-28)+bolt(27,-28)+bolt(-27,28)+bolt(27,28)+circle(0,8,15,'#bdab77','#223e41',3)+path(f.pump?'M0 8 14 26':'M0 8-11-23','none','url(#v3Brass)',9)+ell(f.pump?14:-11,f.pump?26:-23,18,7,'#d1b77f','#3d544a',2));
      b+=plate(1128,740,100,f.pump?'运行 / 已锁紧':'试　压');
      b+=path('M1078 620h-24v-74','none','#bfbb9655',1.5)+text(998,639,'接通后缓慢试压',11,'#c2c4a1');
      b+=rep(5,j=>group(287+j*17,378,1,rect(0,-19,8,39,'#506e61',2,'#bcc095',1)));
    }
    if(i===5){b+=plate(803,644,133,'平衡后释放制动')+rep(8,j=>bolt(672+j*38,163,3))+vine(221,340,.9);}
    if(i===6){b+=ell(760,545,260,205,'url(#v3Amber)')+motes(i)+path('M237 730q316 54 583 9','none','#c4b58a2b',2);}
    if(i===7){
      Mechanisms.gears.forEach(({x,y,radius})=>{let r=radius+12;b+=rep(6,j=>{let a=j*Math.PI/3;return bolt(x+Math.cos(a)*r,y+Math.sin(a)*r,3.3);});});
      b+=path('M1084 413l6 9 6-9','none','#f3dba0',3);
      if(f.gearMSet){let a=(f.gearIndex||0)*Math.PI/2;
        b+=path(`M${1090+Math.cos(a)*31} ${486+Math.sin(a)*31}L${1090+Math.cos(a)*47} ${486+Math.sin(a)*47}`,'none',f.gearAligned?'#ffedbc':'#e0bd77',4,'stroke-linecap="round"');
      }
      b+=plate(1029,660,168,f.gearAligned?'门闩已归位':'金线对准上方缺口');
      b+=ell(1165,275,144,167,'url(#v3Amber)')+ell(1538,305,123,172,'url(#v3Amber)');
    }
    if(i===8){b+=rep(9,j=>bolt(394+j*59,146,4))+plate(287,301,145,'先旁通 · 后止鸣')+ell(1232,366,261,264,'url(#v3Amber)');}
    if(i===9){b+=rep(11,j=>bolt(1196+j%3*56,626+Math.floor(j/3)*29,3.3))+path('M1226 556H1358M1254 554v80M1324 554v80','none','#ccbc8d55',2)+rect(0,180,1600,580,'url(#v3Mist)');}
    if(i===10){b+=path('M1100 84H1480L648 861H55Z','url(#v3Ray)')+path('M1360 95H1450L430 897H328Z','url(#v3Ray)')+motes(i);}
    if(![6,10].includes(i))b+=motes(i);
    return `<g id="v3-scenery" pointer-events="none">${b}${observation(state)}</g>`;
  }
  function foreground(state){const i=state.scene;let b='';
    if([1,2,5,6,7,10].includes(i)){
      b+=`<g class="v3-foreground-leaves">${fern(-21,953,2.2,'#173f40')}${fern(1561,952,2.4,'#153c3e')}${fern(1506,925,1.1,'#426d58')}</g>`;
      if(i===2)b+=path('M-10-5Q167-12 286 79Q97 27 71 175L-10 292Z','#173d40')+vine(102,30,1.3)+vine(1467,-37,1.2,-1);
    }
    if(i===9)b+=path('M-5 893l178-21 244 33H-5Z','#102f3b')+path('M1316 899l241-44 59 51Z','#132e38');
    return `<g id="v3-foreground" pointer-events="none">${b}</g>`;
  }
  return {defs,scenery,foreground,bolt,plate};
});

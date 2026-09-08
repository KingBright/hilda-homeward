/** Three authored dioramas. Only transient presentation is animated here; state lives in scenes. */
Homeward.define('art/chapter-life', ['art/kit','art/finishing'], (K,F) => {
  const {path,rect,circle,ell,text,group,rep,fern,gear}=K;
  const defs=`<defs>
    <clipPath id="northGateArch"><path d="M1240 784V464Q1249 327 1381 327T1516 464V784Z"/></clipPath>
    <linearGradient id="chapterCopper" x2=".2" y2="1"><stop stop-color="#d3be89"/><stop offset=".34" stop-color="#9e8b60"/><stop offset=".6" stop-color="#567d70"/><stop offset="1" stop-color="#b49c6d"/></linearGradient>
    <linearGradient id="chapterBeam" x1=".6" y1="0" x2=".3" y2="1"><stop stop-color="#f5d196" stop-opacity=".12"/><stop offset="1" stop-color="#edc59b" stop-opacity="0"/></linearGradient>
    <radialGradient id="chapterPool"><stop stop-color="#c5cfb7" stop-opacity=".32"/><stop offset="1" stop-color="#6aa498" stop-opacity="0"/></radialGradient>
    <pattern id="chapterWood" width="47" height="19" patternUnits="userSpaceOnUse"><path d="M-3 8Q21 1 50 10M3 16q16-10 37-1" fill="none" stroke="#e0c393" stroke-opacity=".16" stroke-width=".8"/></pattern>
  </defs>`;
  function ripples(scene){return `<g class="chapter-ripples">`+rep(9,i=>{
    const x=(i*197+scene*83)%1400+90,y=scene===2?735+i*16:807+i%3*21;
    return `<ellipse cx="${x}" cy="${y}" rx="${7+i%3*3}" ry="2.5" fill="none" stroke="#c1d2be" stroke-width=".8" class="chapter-ripple" style="animation-delay:-${i*.38}s"/>`;
  })+`</g>`;}
  function scenery(S){const f=S.f;let b='';
    if(S.scene===1){
      b+=path('M638 551 778 551 1013 887H498Z','url(#chapterBeam)')+path('M1110 389 1098 419 1224 802 981 802Z','url(#chapterBeam)');
      b+=rep(9,i=>path(`M${1092+i*54} 279q16-9 35 3`,'none','#aab299',1,'opacity=".35"'));
      b+=F.plate(1168,742,132,'转轮三周 · 棘爪锁定')+group(1205,607,.64,gear(0,0,23,12,'#9ca082',0)+path('M-4-27 27-39 38-30 12-11Z','#667f6d','#274a4c',2));
      b+=rep(3,i=>circle(1220,710+i*19,5,i<(f.gateTurns||0)?'#e4c486':'#365951','#9aaa8b',1.5));
      b+=group(699,704,1,rect(-19,-43,39,41,'#9b8662',4,'#42564b',2)+rect(-19,-43,39,41,'url(#chapterWood)',4)+path('M-19-27H20M0-43V-3','none','#3e594d',3));
      b+=group(1517,787,.7,path('M-21 0V-44h42V0Z','#405d50','#1e4249',3)+fern(0,-38,.45,'#6a8b66'));
      b+=ripples(1)+`<g id="gateDepthGlow" opacity="${f.gateOpen?.8:.14}">${path('M1256 778 1518 778 1580 899 1140 899Z','url(#chapterBeam)')}${path('M1378 338v418','none','#d4cb9c',2,'opacity=".2"')}</g>`;
      b+=text(835,480,'修缮 · 夜间请归还工具',10,'#b4c3a9');
    }
    if(S.scene===2){
      b+=path('M1153 166H1224L902 851H441Z','url(#chapterBeam)','none',0)+ell(792,735,268,50,'url(#chapterPool)');
      b+=rep(7,i=>group(1069+i*15,714+i%2*4,.65,path('M-11 0 0-19 19-11 22 2Z','#91a18a','#426e5d',1.5)));
      b+=path('M399 719v-61m-15 68h45','none','#526b58',9)+circle(404,684,12,'url(#chapterCopper)','#274b4b',3);
      b+=`<g id="bridgeBrake" transform="rotate(${f.bridgeBrace?35:-20} 404 684)">${path('M404 684v-41','none','#c8b98c',6)}${ell(404,640,16,6,'#9da780','#31554f',2)}</g>`;
      b+=F.plate(438,590,123,f.bridge?'棘爪已锁 · 可通行':'一人稳住 · 一人收绳');
      if(f.bridgeBrace&&!f.bridge)b+=path('M354 664Q376 657 402 680M407 664Q419 677 405 685','none','#7e986e',12)+circle(402,680,5,'#e8cfa8','#315050',1.5)+circle(405,685,5,'#e8cfa8','#315050',1.5);
      b+=rep(10,i=>{let x=607+i*37,y=818+i%3*14;return path(`M${x} ${y}q8-8 18-1l-13 10Z`,i%2?'#a9ac7a':'#cfb881','#4d7b69',1,`class="stream-leaf ${f.pump?'downstream':'upstream'}" style="animation-delay:-${i*.51}s"`);});
      b+=ripples(2)+rep(16,i=>circle(220+i*71,571+Math.sin(i*2.3)*96,1.3,'#dfe5b6','none',0,`class="chapter-dew" style="animation-delay:-${i*.25}s"`));
      b+=path('M293 739q29-35 67 1','none','#c6c5a066',2)+text(1268,654,'水务小径',11,'#b2c0a2');
    }
    if(S.scene===4){
      b+=path('M590 55H714L935 725H470Z','url(#chapterBeam)')+path('M1400 67H1455L1198 795H1070Z','url(#chapterBeam)');
      b+=path('M350 654V422L329 399','none','#203e43',12)+path('M350 654V422L329 399','none','url(#chapterCopper)',7)+rect(335,545,31,58,'#526e60',4,'#93a48b',2)+F.bolt(350,558)+F.bolt(350,589);
      b+=`<g id="intakeRotor" transform="rotate(${f.intakeClosed?90:0} 350 682)">${circle(350,682,31,'#2d4b4a','#bcb486',6)}${path('M350 651v62m-31-31h62','none','#a79f75',6)}${circle(350,682,10,'#d1b783','#365953',3)}</g>`;
      b+=F.plate(349,755,111,f.intakeClosed?'进水闸 · 已关闭':'进水闸 · 已开启');
      b+=group(1164,247,1,rect(-131,-35,262,71,'#486457',7,'#a1ab83',2)+F.bolt(-119,-22,3)+F.bolt(119,22,3)+text(0,-11,'夜 班 检 修',12,'#dcc897')+text(0,14,'关闸 → 清网 → 接管 → 开闸试压',10,'#c1c9a9'));
      b+=group(738,672,1,rect(-95,-20,190,31,'#40594f',3,'#7c9277',1)+text(0,0,'检修台 · 扶稳再操作',10,'#bec7a6'));
      b+=rep(12,i=>{let x=133+i*109;return path(`M${x} 125q-5 16 0 33t0 28`,'none','#a3b995',1,'opacity=".21"');});
      b+=rep(8,i=>circle(1337+i%2*22,581+i*18,3,'#94b39d','none',0,'class="chapter-dew"'));
      if(f.filter&&!f.intakeClosed)b+=path('M446 596v83','none','#c7e2bb',2,'stroke-dasharray="8 11" class="flowline"');
    }
    return `<g id="chapter-scenery" pointer-events="none">${b}</g>`;
  }
  let rootCache=null,nodes={};
  function animate(root,action,state){
    if(root!==rootCache){rootCache=root;nodes={};}
    const node=id=>nodes[id]?.isConnected?nodes[id]:(nodes[id]=root?.querySelector('#'+id));
    const set=(id,k,v)=>node(id)?.setAttribute(k,String(v));
    const fx=node('actionFX');if(!fx)return;
    if(!action){if(fx.childNodes.length)fx.replaceChildren();return;}
    const q=action.sample(),p=q.effort,c=action.score;
    if(c.effect==='gate'&&c.mounted){set('gateBars','transform',`translate(0 ${-(c.from+p)*335/3})`);set('gateRotor','transform',`rotate(${p*65} 1169 653)`);set('gateDepthGlow','opacity',.14+(c.from+p)/3*.66);}
    if(c.effect==='awning'){set('awningFabric','transform',`translate(0 ${p*356.4}) scale(1 ${1-p*.72})`);set('awningGrip','transform',`translate(0 ${p*73})`);}
    if(c.effect==='branch'){set('bentBranch','d',`M220 520Q370 ${430+130*p} 541 ${460+155*p}`);set('vineHook','transform',`translate(0 ${p*146})`);}
    if(c.effect==='bridge'){
      set('forestWinch','transform',`rotate(${p*360} 0 0)`);
      root.querySelectorAll('[data-bridge-plank]').forEach(el=>{const i=Number(el.dataset.bridgePlank),s=Math.sin(i/15*Math.PI);
        el.setAttribute('transform',`translate(${551+i*32} ${706+s*21-i*1.1+s*158*(1-p)}) rotate(${s*36*(1-p)})`);
      });
    }
    if(c.effect==='intake')set('intakeRotor','transform',`rotate(${(c.from+(c.from?-p:p))*90} 350 682)`);
    if(c.effect==='filter'){set('filterLeaves','transform',`translate(${-12*p} ${p*36})`);set('filterLeaves','opacity',1-p);}
    if(c.effect==='pipe')root.querySelectorAll(`[data-pipe-rotor="${c.node}"]`).forEach(el=>el.setAttribute('transform',`rotate(${(c.from+p)*90})`));
    if(c.effect==='prime'){set('primeHandle','transform',`rotate(${-p*172} 0 8)`);set('pressureNeedle','transform',`rotate(${p*120.3} 0 -28)`);}
    let visual='';
    if(c.effect==='grapple'&&p>0&&p<1){const x=545+p*550,y=648+(556-648)*p-Math.sin(p*Math.PI)*166;
      visual=path(`M521 677Q${(521+x)/2} ${y+50} ${x} ${y}`,'none','#cab888',3)+group(x,y,1,path('M-9-5Q6-14 9 0Q9 13-5 9','none','#e1d8b4',5));
    }
    if(c.effect==='branch'&&p>0)visual=path(`M534 ${496+p*146}L505 690`,'none','#cfbb85',3);
    if(c.kind==='clear'&&p>.25&&p<.85)visual=rep(4,i=>ell(439+i*13,661+(p-.25)*90+i*7,6,3,i%2?'#bba572':'#7d936f'));
    if(fx.innerHTML!==visual)fx.innerHTML=visual;
  }
  return {defs,scenery,animate};
});

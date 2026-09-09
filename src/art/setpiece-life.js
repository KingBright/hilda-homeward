/** Archive and rooftop presentation. Puzzle decisions belong to the scene modules. */
Homeward.define('art/setpiece-life', ['art/kit','art/finishing','content/setpieces','engine/setpiece-motion'], (K,F,Stage,Motion) => {
  const {path,rect,circle,ell,text,group,rep}=K;
  function scenery(s) {
    let b='';const f=s.f;
    if(s.scene===3) {
      b+=rep(3,i=>group(Stage.archive.docks[i],849,1,
        path('M-34-41H34M0-46v11','none','#d8c38f',2)+text(0,0,['风 · 旧城','叶 · 山林','水 · 钟楼'][i],12,'#d7cea4')));
      b+=group(1170,236,1,rect(-85,-22,170,38,'#344f46',4,'#b7b48a',2)+text(0,3,'水务卷宗 · 第七架',13,'#e1d1a0'));
      b+=group(765,200,1,rect(-155,-38,310,56,'#b5ac80',4,'#354e42',3)+text(0,-12,'先对准 · 再锁轮 · 扶稳取书',14,'#345349')+text(0,8,'借书的人，也要好好回来。',10,'#5a6e55'));
      b+=`<g id="archiveBrakeShift">`+group(Stage.ladderX(s)+82,777,1,
        path('M-19 20H10L17 1H-9Z','#586b50','#253f3c',3)+circle(-6,5,7,'#cdb780','#314b40',2)+
        `<g id="archiveBrakePedal" transform="rotate(${f.ladderBrake?26:-25} -6 5)">${path('M-6 5L19-8','none','#c1a971',7)}${rect(8,-14,28,11,'#cbb98d',3,'#385347',2)}</g>`+
        circle(26,22,4,f.ladderBrake?'#e3c886':'#425b48','#cbc29a',1))+`</g>`;
      b+=rep(12,i=>group(618+(i%4)*175,436+Math.floor(i/4)*113,1,
        rect(-16,-5,32,10,'#cfbf8b',2,'#52634c',1)+text(0,2,String(17+i).padStart(3,'0'),6,'#52634c')));
      b+=path('M428 158 500 167 876 827 627 827Z','url(#chapterBeam)');
      b+=group(590,775,1,rect(-30,-61,61,63,'#8b8060',3,'#345348',2)+rect(-30,-61,61,63,'url(#chapterWood)')+path('M-33-48H33M-33-16H33','none','#b9aa78',3)+text(0,-30,'待归还',10,'#d3c293'));
    }
    if(s.scene===9) {
      // The old inspection boards exist before rescue; the safety line makes them traversable.
      b+=`<g id="roofInspectionBoards" opacity="${f.davidSafe?1:.38}">`+rep(11,i=>{
        const x=481+i*24,y=Stage.roofGround(x);
        return path(`M${x} ${y}l23-2 3 8-25 3Z`,'#9c9374','#38555a',2)+circle(x+5,y+4,1.5,'#c8baa0');
      })+`</g>`;
      if(f.davidSafe)b+=path('M425 652Q596 675 767 644','none','#e0c89a',5)+path('M755 742V632','none','#7d998c',7);
      b+=path('M1000 752l24-47 27 49Z','#b0a980','#345458',3)+path('M1013 743l11-22 13 24Z','#46655f');
      b+=`<g id="roofBraceHands" opacity="${f.roofBrace?1:0}">${path('M1052 704Q1037 703 1025 716M1090 704Q1065 717 1031 721','none','#b18545',12)}${circle(1025,716,5,'#efc8a1','#315050',1.5)}</g>`;
      b+=path('M1220 633V591L1250 569','none','#2c4548',12)+path('M1220 633V591L1250 569','none','#a9a87f',6);
      b+=circle(1220,657,41,'#2c4950','#849d8b',3)+`<g id="roofControlWheel" transform="rotate(${s.beaconAngle??-65} 1220 657)">${circle(1220,657,29,'#4d726b','#c4b384',6)}${path('M1191 657h58m-29-29v58','none','#b8aa7c',5)}${circle(1249,657,7,'#e6c790','#3c5850',2)}</g>`;
      b+=group(1189,617,1,path('M0-9 3-3 9-2 4 3 6 9 0 5-6 9-4 3-9-2-3-3Z','#e6d7a2','#395659',1));
      b+=F.plate(1220,730,143,'低处检修轮 · 寻星')+F.plate(837,834,219,'先稳住，再伸手。');
      b+=`<g id="roofPennant" transform="rotate(-8 217 392)">${path('M217 392q42-13 81 2l-19 14q-31-9-62-5Z','#c19b68','#344f55',2)}${path('M231 390l-2 13m16-14-3 15m16-14-4 15','none','#edd5a0',2)}</g>`;
      b+=rep(13,i=>{const x=803+i*52,y=790+i%3*27;return path(`M${x} ${y}q7-10 23-2l-5 5Z`,'#557978','#365960',1);});
    }
    return `<g id="setpieceScenery" pointer-events="none">${b}<g id="setpieceFX"></g></g>`;
  }
  let rootCache=null,nodes={};
  function animate(root,action,s,preview=null) {
    if(!root||![3,9].includes(s.scene))return;
    if(root!==rootCache){rootCache=root;nodes={};}
    const node=id=>nodes[id]?.isConnected?nodes[id]:(nodes[id]=root.querySelector('#'+id));
    const set=(id,key,value)=>node(id)?.setAttribute(key,String(value));
    const c=action?.score,q=action?.sample(),p=q?.progress??0,e=q?.effort??0,reduced=s.settings.reduced;
    const stage=(a,b)=>Motion.segment(p,a,b);let fx='';
    if(s.scene===3) {
      const dx=c?.effect==='ladderSlide'&&!reduced?(c.to-c.from)*e:0;
      set('archiveLadderShift','transform',`translate(${dx} 0)`);set('archiveBrakeShift','transform',`translate(${dx} 0)`);
      set('archiveLadderShift','opacity',preview?.kind==='ladder'?.48:1);
      set('archiveBook','opacity',c?.effect==='archiveBook'&&p>.57&&!reduced?0:1);
      const brake=c?.effect==='ladderBrake'?(c.from?26-51*e:-25+51*e):s.f.ladderBrake?26:-25;
      set('archiveBrakePedal','transform',`rotate(${reduced?(s.f.ladderBrake?26:-25):brake} -6 5)`);
      if(preview?.kind==='ladder')fx=text(preview.x,579,'松手后推到这里',13,'#f1dda7');
    }
    if(s.scene===9) {
      const cast=Motion.cast(s,action,reduced);
      for(const [id,point] of [['roofDavid',cast.david],['roofFrida',cast.frida],['roofTwig',cast.twig]])set(id,'transform',`translate(${point[0].toFixed(2)} ${point[1].toFixed(2)})`);
      const lift=s.f.fridaSafe?1:c?.effect==='roofLever'&&!reduced?stage(.12,.47):0;
      set('roofBeam','transform',`rotate(${lift*24} 1225 720)`);
      set('roofBraceHands','opacity',s.f.roofBrace&&!s.f.roofDone?1:0);
      const arms=node('roofDavid')?.querySelector('.person-arms');if(arms)arms.style.visibility=s.f.roofBrace&&!s.f.roofDone&&c?.effect!=='roofBoard'?'hidden':'';
      const angle=preview?.kind==='beacon'?preview.angle:c?.effect==='roofBeacon'&&!reduced?c.from+(c.to-c.from)*e:s.beaconAngle;
      set('roofLightBeam','transform',`rotate(${angle} 1292 490)`);set('roofOpticPointer','transform',`rotate(${angle} 1292 490)`);set('roofControlWheel','transform',`rotate(${angle} 1220 657)`);
      if(c?.effect==='roofAnchor'&&!reduced)fx=path(`M${415+Math.sin(p*16)*10} ${653+e*14}q-34-31-1-37t26 34q-17 24-31 4`,'none','#ddc390',4);
      if(c?.effect==='roofRescue'&&!reduced) {
        const deploy=stage(.10,.34),endX=466+(cast.david[0]-466)*deploy,endY=658+(cast.david[1]-58-658)*deploy;
        fx=path(`M426 652Q${(426+endX)/2} ${Math.min(650,endY)-Math.sin(deploy*Math.PI)*70} ${endX} ${endY}`,'none','#ead6a5',4);
      }
      set('roofPennant','transform',`rotate(${reduced?-8:-8+Math.sin(s.playSeconds*3.6)*7} 217 392)`);
      if(c?.effect==='roofBoard')set('roofBraceHands','opacity',0);
    }
    const layer=node('setpieceFX');if(layer&&layer.innerHTML!==fx)layer.innerHTML=fx;
  }
  return {scenery,animate};
});

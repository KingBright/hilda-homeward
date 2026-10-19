/** World-space contact points. Acting, mechanism motion and footprints share this score. */
Homeward.define('content/choreography', ['content/staging','content/mechanisms'], (Staging,Mechanisms) => {
  function score(scene,id,state,item,heroX) {
    const f=state.f,momLeft=Number.isFinite(heroX)&&heroX<579;
    const entries={
      0:{bird:{kind:'take',target:Staging.home.bird,approachX:980,pickup:true,prop:'letter',source:'homeBird'},lamp:{kind:'take',target:Staging.home.lampGrip,approachX:1178,pickup:true,prop:'lamp',source:'homeLamp'},mom:{kind:'receive',target:[momLeft?503:655,695],approachX:momLeft?434:724,pickup:true,prop:'scarf'}},
      5:{line:{kind:'take',target:[336,710],approachX:286,pickup:true,prop:'line',source:'gondolaLine',twoHands:true},brake:{kind:'turn',effect:'gondolaLift',target:[1029,633],radius:24,approachX:974}},
      6:{holder:{kind:'place',target:[782,643],place:true,prop:'shade',approachX:731},tone0:{kind:'reach',target:[468,685],approachX:426},tone1:{kind:'reach',target:[586,663],approachX:544},tone2:{kind:'reach',target:[704,685],approachX:662}},
      7:Object.fromEntries([...[['gearS',453,738],['gearM',612,740],['gearL',795,725]].map(([id,x,y])=>[id,{kind:'take',target:[x,y],approachX:x-48,pickup:true,prop:id,source:'pickup-'+id,twoHands:id!=='gearS'}]),...Mechanisms.gears.map(d=>[d.socket,{kind:'place',target:[d.x,d.y],place:true,prop:d.item,approachX:d.x-50}]),['lever',{kind:'pull',effect:'towerDoor',target:[1358,593],travel:35}]]),
      8:{felt:{kind:'take',target:[553,750],approachX:505,pickup:true,prop:'felt',source:'clockFelt'},bypass:{kind:'turn',effect:'clockBypass',from:f.bypassTurns||0,mounted:!!f.bypassMounted,prop:'crank',target:[440,650],radius:26},drive:{kind:'turn',effect:'clockDrive',prop:'fork',target:[662,650],radius:36},clapper:{kind:'climb',effect:'clockPad',target:[838,457],place:true,prop:'felt',accessY:617},frida:{kind:'gesture',target:[1242,650],approachX:1175},david:{kind:'gesture',target:[1048,655],approachX:968}},
      10:{trail0:{kind:item?'place':'turn',effect:item?'trailLight':'trailHood',node:0,prop:item||'lamp',target:[430,654],approachX:382},trail1:{kind:item?'place':'turn',effect:item?'trailLight':'trailHood',node:1,prop:item||'lamp',target:[731,612],approachX:682},trail2:{kind:item?'place':'turn',effect:item?'trailLight':'trailHood',node:2,prop:item||'lamp',target:[1025,626],approachX:978},child:{kind:'walk',effect:'ridgeReunite',target:[728,722],approachX:634,destinationX:960},alfur:{kind:'gesture',target:[812,682],approachX:762}},
      11:{mom:{kind:'gesture',target:[momLeft?503:655,622],approachX:momLeft?434:724},tea0:{kind:'pour',target:[726,629],approachX:669},tea1:{kind:'pour',target:[802,621],approachX:745},tea2:{kind:'pour',target:[878,629],approachX:936}},
      1:{awning:{kind:'pull',target:[962,620],travel:73,effect:'awning'},crank:{kind:'take',target:[850,624],prop:'crank',pickup:true,source:'northCrank'},
        wheel:{kind:'turn',target:[1169,653],radius:34,effect:'gate',from:f.gateTurns||0,mounted:!!f.crankMounted,prop:'crank'}},
      2:{rope:{kind:'crouch',target:[331,708],prop:'rope',pickup:true,source:'forestRope'},hook:{kind:f.branchBent?'take':'pull',target:[541,f.branchBent?620:688],effect:f.branchBent?'unhook':'branch',prop:f.branchBent?'hook':'rope',pickup:!!f.branchBent,source:'vineHook'},
        anchor:{kind:'throw',target:[1095,556],effect:'grapple',prop:'hook'},david:{kind:'gesture',target:[404,684]},
        winch:{kind:'turn',target:[481,651],radius:27,effect:'bridge'}},
      3:{ladderBrake:{kind:'crouch',target:[(f.ladderX??769)+82,777],effect:'ladderBrake',from:!!f.ladderBrake},book:{kind:'climb',effect:'archiveBook',target:[1170,342],ladder:f.ladderX??769}},
      9:{anchor:{kind:'tie',target:[426,652],effect:'roofAnchor',prop:'rope'},david:f.davidSafe?{kind:'gesture',effect:'roofBrace',target:[478,657]}:{kind:'haul',effect:'roofRescue',target:[487,672]},frida:{kind:'lever',effect:'roofLever',target:[1079,710],prop:'pole'},twig:{kind:'crouch',effect:'roofTwig',target:[902,730]},star:{kind:'reach',target:[1096,501]}},
      4:{intake:{kind:'turn',target:[350,682],radius:25,effect:'intake',from:f.intakeClosed?1:0},
        filter:{kind:'clear',target:[453,640],effect:'filter'},pipe0:{kind:'tool',target:[640,400],prop:'pole',effect:'pipe',node:0,from:state.valves[0]},
        pipe1:{kind:'turn',target:[640,570],radius:25,effect:'pipe',node:1,from:state.valves[1]},
        pipe2:{kind:'turn',target:[940,570],radius:25,effect:'pipe',node:2,from:state.valves[2]},
        prime:{kind:'pull',target:[1128,668],effect:'prime'}}
    };
    if(scene===5&&/^weight[123]$/.test(id)){
      const v=Number(id.at(-1)),on=state.weights.includes(v),target=Mechanisms.gondolaWeight(state,v,-53);
      return {kind:'place',effect:'gondolaWeight',weightValue:v,removing:on,target,approachX:target[0]-50,scene,id,item};
    }
    return {...(entries[scene]?.[id]??{kind:'reach',target:null}),scene,id,item};
  }
  function companion(scene,state,heroX) {
    if(scene===2&&!state.f.bridge) return {david:state.f.bridgeBrace?380:425,bracing:!!state.f.bridgeBrace};
    if(scene===2) return {david:heroX<235?heroX+145:Math.max(85,Math.min(1490,heroX-175))};
    if(scene===3) return {david:heroX<720?255:Math.max(555,Math.min(1320,heroX-175))};
    if(scene===4) return {david:heroX<265?365:heroX<355?165:225,frida:1255};
    if(scene===7) return {david:185};
    return {david:Math.max(85,Math.min(1490,heroX-175)),frida:Math.max(65,Math.min(1490,heroX-270))};
  }
  function obstaclesFor(scene,state,heroX) {
    const f=state.f,comp=companion(scene,state,heroX);
    if(scene===0) return [[579,116]];
    if(scene===1) return [[735,106]];
    if(scene===2) return [[comp.david,96]];
    if(scene===3) return [[418,90],[comp.david,92]];
    if(scene===4) return [[1255,104],[comp.david,92]];
    if(scene===5) return [[235,96],[1345,104]];
    if(scene===6) return [[245,96],[956,112],[1149,102]];
    if(scene===7) return [[185,92],[312,98]];
    if(scene===8) return [[1082,88],[1272,88]];
    if(scene===9) return [[!f.davidSafe?670:f.fridaSafe?980:f.roofBrace?1069:478,90],[f.fridaSafe?842:1160,92]];
    if(scene===10) return [[235,92],[358,92],[f.reunited?1188:682,102],[812,76]];
    if(scene===11) return [[375,98],[579,116],[1225,104]];
    return [];
  }
  function talkSpec(scene,id,state) {
    const f=state.f;
    if(scene===0&&id==='mom'&&(!f.letter||f.promise)) return {x:579,min:116,ideal:142,max:225};
    if(scene===1&&id==='david') return {x:735,min:106,ideal:128,max:205};
    if(scene===2&&id==='david') return {x:f.bridgeBrace?380:425,min:90,ideal:115,max:185};
    if(scene===3&&id==='alfur') return {x:418,min:90,ideal:114,max:185};
    if(scene===4&&id==='gauge') return {x:1255,min:104,ideal:135,max:200,leftOnly:true};
    if(scene===6&&id==='child') return {x:956,min:112,ideal:126,max:190,leftOnly:true};
    if(scene===6&&id==='frida') return {x:1149,min:100,ideal:118,max:185};
    if(scene===8&&id==='david') return {x:1082,min:88,ideal:110,max:175};
    if(scene===8&&id==='frida') return {x:1272,min:88,ideal:98,max:175};
    if(scene===9&&id==='david'&&(!f.roofAnchor||f.roofBrace)) return {x:!f.davidSafe?670:f.fridaSafe?980:1069,min:88,ideal:112,max:220};
    if(scene===9&&id==='frida'&&f.fridaSafe) return {x:842,min:88,ideal:108,max:175};
    if(scene===10&&id==='alfur') return {x:812,min:82,ideal:108,max:175};
    if(scene===10&&id==='child'&&(f.reunited||![0,1,2].every(i=>f['trail'+i]))) return {x:f.reunited?1188:682,min:96,ideal:114,max:185,leftOnly:true};
    if(scene===11&&id==='mom'&&f.hug) return {x:579,min:116,ideal:142,max:225};
    if(scene===11&&id==='friends') return {x:1225,min:104,ideal:132,max:205};
    return null;
  }
  function resolveApproach(scene,h,planned,state,heroX,limitFn=x=>x) {
    const spec=talkSpec(scene,h.id,state);
    if(!spec) return {approachX:planned.approachX??h.walkX??(h.kind==='take'?h.x-48:h.x),targetX:planned.target?.[0]??h.x};
    const others=obstaclesFor(scene,state,heroX).filter(([ox])=>Math.abs(ox-spec.x)>24);
    const clear=x=>Math.abs(limitFn(x)-x)<2&&others.every(([ox,r])=>Math.abs(x-ox)>=r);
    const unobstructed=x=>!others.some(([ox])=>ox>Math.min(x,spec.x)+18&&ox<Math.max(x,spec.x)-18);
    const d=Math.abs(heroX-spec.x);
    if(d>=spec.min&&d<=spec.max&&clear(heroX)&&unobstructed(heroX)&&(!spec.leftOnly||heroX<spec.x)){
      return {approachX:heroX,targetX:spec.x};
    }
    const left=limitFn(spec.x-spec.ideal),right=limitFn(spec.x+spec.ideal);
    const leftOK=Math.abs(left-spec.x)>=spec.min-8&&clear(left);
    const rightOK=!spec.leftOnly&&Math.abs(right-spec.x)>=spec.min-8&&clear(right);
    if(leftOK&&rightOK){
      return {approachX:Math.abs(heroX-left)<=Math.abs(heroX-right)?left:right,targetX:spec.x};
    }
    if(leftOK) return {approachX:left,targetX:spec.x};
    if(rightOK) return {approachX:right,targetX:spec.x};
    return {approachX:limitFn(planned.approachX??h.walkX??left),targetX:spec.x};
  }
  return {score,companion,resolveApproach};
});

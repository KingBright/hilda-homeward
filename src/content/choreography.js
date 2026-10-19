/** World-space contact points. Acting, mechanism motion and footprints share this score. */
Homeward.define('content/choreography', ['content/staging','content/mechanisms'], (Staging,Mechanisms) => {
  function score(scene,id,state,item) {
    const f=state.f;
    const entries={
      0:{bird:{kind:'take',target:Staging.home.bird,approachX:980,pickup:true,prop:'letter',source:'homeBird'},lamp:{kind:'take',target:Staging.home.lampGrip,approachX:1178,pickup:true,prop:'lamp',source:'homeLamp'},mom:{kind:'receive',target:[655,695],approachX:724,pickup:true,prop:'scarf'}},
      5:{line:{kind:'take',target:[336,710],approachX:286,pickup:true,prop:'line',source:'gondolaLine',twoHands:true},brake:{kind:'turn',effect:'gondolaLift',target:[1029,633],radius:24,approachX:974}},
      6:{holder:{kind:'place',target:[782,643],place:true,prop:'shade',approachX:731},tone0:{kind:'reach',target:[468,685],approachX:426},tone1:{kind:'reach',target:[586,663],approachX:544},tone2:{kind:'reach',target:[704,685],approachX:662}},
      7:Object.fromEntries([...[['gearS',453,738],['gearM',612,740],['gearL',795,725]].map(([id,x,y])=>[id,{kind:'take',target:[x,y],approachX:x-48,pickup:true,prop:id,source:'pickup-'+id,twoHands:id!=='gearS'}]),...Mechanisms.gears.map(d=>[d.socket,{kind:'place',target:[d.x,d.y],place:true,prop:d.item,approachX:d.x-50}]),['lever',{kind:'pull',effect:'towerDoor',target:[1358,593],travel:35}]]),
      8:{felt:{kind:'take',target:[553,750],approachX:505,pickup:true,prop:'felt',source:'clockFelt'},bypass:{kind:'turn',effect:'clockBypass',from:f.bypassTurns||0,mounted:!!f.bypassMounted,prop:'crank',target:[440,650],radius:26},drive:{kind:'turn',effect:'clockDrive',prop:'fork',target:[662,650],radius:36},clapper:{kind:'climb',effect:'clockPad',target:[838,457],place:true,prop:'felt',accessY:617},frida:{kind:'gesture',target:[1242,650],approachX:1182},david:{kind:'gesture',target:[1048,655],approachX:994}},
      10:{trail0:{kind:item?'place':'turn',effect:item?'trailLight':'trailHood',node:0,prop:item||'lamp',target:[430,654],approachX:382},trail1:{kind:item?'place':'turn',effect:item?'trailLight':'trailHood',node:1,prop:item||'lamp',target:[731,612],approachX:682},trail2:{kind:item?'place':'turn',effect:item?'trailLight':'trailHood',node:2,prop:item||'lamp',target:[1025,626],approachX:978},child:{kind:'walk',effect:'ridgeReunite',target:[728,722],approachX:634,destinationX:960},alfur:{kind:'gesture',target:[812,682],approachX:762}},
      11:{mom:{kind:'gesture',target:[655,622],approachX:724},tea0:{kind:'pour',target:[736,643],approachX:679},tea1:{kind:'pour',target:[826,633],approachX:765},tea2:{kind:'pour',target:[916,643],approachX:974}},
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
    return {david:Math.max(85,Math.min(1490,heroX-175)),frida:Math.max(65,Math.min(1490,heroX-270))};
  }
  return {score,companion};
});

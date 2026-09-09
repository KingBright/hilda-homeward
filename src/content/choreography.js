/** World-space contact points. Acting, mechanism motion and footprints share this score. */
Homeward.define('content/choreography', [], () => {
  function score(scene,id,state,item) {
    const f=state.f;
    const entries={
      1:{awning:{kind:'pull',target:[962,620],travel:73,effect:'awning'},crank:{kind:'take',target:[850,624],prop:'crank'},
        wheel:{kind:'turn',target:[1169,653],radius:34,effect:'gate',from:f.gateTurns||0,mounted:!!f.crankMounted,prop:'crank'}},
      2:{rope:{kind:'crouch',target:[331,725],prop:'rope'},hook:{kind:f.branchBent?'take':'pull',target:[534,f.branchBent?642:688],effect:f.branchBent?'unhook':'branch',prop:'rope'},
        anchor:{kind:'throw',target:[1095,556],effect:'grapple',prop:'hook'},david:{kind:'gesture',target:[404,684]},
        winch:{kind:'turn',target:[481,651],radius:27,effect:'bridge'}},
      3:{ladderBrake:{kind:'crouch',target:[(f.ladderX??769)+82,777],effect:'ladderBrake',from:!!f.ladderBrake},book:{kind:'climb',effect:'archiveBook',target:[1170,342],ladder:f.ladderX??769}},
      9:{anchor:{kind:'tie',target:[426,652],effect:'roofAnchor',prop:'rope'},david:f.davidSafe?{kind:'gesture',effect:'roofBrace',target:[466,657]}:{kind:'haul',effect:'roofRescue',target:[487,672]},frida:{kind:'lever',effect:'roofLever',target:[1079,710],prop:'pole'},twig:{kind:'crouch',effect:'roofTwig',target:[902,730]}},
      4:{intake:{kind:'turn',target:[350,682],radius:25,effect:'intake',from:f.intakeClosed?1:0},
        filter:{kind:'clear',target:[453,640],effect:'filter'},pipe0:{kind:'tool',target:[640,400],prop:'pole',effect:'pipe',node:0,from:state.valves[0]},
        pipe1:{kind:'turn',target:[640,570],radius:25,effect:'pipe',node:1,from:state.valves[1]},
        pipe2:{kind:'turn',target:[940,570],radius:25,effect:'pipe',node:2,from:state.valves[2]},
        prime:{kind:'pull',target:[1128,668],effect:'prime'}}
    };
    return {...(entries[scene]?.[id]??{kind:'reach',target:null}),scene,id,item};
  }
  function companion(scene,state,heroX) {
    if(scene===2&&!state.f.bridge) return {david:state.f.bridgeBrace?380:350,bracing:!!state.f.bridgeBrace};
    return {david:Math.max(85,Math.min(1490,heroX-175)),frida:Math.max(65,Math.min(1490,heroX-270))};
  }
  return {score,companion};
});

/** Original Homeward score, expressed in beats and MIDI pitches.
 * Eight-bar phrases share a returning-home motif; no random melody selection.
 * Music is presentation only: it never supplies or validates puzzle answers. */
Homeward.define('content/score', [], () => {
 const cueNames=['灯还亮着','雨夜出发','纸页与暗流','风暴中的手','清晨的归途'];
 const modes={
  hearth:{name:cueNames[0],bpm:72,root:48,scale:[0,2,4,5,7,9,11],chords:[[0,2,4],[3,5,0],[5,0,2],[4,6,1]],color:'harp'},
  trail:{name:cueNames[1],bpm:80,root:50,scale:[0,2,3,5,7,9,10],chords:[[0,2,4],[5,0,2],[3,5,0],[4,6,1]],color:'felt'},
  mystery:{name:cueNames[2],bpm:66,root:45,scale:[0,2,3,5,7,8,10],chords:[[0,2,4],[5,0,2],[3,5,0],[4,6,1]],color:'glass'},
  storm:{name:cueNames[3],bpm:92,root:50,scale:[0,2,3,5,7,9,10],chords:[[0,2,4],[3,5,0],[5,0,2],[4,6,1]],color:'felt'},
  dawn:{name:cueNames[4],bpm:70,root:50,scale:[0,2,4,5,7,9,11],chords:[[0,2,4],[5,0,2],[3,5,0],[0,2,4]],color:'harp'}
 };
 const sceneKeys=['hearth','trail','trail','mystery','mystery','trail','mystery','storm','mystery','storm','dawn','hearth'];
 // [beat, scale degree, duration] includes breathing spaces and a final cadence.
 const motif=[[[0,2,1],[1.5,4,.5],[2.5,5,1]],[[0,4,1.5],[2,2,1],[3.5,1,.5]],[[0,0,2],[2.5,1,.5],[3,2,.75]],[[0,4,2.5]],[[0,5,1],[1.5,7,.75],[3,6,.75]],[[0,4,1.5],[2,2,1]],[[0,1,1],[1.5,2,.5],[2.5,1,1]],[[0,0,3.5]]];
 const midi=(cue,degree,octave=0)=>cue.root+cue.scale[((degree%7)+7)%7]+12*(Math.floor(degree/7)+octave);
 function cueFor(scene,flags={}){
  let key=sceneKeys[scene]||'hearth';
  if(scene===9&&flags.beacon&&flags.davidSafe&&flags.fridaSafe)key='dawn';
  return {...modes[key],key};
 }
 function eventsForBar(cue,bar,intensity=0){
  if(!cue||!modes[cue.key]||!Number.isInteger(bar)||bar<0)throw Error('Invalid score position');
  const chord=cue.chords[Math.floor(bar/2)%cue.chords.length],out=[];
  const add=(beat,pitch,duration,voice,velocity,pan=0)=>out.push({beat,pitch,duration,voice,velocity,pan});
  add(0,midi(cue,chord[0],-1),3.6,'cello',.16,-.2);
  chord.forEach((d,i)=>add(.03*i,midi(cue,d,0),3.5,'pad',.07,(i-1)*.4));
  const arp=[0,1,2,1,0,2];
  arp.forEach((i,j)=>add(j*.5+.5,midi(cue,chord[i],1),.8,cue.color,.11,j%2?.28:-.28));
  motif[bar%8].forEach(([beat,d,len])=>add(beat,midi(cue,d,1),len,'woodwind',.14,.08));
  if(cue.key==='storm'){
   const count=intensity>.55?8:4;
   for(let i=0;i<count;i++)add(i*4/count,midi(cue,chord[0],-1),.22,'pulse',.06+Math.max(0,Math.min(1,intensity))*.05,0);
  }
  return out.sort((a,b)=>a.beat-b.beat);
 }
 const hz=pitch=>440*2**((pitch-69)/12);
 return {modes,motif,cueFor,eventsForBar,hz};
});

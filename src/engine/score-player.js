/** Audio-clock scheduling, phrase-aware layering and bounded voice ownership.
 * The renderer is also used by OfflineAudioContext acceptance tests. */
Homeward.define('engine/score-player', ['content/score'], (Score) => {
 const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
 function createRoom(ctx,destination){
  const input=ctx.createConvolver(),wet=ctx.createGain(),length=Math.floor(ctx.sampleRate*1.4),buffer=ctx.createBuffer(2,length,ctx.sampleRate);
  let seed=9173;
  for(let channel=0;channel<2;channel++){
   const d=buffer.getChannelData(channel);
   for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const t=i/ctx.sampleRate;d[i]=t<.025?0:(seed/2147483648-1)*Math.exp(-t*5.2);}
  }
  input.buffer=buffer;wet.gain.value=.16;input.connect(wet);wet.connect(destination);
  return {input,dispose(){input.disconnect();wet.disconnect();}};
 }

 function renderNote(ctx,destination,event,start,secondsPerBeat,ended=()=>{}){
  const f=Score.hz(event.pitch),duration=event.duration*secondsPerBeat;
  const isPad=event.voice==='pad'||event.voice==='cello',bell=event.voice==='glass',wind=event.voice==='woodwind';
  const gain=ctx.createGain(),pan=ctx.createStereoPanner(),filter=ctx.createBiquadFilter();
  filter.type='lowpass';filter.frequency.value=isPad?1400:wind?2600:4600;
  pan.pan.value=cap(event.pan,-.8,.8);gain.connect(filter);filter.connect(pan);pan.connect(destination);
  const amp=event.velocity,attack=isPad?.22:wind?.065:.009,tail=isPad?.7:bell?.9:.28,end=start+duration+tail;
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(amp,start+Math.min(attack,duration*.35));
  if(isPad||wind){gain.gain.setTargetAtTime(amp*.65,start+attack,.18);gain.gain.setTargetAtTime(.0001,start+duration,tail/4);}
  else gain.gain.exponentialRampToValueAtTime(.0001,end);
  const partials=isPad?[[1,.7],[2,.13],[3,.045]]:wind?[[1,.78],[2,.09]]:bell?[[1,.62],[2.01,.16],[3.99,.045]]:[[1,.67],[2,.18],[3,.055]];
  const oscillators=partials.map(([ratio,level])=>{
   const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f*ratio;g.gain.value=level;
   o.connect(g);g.connect(gain);o.start(start);o.stop(end+.08);return {o,g};
  });
  let remaining=oscillators.length,closed=false;
  const dispose=()=>{if(closed)return;closed=true;oscillators.forEach(({o,g})=>{o.disconnect();g.disconnect();});gain.disconnect();filter.disconnect();pan.disconnect();ended();};
  oscillators.forEach(({o})=>o.onended=()=>{if(--remaining===0)dispose();});
  return {end,stop(at=ctx.currentTime){if(closed)return;const t=Math.max(at,ctx.currentTime);gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(.0001,t,.018);oscillators.forEach(({o})=>{try{o.stop(t+.12);}catch{}});}};
 }
 class ScorePlayer{
  constructor(ctx,destination){this.ctx=ctx;this.destination=destination;this.cue=null;this.bus=null;this.voices=new Set();this.bar=0;this.nextTime=0;this.timer=null;this.intensity=0;this.pending=[];this.scheduled=0;}
  select(cue){
   if(this.cue?.key===cue.key){this.resume();return;}
   const old=this.bus,now=this.ctx.currentTime;
   if(old){old.gain.cancelScheduledValues(now);old.gain.setTargetAtTime(0,now,.3);for(const voice of this.voices)voice.stop(now+.85);}
   this.cue=cue;this.bar=0;this.pending=[];this.nextTime=now+.08;
   this.bus=this.ctx.createGain();this.bus.gain.setValueAtTime(0,now);this.bus.gain.linearRampToValueAtTime(1,now+1.2);this.bus.connect(this.destination);
   if(old){const timer=setTimeout(()=>{old.disconnect();this.retired?.delete(timer);},1800);(this.retired??=new Set()).add(timer);}
   this.resume();
  }
  resume(){if(!this.cue||this.timer)return;if(this.nextTime<this.ctx.currentTime){this.nextTime=this.ctx.currentTime+.08;this.pending=[];}this.timer=setInterval(()=>this.schedule(),60);this.schedule();}
  pause(){clearInterval(this.timer);this.timer=null;}
  schedule(){
   if(this.ctx.state!=='running'||!this.cue||!this.bus)return;
   const now=this.ctx.currentTime,horizon=now+.18,spb=60/this.cue.bpm;
   if(this.nextTime<now-.3&&!this.pending.length)this.nextTime=now+.05;
   if(!this.pending.length&&this.nextTime<=horizon){
    this.pending=Score.eventsForBar(this.cue,this.bar++,this.intensity).map(event=>({event,time:this.nextTime+event.beat*spb}));this.nextTime+=4*spb;
   }
   while(this.pending.length&&this.pending[0].time<=horizon){
    const {event,time}=this.pending.shift();if(time<now-.08)continue;
    if(this.voices.size>=72)continue;
    let handle;handle=renderNote(this.ctx,this.bus,event,Math.max(time,now+.002),spb,()=>this.voices.delete(handle));this.voices.add(handle);this.scheduled++;
   }
  }
  dispose(){this.pause();for(const voice of this.voices)voice.stop();this.pending=[];if(this.bus)this.bus.gain.setTargetAtTime(0,this.ctx.currentTime,.02);for(const timer of this.retired||[])clearTimeout(timer);this.retired?.clear();}
  debug(){return {cue:this.cue?.key,name:this.cue?.name,bar:this.bar,voices:this.voices.size,scheduled:this.scheduled,running:!!this.timer};}
 }
 return {ScorePlayer,renderNote,createRoom};
});

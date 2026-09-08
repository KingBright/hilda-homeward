Homeward.define("engine/audio", [], () => {
class Soundscape{
 constructor(settings=()=>({sound:true})){
  this.settings=settings;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  this.ctx=new AudioCtx();
  this.master=this.ctx.createGain();
  this.master.gain.value=0.16;
  this.master.connect(this.ctx.destination);
  this.ambMaster=this.ctx.createGain();
  this.ambMaster.gain.value=0.75;
  this.ambMaster.connect(this.master);
  this.bgmMaster=this.ctx.createGain();
  this.bgmMaster.gain.value=0.85;
  this.bgmMaster.connect(this.master);
  this.sfxMaster=this.ctx.createGain();
  this.sfxMaster.gain.value=1.0;
  this.sfxMaster.connect(this.master);
  this.ambient=-1;
  this.bgmTimer=null;
  this.tickTimer=null;
  this.seqIndex=0;
  this.initNoise();
  this.initAmbienceGraph();
 }
 async resume(){if(this.ctx.state==='suspended')await this.ctx.resume();}
 initNoise(){
  try{
   const len=this.ctx.sampleRate*3;
   this.noiseBuf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
   const d=this.noiseBuf.getChannelData(0);
   let b0=0,b1=0,b2=0;
   for(let i=0;i<len;i++){
    const white=Math.random()*2-1;
    b0=0.99886*b0+white*0.0555179;b1=0.99332*b1+white*0.0750759;b2=0.96900*b2+white*0.1538520;
    d[i]=(b0+b1+b2+white*0.5362)*0.18;
   }
  }catch{this.noiseBuf=null;}
 }
 initAmbienceGraph(){
  if(!this.noiseBuf)return;
  try{
   this.noiseSrc=this.ctx.createBufferSource();
   this.noiseSrc.buffer=this.noiseBuf;
   this.noiseSrc.loop=true;
   this.windFilter=this.ctx.createBiquadFilter();
   this.windFilter.type='bandpass';this.windFilter.frequency.value=320;this.windFilter.Q.value=2.2;
   this.windLfo=this.ctx.createOscillator();this.windLfo.frequency.value=0.18;
   this.windLfoGain=this.ctx.createGain();this.windLfoGain.gain.value=180;
   this.windLfo.connect(this.windLfoGain);this.windLfoGain.connect(this.windFilter.frequency);
   this.windLfo.start();
   this.windGain=this.ctx.createGain();this.windGain.gain.value=0;
   this.windFilter.connect(this.windGain);this.windGain.connect(this.ambMaster);
   this.rainFilter=this.ctx.createBiquadFilter();this.rainFilter.type='highpass';this.rainFilter.frequency.value=1400;
   this.rainGain=this.ctx.createGain();this.rainGain.gain.value=0;
   this.rainFilter.connect(this.rainGain);this.rainGain.connect(this.ambMaster);
   this.streamFilter=this.ctx.createBiquadFilter();this.streamFilter.type='bandpass';this.streamFilter.frequency.value=680;this.streamFilter.Q.value=3.5;
   this.streamGain=this.ctx.createGain();this.streamGain.gain.value=0;
   this.streamFilter.connect(this.streamGain);this.streamGain.connect(this.ambMaster);
   this.fireFilter=this.ctx.createBiquadFilter();this.fireFilter.type='lowpass';this.fireFilter.frequency.value=260;
   this.fireGain=this.ctx.createGain();this.fireGain.gain.value=0;
   this.fireFilter.connect(this.fireGain);this.fireGain.connect(this.ambMaster);
   this.noiseSrc.connect(this.windFilter);this.noiseSrc.connect(this.rainFilter);
   this.noiseSrc.connect(this.streamFilter);this.noiseSrc.connect(this.fireFilter);
   this.noiseSrc.start();
  }catch(e){console.warn('Ambience init error',e);}
 }
 scene(n){
  if(this.ambient===n)return;
  this.ambient=n;
  const now=this.ctx.currentTime;
  const AMB=[
   {wind:0,rain:0,stream:0,fire:0.16},
   {wind:0.08,rain:0.15,stream:0,fire:0},
   {wind:0.06,rain:0.08,stream:0.18,fire:0},
   {wind:0.03,rain:0.02,stream:0,fire:0},
   {wind:0,rain:0,stream:0.22,fire:0},
   {wind:0.15,rain:0,stream:0,fire:0},
   {wind:0.20,rain:0,stream:0.04,fire:0},
   {wind:0.24,rain:0.26,stream:0,fire:0},
   {wind:0,rain:0,stream:0.08,fire:0},
   {wind:0.32,rain:0.32,stream:0,fire:0},
   {wind:0.14,rain:0,stream:0,fire:0},
   {wind:0,rain:0,stream:0,fire:0.16}
  ][n]||{wind:0.05,rain:0,stream:0,fire:0};
  if(this.windGain){
   this.windGain.gain.setTargetAtTime(AMB.wind,now,0.8);
   this.rainGain.gain.setTargetAtTime(AMB.rain,now,0.8);
   this.streamGain.gain.setTargetAtTime(AMB.stream,now,0.8);
   this.fireGain.gain.setTargetAtTime(AMB.fire,now,0.8);
  }
  clearInterval(this.tickTimer);
  if(n===8){
   this.tickTimer=setInterval(()=>{
    if(this.settings().sound&&this.ctx.state==='running'&&!document.hidden)this.clockTick();
   },1000);
  }
  this.startBGM(n);
 }
 clockTick(){
  try{
   const now=this.ctx.currentTime;
   const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
   osc.type='triangle';osc.frequency.setValueAtTime(1400,now);
   osc.frequency.exponentialRampToValueAtTime(180,now+0.018);
   gain.gain.setValueAtTime(0.06,now);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.018);
   osc.connect(gain);gain.connect(this.ambMaster);
   osc.start(now);osc.stop(now+0.02);
  }catch{}
 }
 startBGM(n){
  if(this.bgmTimer){clearTimeout(this.bgmTimer);this.bgmTimer=null;}
  this.seqIndex=0;
  this.scheduleNextNote(n);
 }
 scheduleNextNote(n){
  if(this.ambient!==n||!this.settings().sound)return;
  const N={
   C3:130.81,D3:146.83,Eb3:155.56,E3:164.81,F3:174.61,G3:196.00,A3:220.00,Bb3:233.08,B3:246.94,
   C4:261.63,D4:293.66,Eb4:311.13,E4:329.63,F4:349.23,Fs4:369.99,G4:392.00,Ab4:415.30,A4:440.00,Bb4:466.16,B4:493.88,
   C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880.00,B5:987.77,C6:1046.50
  };
  const THEMES=[
   {scale:[N.C4,N.E4,N.G4,N.A4,N.C5,N.E5],bass:N.C3,step:0.56,type:'triangle',vol:0.08,decay:0.7},
   {scale:[N.D4,N.F4,N.G4,N.A4,N.C5,N.D5],bass:N.D3,step:0.68,type:'sine',vol:0.07,decay:1.0},
   {scale:[N.F4,N.G4,N.A4,N.C5,N.D5,N.G5],bass:N.F3,step:0.48,type:'triangle',vol:0.09,decay:0.65},
   {scale:[N.A3,N.C4,N.E4,N.G4,N.A4,N.C5],bass:N.A3,step:0.62,type:'sine',vol:0.07,decay:0.9},
   {scale:[N.E3,N.G3,N.B3,N.D4,N.E4],bass:N.E3,step:0.46,type:'triangle',vol:0.09,decay:0.5},
   {scale:[N.G3,N.B3,N.D4,N.G4,N.B4],bass:N.G3,step:0.72,type:'sine',vol:0.07,decay:1.2},
   {scale:[N.C3,N.Eb3,N.G3,N.Bb3,N.Eb4],bass:N.C3,step:0.84,type:'sine',vol:0.10,decay:1.4},
   {scale:[N.D4,N.F4,N.A4,N.C5,N.D5],bass:N.D3,step:0.42,type:'triangle',vol:0.09,decay:0.5},
   {scale:[N.A3,N.C4,N.E4,N.A4,N.E5],bass:N.A3,step:0.38,type:'triangle',vol:0.08,decay:0.35},
   {scale:[N.B3,N.D4,N.Fs4,N.A4,N.B4],bass:N.B3,step:0.34,type:'triangle',vol:0.10,decay:0.38},
   {scale:[N.D4,N.Fs4,N.A4,N.B4,N.D5,N.Fs5],bass:N.D3,step:0.56,type:'sine',vol:0.09,decay:0.9},
   {scale:[N.C4,N.E4,N.G4,N.A4,N.C5,N.E5],bass:N.C3,step:0.52,type:'triangle',vol:0.09,decay:0.75}
  ];
  const theme=THEMES[n]||THEMES[0];
  if(this.seqIndex%4===0)this.playSynthNote(theme.bass,theme.decay*1.5,'sine',theme.vol*0.9);
  if(Math.random()<0.75){
   const idx=Math.floor(Math.random()*theme.scale.length);
   this.playSynthNote(theme.scale[idx],theme.decay,theme.type,theme.vol);
  }
  this.seqIndex++;
  this.bgmTimer=setTimeout(()=>this.scheduleNextNote(n),theme.step*1000);
 }
 playSynthNote(freq,dur=0.6,type='sine',vol=0.1){
  try{
   if(this.ctx.state!=='running')return;
   const now=this.ctx.currentTime;
   const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
   osc.type=type;osc.frequency.setValueAtTime(freq,now);
   gain.gain.setValueAtTime(0.001,now);
   gain.gain.linearRampToValueAtTime(vol,now+0.015);
   gain.gain.exponentialRampToValueAtTime(0.0001,now+dur);
   osc.connect(gain);gain.connect(this.bgmMaster);
   osc.start(now);osc.stop(now+dur+0.05);
   osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch{}};
  }catch{}
 }
 speechBlip(who){
  try{
   if(this.ctx.state!=='running')return;
   const now=this.ctx.currentTime;
   const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
   let freq=560,type='triangle',dur=0.026,slide=null;
   if(who==='希尔达'){freq=560+(Math.random()*40-20);type='triangle';}
   else if(who==='妈妈'){freq=230+(Math.random()*20-10);type='sine';dur=0.038;}
   else if(who==='大卫'){freq=390+(Math.random()*30-15);type='triangle';}
   else if(who==='芙丽达'){freq=490+(Math.random()*25-12);type='sine';}
   else if(who==='枝枝'){freq=760;slide=860;type='sine';dur=0.032;}
   else if(who==='阿尔弗'){freq=660+(Math.random()*50);type='triangle';dur=0.022;}
   else if(who?.includes('巨魔')){freq=120+(Math.random()*15);type='sine';dur=0.045;}
   else{freq=440+(Math.random()*30);type='sine';}
   osc.type=type;osc.frequency.setValueAtTime(freq,now);
   if(slide)osc.frequency.exponentialRampToValueAtTime(slide,now+dur);
   gain.gain.setValueAtTime(0.001,now);
   gain.gain.linearRampToValueAtTime(0.08,now+0.005);
   gain.gain.exponentialRampToValueAtTime(0.0001,now+dur);
   osc.connect(gain);gain.connect(this.sfxMaster);
   osc.start(now);osc.stop(now+dur+0.01);
   osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch{}};
  }catch{}
 }
 note(freq,d=.34,when=0,vol=.18){
  try{
   const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();
   o.type='sine';o.frequency.value=freq;
   g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);
   g.gain.exponentialRampToValueAtTime(.001,t+d);
   o.connect(g);g.connect(this.sfxMaster);
   o.start(t);o.stop(t+d+.03);
   o.onended=()=>{try{o.disconnect();g.disconnect();}catch{}};
  }catch{}
 }
 effect(kind){
  const table={metal:[311.13,466.16],warm:[261.63,329.63,392,523.25],rope:[146.83,196],wood:[164.81,220],water:[392,293.66,196]};
  (table[kind]||table.wood).forEach((f,i)=>this.note(f,.3,i*.1,.21));
 }
}

return Soundscape;
});

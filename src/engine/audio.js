/** Original synthesized score and procedural ambience. User gesture opt-in only.
 * Music, environment, effects and dialogue each have an independent gain bus. */
Homeward.define('engine/audio', ['content/score','engine/score-player'], (Score,{ScorePlayer,createRoom}) => {
 const volumes={musicVolume:.72,ambienceVolume:.65,effectsVolume:.8,voiceVolume:.32};
 class Soundscape{
  constructor(settings=()=>({sound:false})){
   this.settings=settings;this.ambient=-1;this.contextState={};this.effectNodes=new Set();this.lastBlip=-1;this.lastMix='';this.closed=false;
   const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw Error('Web Audio is unavailable');
   this.ctx=new AudioCtx();this.master=this.ctx.createGain();this.master.gain.value=0;
   this.limiter=this.ctx.createDynamicsCompressor();this.limiter.threshold.value=-9;this.limiter.knee.value=9;this.limiter.ratio.value=5;this.limiter.attack.value=.004;this.limiter.release.value=.22;
   this.master.connect(this.limiter);this.limiter.connect(this.ctx.destination);
   for(const name of ['bgmMaster','ambMaster','sfxMaster','voiceMaster']){this[name]=this.ctx.createGain();this[name].connect(this.master);}
   this.room=createRoom(this.ctx,this.master);this.bgmMaster.connect(this.room.input);
   this.player=new ScorePlayer(this.ctx,this.bgmMaster);
   this.initAmbience();
  }
  async resume(){
   if(this.closed||!this.settings().sound||document.hidden)return;
   await this.ctx.resume();
   // Re-check after the asynchronous browser permission/resume boundary.
   if(!this.settings().sound||document.hidden){await this.ctx.suspend();return;}
   this.lastMix='';this.update(this.contextState);this.player.resume();
  }
  pause(){this.player.pause();this.ctx.suspend().catch(()=>{});}
  scene(n){this.ambient=n;this.update(this.contextState);}
  update(state={}){
   this.contextState=state;if(this.closed)return;
   const settings=this.settings(),now=this.ctx.currentTime;
   const volume=k=>Number.isFinite(settings[k])?Math.max(0,Math.min(1,settings[k])):volumes[k];
   const key=JSON.stringify([settings.sound,...Object.keys(volumes).map(volume),!!state.dialogue,!!state.menu,this.ambient]);
   if(key!==this.lastMix){
    this.lastMix=key;
    this.master.gain.setTargetAtTime(settings.sound?.32:0,now,.06);
    this.bgmMaster.gain.setTargetAtTime(volume('musicVolume')*(state.dialogue?.4:state.menu?.55:1),now,.16);
    this.ambMaster.gain.setTargetAtTime(volume('ambienceVolume')*(state.menu?.55:1),now,.22);
    this.sfxMaster.gain.setTargetAtTime(volume('effectsVolume'),now,.03);this.voiceMaster.gain.setTargetAtTime(volume('voiceVolume'),now,.03);
    const rain=[1,2,7,9].includes(this.ambient),outside=[1,2,5,6,7,9,10].includes(this.ambient),water=[2,4,8].includes(this.ambient);
    this.rain.gain.setTargetAtTime(rain?(this.ambient===9?.16:.075):0,now,.8);
    this.wind.gain.setTargetAtTime(outside?(this.ambient===9?.21:.07):0,now,1.1);
    this.water.gain.setTargetAtTime(water?.13:0,now,.8);
    this.hearth.gain.setTargetAtTime([0,11].includes(this.ambient)?.07:0,now,.8);
   }
   if(settings.sound&&this.ambient>=0){this.player.intensity=Math.max(0,Math.min(1,state.danger||0));this.player.select(Score.cueFor(this.ambient,state.flags||{}));}
  }
  initAmbience(){
   const ctx=this.ctx,buf=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),d=buf.getChannelData(0);let seed=0x1234abcd,brown=0;
   // Deterministic noise bed, independent of the musical note sequence.
   for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;brown=(brown+.025*white)/1.025;d[i]=white*.2+brown*1.8;}
   this.noise=ctx.createBufferSource();this.noise.buffer=buf;this.noise.loop=true;
   this.ambientNodes=[];
   for(const [name,type,freq,q] of [['rain','highpass',1900,.7],['wind','lowpass',420,.6],['water','bandpass',840,.8],['hearth','lowpass',160,.7]]){
    const filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type=type;filter.frequency.value=freq;filter.Q.value=q;gain.gain.value=0;
    this.noise.connect(filter);filter.connect(gain);gain.connect(this.ambMaster);this[name]=gain;this.ambientNodes.push(filter,gain);
   }
   this.noise.start();
  }
  note(freq,d=.34,when=0,vol=.18,bus=this.sfxMaster){
   if(this.ctx.state!=='running'||!this.settings().sound||document.hidden||this.effectNodes.size>=32)return;
   const t=this.ctx.currentTime+Math.max(0,when),o=this.ctx.createOscillator(),g=this.ctx.createGain();
   o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.04,d));
   o.connect(g);g.connect(bus);this.effectNodes.add(o);o.start(t);o.stop(t+d+.04);
   o.onended=()=>{o.disconnect();g.disconnect();this.effectNodes.delete(o);};
  }
  noiseHit(kind){
   if(this.ctx.state!=='running'||!this.settings().sound||document.hidden||this.effectNodes.size>=32)return;
   const now=this.ctx.currentTime,src=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();src.buffer=this.noise.buffer;
   filter.type='bandpass';filter.frequency.value={wood:530,metal:1700,rope:950,water:2400}[kind]||750;filter.Q.value=kind==='metal'?5:.65;
   const d=kind==='rope'?.38:kind==='water'?.45:.14;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.32,now+.009);gain.gain.exponentialRampToValueAtTime(.0001,now+d);
   src.connect(filter);filter.connect(gain);gain.connect(this.sfxMaster);src.start(now);src.stop(now+d+.03);this.effectNodes.add(src);
   src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();this.effectNodes.delete(src);};
  }
  effect(kind){
   if(kind==='warm'){[392,493.88,587.33].forEach((f,i)=>this.note(f,.55,i*.12,.13));return;}
   this.noiseHit(kind);if(kind==='metal')this.note(680,.34,0,.08);else if(kind==='wood')this.note(180,.08,0,.09);
  }
  speechBlip(who){
   const now=this.ctx.currentTime;if(now-this.lastBlip<.095)return;this.lastBlip=now;
   const f={'希尔达':480,'大卫':330,'芙丽达':430,'妈妈':250,'阿尔弗':650,'枝枝':780}[who]||(who?.includes('巨魔')?125:380);
   this.note(f,.035,0,.12,this.voiceMaster);
  }
  debug(){return {context:this.ctx.state,scene:this.ambient,mix:this.master.gain.value,musicGain:this.bgmMaster.gain.value,ambienceGain:this.ambMaster.gain.value,effectsGain:this.sfxMaster.gain.value,voiceGain:this.voiceMaster.gain.value,voices:this.effectNodes.size,score:this.player.debug()};}
  async dispose(){if(this.closed)return;this.closed=true;this.player.dispose();this.room.dispose();for(const node of this.effectNodes){try{node.stop();}catch{}}this.noise.stop();this.noise.disconnect();this.ambientNodes.forEach(n=>n.disconnect());await this.ctx.close();}
 }
 return Soundscape;
});

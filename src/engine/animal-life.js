/** Presentation-only companion steering and planted-foot quadruped motion.
 * No timers, random calls, inventory or story mutations. Time advances only explicitly.
 */
Homeward.define('engine/animal-life', ['engine/kinematics'], ({solve}) => {
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const pulse=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
  const hips=Object.freeze([[-22,-28],[-29,-29],[12,-27],[20,-28]].map(Object.freeze));
  const terrain=(x,scale,ground)=>Math.atan2(ground(x+12*scale)-ground(x-12*scale),24*scale);
  class Follower {
    constructor(x=0,face=1){this.reset(x,face);}
    reset(x,face=1){if(!Number.isFinite(x))throw new TypeError('Invalid companion position');this.revision=(this.revision??0)+1;this.x=x;this.v=0;this.face=face<0?-1:1;this.side=this.face;this.turn=0;this.toFace=this.face;this.idle=0;this.distance=0;this.target=x;return this;}
    update(target,dt,{paused=false,reduced=false}={}){
      if(!Number.isFinite(target)||!Number.isFinite(dt)||dt<0)throw new TypeError('Invalid follow input');
      if(paused||dt===0)return this;
      this.target=target;
      // Small integration steps make acceleration and braking insensitive to frame rate.
      let remaining=Math.min(dt,.1);
      while(remaining>1e-8){const h=Math.min(remaining,1/120);remaining-=h;
        const error=target-this.x,desiredFace=error<0?-1:1;
        if(this.turn>0){this.turn=Math.max(0,this.turn-h);this.v=0;if(this.turn===0)this.face=this.toFace;continue;}
        if(Math.abs(error)>7&&desiredFace!==this.face&&Math.abs(this.v)<8){this.toFace=desiredFace;if(reduced)this.face=desiredFace;else {this.turn=.24;this.v=0;continue;}}
        const desired=Math.abs(error)<2?0:Math.sign(error)*Math.min(410,Math.abs(error)*4,Math.sqrt(2*800*Math.max(0,Math.abs(error)-1)));
        const limit=Math.abs(desired)<Math.abs(this.v)||desired*this.v<0?1000:780;
        this.v+=clamp(desired-this.v,-limit*h,limit*h);
        const step=this.v*h;
        if(Math.abs(error)<2&&Math.abs(this.v)<5){this.v=0;}
        else {this.x+=step;this.distance+=Math.abs(step);}
      }
      this.idle=Math.abs(this.v)<3&&this.turn===0?this.idle+Math.min(dt,.1):0;
      return this;
    }
    snapshot(){return {revision:this.revision,x:this.x,speed:this.v,face:this.face,turn:this.turn,idle:this.idle,distance:this.distance,target:this.target};}
  }
  class Feet {
    constructor(){this.ready=false;}
    reset(x,y,scale,face,ground){
      this.x=x;this.y=y;this.scale=scale;this.face=face;this.cooldown=0;this.next=0;
      const width=Math.cos(terrain(x,scale,ground));
      this.feet=hips.map(([hx])=>{const px=x-hx*width*scale*face;return {x:px,y:ground(px),from:px,to:px,phase:1,duration:.18,contact:0};});this.ready=true;
    }
    update(input){
      const {x,y,scale=1,face=1,dt=0,ground=()=>y}=input;
      if(![x,y,scale,face,dt].every(Number.isFinite)||scale<=0||dt<0)throw new TypeError('Invalid animal pose');
      if(!this.ready||Math.abs(x-this.x)>150||Math.abs(y-this.y)>110||Math.abs(scale-this.scale)>.001)this.reset(x,y,scale,face,ground);
      // The two sides exchange fore/hind silhouettes during the stopped side turn.
      // Keep the existing world contacts rather than teleporting four hooves.
      if(face!==this.face){this.feet=[this.feet[2],this.feet[3],this.feet[0],this.feet[1]];this.face=face;this.next=0;}
      const oldX=this.x,oldY=this.y,n=Math.max(1,Math.ceil(Math.min(dt,.1)*120));
      for(let i=1;i<=n;i++)this.advance({...input,x:mix(oldX,x,i/n),y:mix(oldY,y,i/n),dt:Math.min(dt,.1)/n});
      return this.feet;
    }
    advance({x,y,scale=1,face=1,dt=0,speed=0,reduced=false,airborne=false,ground=()=>y}){
      if(![x,y,scale,face,dt,speed].every(Number.isFinite)||scale<=0||dt<0)throw new TypeError('Invalid animal pose');
      if(!this.ready||Math.abs(x-this.x)>150||Math.abs(y-this.y)>110||Math.abs(scale-this.scale)>.001)this.reset(x,y,scale,face,ground);
      this.x=x;this.y=y;this.scale=scale;this.face=face;
      const h=Math.min(dt,.1);this.cooldown=Math.max(0,this.cooldown-h);
      if(reduced||airborne){this.reset(x,y,scale,face,ground);return this.feet;}
      for(const f of this.feet)if(f.phase<1){f.phase=Math.min(1,f.phase+h/f.duration);f.x=mix(f.from,f.to,smooth(f.phase));f.y=ground(f.x)-Math.sin(f.phase*Math.PI)*8*scale;}
      const moving=Math.abs(speed)>5,active=this.feet.filter(f=>f.phase<1).length;
      if(this.cooldown===0&&active===0&&h>0){
        const width=Math.cos(terrain(x,scale,ground));
        const lag=i=>(x-hips[i][0]*width*scale*face-this.feet[i].x)*(moving?Math.sign(speed):1);
        const trot=Math.abs(speed)/scale>55;
        const threshold=moving?(trot?6:4.5)*scale*width:1.6*scale;
        const candidates=this.feet.map((_,i)=>i).filter(i=>moving?lag(i)>threshold:Math.abs(lag(i))>threshold);
        if(candidates.length){
          const groups=trot?[[0,3],[1,2]]:[[2],[0],[3],[1]];
          let group=groups[this.next%groups.length];
          if(!group.some(i=>candidates.includes(i)))group=groups.find(g=>g.some(i=>candidates.includes(i)));
          this.next=groups.indexOf(group)+1;
          const duration=moving?clamp((trot?11:5)*scale*width/Math.max(20,Math.abs(speed)),.016,.17):.18;
          for(const i of group){const f=this.feet[i];f.from=f.x;f.to=x-hips[i][0]*width*scale*face+speed*duration*.88;f.phase=0;f.duration=duration;f.contact++;}
          this.cooldown=duration*.4;
        }
      }
      return this.feet;
    }
  }
  function secondary({time=0,idle=0,speed=0,turn=0,attentive=false,airborne=false,reduced=false,seed=0}={}){
    if(![time,idle,speed,turn,seed].every(Number.isFinite))throw new TypeError('Invalid animal clock');
    if(reduced)return {head:0,headY:0,bodyY:0,bodyAngle:0,earA:0,earB:0,tail:0,blink:1,mode:'still',turnWidth:1};
    const t=Math.max(0,time)+seed,cycle=(t%17.3+17.3)%17.3;
    const quiet=idle>1.4&&!attentive&&!airborne,sniff=quiet?pulse(cycle,3,4,5.2,6):0;
    const listen=quiet?pulse(cycle,10,10.4,11.5,12.5):0;
    const fidget=pulse((t+2.3)%7.7,3.1,3.18,3.22,3.36);
    const running=Math.min(1,Math.abs(speed)/260);
    const blinkTime=t%5.7,blink=1-.93*pulse(blinkTime,5.22,5.28,5.34,5.42);
    return {head:-sniff*25+listen*9+(attentive?-6:0)+Math.sin(t*2.2)*.65,
      headY:sniff*8,bodyY:sniff*1.2+Math.sin(t*2.1)*.45-running*Math.abs(Math.sin(t*8))*.8,
      bodyAngle:clamp(speed/160,-2,2),earA:fidget*15-listen*12+Math.sin(t*2.8)*1.4,
      earB:-fidget*9+listen*15+Math.sin(t*2.2+1.7)*1.2,
      tail:Math.sin(t*(2.3+running*2.2))*(2+running*6)+(attentive?7:0)-sniff*4,
      blink,mode:airborne?'carried':turn>0?'turning':running>.35?'trot':Math.abs(speed)>5?'walk':sniff>.1?'sniff':listen>.1?'listen':attentive?'attend':'rest',
      turnWidth:turn>0?1-.35*Math.sin((1-turn/.24)*Math.PI):1};
  }
  function pose(feet,{x,y,scale,face,secondary:s,airborne=false,ground=()=>y}){
    const angle=airborne?0:-face*terrain(x,scale,ground),cos=Math.cos(angle),sin=Math.sin(angle);
    return hips.map(([hx,hy],i)=>{
      const origin=[hx*cos-hy*sin,hx*sin+hy*cos+s.bodyY];
      const end=airborne?[hx+(i<2?-6:4),-12]:[(feet[i].x-x)/(-face*scale),(feet[i].y-y)/scale];
      const result=solve(origin,end,19,20,i<2?-1:1);
      return {origin,...result,planted:!airborne&&feet[i].phase===1};
    });
  }
  return {Follower,Feet,secondary,pose,hips,terrain};
});

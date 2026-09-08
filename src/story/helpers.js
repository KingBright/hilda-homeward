Homeward.define("story/helpers", ["content/catalog", "engine/hydraulics", "content/mechanisms"], ({items}, Hydraulics, Mechanisms) => {
const H=(id,label,x,y,w,h,extra={})=>({id,label,x,y,w,h,...extra});
const I=(id,label,x,y,w=58,h=66,extra={})=>H(id,label,x,y,w,h,{kind:'take',...extra});
const exit=(id,label,x,y,extra={})=>H(id,label,x,y,94,168,{kind:'exit',...extra});
const f=(g,k)=>!!g.s.f[k];
const say=(g,lines,after)=>g.say(lines,after);
const one=(g,who,line)=>say(g,[[who,line]]);
const wrong=(g)=>g.toast('这两样暂时还派不上用场。试着先观察机关本身。');
const set=(g,k,val=true)=>g.set(k,val);
const need=(g,item,selected,text)=>{if(selected===item)return true;g.toast(text||`先在背包里选中「${items[item]}」，再点这里。`);return false;};
const advance=(g,condition,id,line)=>condition?g.go(id):one(g,'希尔达',line);
const book=(g,k)=>g.note(k);
function pipeCheck(g){if(f(g,'pumpPrimed')&&f(g,'filter')&&!f(g,'intakeClosed')&&Hydraulics.trace(g.s.valves,true).connected&&!f(g,'pump')){set(g,'pump');book(g,'surge');g.effect('water');say(g,[['希尔达','水走对路了。升降机应该能动了。'],['芙丽达','等一下……下面那扇旧闸，也被水压推开了。'],['大卫','所以那个越来越大的声音，不是好消息？']],()=>g.toast('远处传来沉重的轰鸣。必须继续向山里走。'));}}
function balance(g,v){if(f(g,'lift'))return g.toast('轿厢已经停稳，安全锁扣住了配重。不要再拆动它。');g.s.weights=g.s.weights.includes(v)?g.s.weights.filter(x=>x!==v):[...g.s.weights,v];g.commit();g.sound('metal');let sum=g.s.weights.reduce((a,b)=>a+b,0);g.toast(sum===4?'横梁水平了。现在可以松开制动。':sum<4?'吊盘太轻，横梁向左沉。':'吊盘太重，横梁向右沉。');}
function lightTrail(g,id,item){let i=Number(id.slice(-1));if(item==='lamp'||item==='shade'){if(!f(g,'hood'+i))return one(g,'希尔达','风会从这里灌进去。先转一下灯罩。');set(g,'trail'+i);g.sound('warm');g.toast('一盏回家的灯亮了。');if([0,1,2].every(j=>f(g,'trail'+j)))say(g,[['大卫','山那边……也亮了。'],['阿尔弗','她看见我们了！现在带孩子走过去。']]);}else if(!f(g,'hood'+i)){set(g,'hood'+i);g.toast('灯罩转到了背风侧。可以用提灯点火了。');}else g.toast(f(g,'trail'+i)?'这盏灯会一直亮到天明。':'在背包里选小提灯，再点这盏路灯。');}

function checkBeacon(g){if(Math.abs(g.s.beaconAngle-Math.atan2(Mechanisms.beacon.target[1]-Mechanisms.beacon.pivot[1],Mechanisms.beacon.target[0]-Mechanisms.beacon.pivot[0])*180/Math.PI)<Mechanisms.beacon.tolerance&&!f(g,'beacon')){set(g,'beacon');g.sound('warm');g.toast('光落在山脊星标上。云雾里，一只沃夫回应了你。');}else g.toast('调整光轴，让指针指向远处左上方的星标。');}

function maybeFinish(g){if(f(g,'hug')&&[0,1,2].every(i=>f(g,'tea'+i))&&!f(g,'ended')){set(g,'ended');book(g,'home');g.finish();}}
return {maybeFinish,checkBeacon,H,I,exit,f,say,one,wrong,set,need,advance,book,pipeCheck,balance,lightTrail};
});

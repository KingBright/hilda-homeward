/** Stage entry points retained for existing scenes, now sharing one cast library. */
Homeward.define('art/characters', ['art/kit','art/cast-design','content/staging'], (kit,Cast,Staging) => {
 const mood=who=>{const s=kit.getVisualState();return Cast.expression(s.scene,s.f,who);};
 const sized=(who,s,stage)=>stage?Staging.castScale(who,s,kit.getVisualState().scene):s;
 const hilda=(x,y,s=1,face=1,walking=false,working=false,stage=true)=>kit.group(x,y,sized('希尔达',s,stage),`<g transform="scale(${face} 1)" class="${walking?'walking ':''}${working?'working':''}">${Cast.standing('希尔达',mood('希尔达'))}</g>`);
 const twig=(x,y,s=.8,stage=true)=>kit.group(x,y,sized('枝枝',s,stage),Cast.twig());
 const person=(who,x,y,s=1,stage=true)=>who==='枝枝'?twig(x,y,s,stage):kit.group(x,y,who==='阿尔弗'?s:sized(who,s,stage),who==='阿尔弗'?Cast.elf():Cast.standing(who,mood(who)));
 const troll=(x,y,s=1,big=false)=>kit.group(x,y,s,Cast.troll(big,big||!!kit.getVisualState().f.calm));
 const woff=(x,y,s=1)=>kit.group(x,y,s,Cast.woff());
 return {hilda,twig,person,troll,woff};
});

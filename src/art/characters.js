/** Stage entry points retained for existing scenes, now sharing one cast library. */
Homeward.define('art/characters', ['art/kit','art/cast-design'], (kit,Cast) => {
 const mood=who=>{const s=kit.getVisualState();return Cast.expression(s.scene,s.f,who);};
 const hilda=(x,y,s=1,face=1,walking=false,working=false)=>kit.group(x,y,s,`<g transform="scale(${face} 1)" class="${walking?'walking ':''}${working?'working':''}">${Cast.standing('希尔达',mood('希尔达'))}</g>`);
 const twig=(x,y,s=.8)=>kit.group(x,y,s,Cast.twig());
 const person=(who,x,y,s=1)=>who==='枝枝'?twig(x,y,s):kit.group(x,y,s,who==='阿尔弗'?Cast.elf():Cast.standing(who,mood(who)));
 const troll=(x,y,s=1,big=false)=>kit.group(x,y,s,Cast.troll(big,big||!!kit.getVisualState().f.calm));
 const woff=(x,y,s=1)=>kit.group(x,y,s,Cast.woff());
 return {hilda,twig,person,troll,woff};
});

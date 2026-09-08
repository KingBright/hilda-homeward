Homeward.define("art", ["art/chapter-life", "art/finishing", "art/items", "art/kit", "art/characters", "art/props", "scene/0/art", "scene/1/art", "scene/2/art", "scene/3/art", "scene/4/art", "scene/5/art", "scene/6/art", "scene/7/art", "scene/8/art", "scene/9/art", "scene/10/art", "scene/11/art"], (chapterLife, finishing, detailedItems, kit, characters, props, scene0, scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11) => {
const {rep,path}=kit;
function weather(S){let rain=[1,2,5,7,9].includes(S.scene);let n=S.scene===9?104:rain?57:0;return `<g id="weather" pointer-events="none">${rep(n,i=>path(`M${(i*83)%1640-20} ${(i*59)%1050-110}l${S.scene===9?-23:-9} ${S.scene===9?53:29}`,'none','#c0dad9',1.2,`class="rainStroke" data-rain="${i}"`))}</g>`;}

const scenes=[scene0,scene1,scene2,scene3,scene4,scene5,scene6,scene7,scene8,scene9,scene10,scene11];
function scene(state,title=false){const i=title?7:state.scene;kit.setVisualState(state,i);return scenes[i](state)+finishing.scenery({...state,scene:i})+chapterLife.scenery({...state,scene:i});}
return {...kit,...characters,...props,...detailedItems,defs:kit.defs+finishing.defs+chapterLife.defs,foreground:finishing.foreground,scene,weather};
});

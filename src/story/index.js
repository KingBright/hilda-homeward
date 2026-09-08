Homeward.define("story", ["content/catalog", "content/details", "scene/0/logic", "scene/1/logic", "scene/2/logic", "scene/3/logic", "scene/4/logic", "scene/5/logic", "scene/6/logic", "scene/7/logic", "scene/8/logic", "scene/9/logic", "scene/10/logic", "scene/11/logic"], (catalog, details, scene0, scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11) => {

const scenes=[scene0,scene1,scene2,scene3,scene4,scene5,scene6,scene7,scene8,scene9,scene10,scene11];
const notes={...catalog.notes};
scenes.forEach((scene,index)=>{
  const detail=details[index],hotspots=scene.hotspots,act=scene.act;
  notes[detail.note]=[detail.title,detail.body];
  scene.hotspots=state=>[...hotspots(state),{...detail,label:'仔细看看 · '+detail.title,kind:'observe'}];
  scene.act=(game,id,item)=>{
    if(id!=='detail')return act(game,id,item);
    game.note(detail.note);game.say([['希尔达',detail.body]]);
  };
});
return {...catalog,notes,scenes};
});

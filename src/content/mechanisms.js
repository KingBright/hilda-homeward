/** The visible axle geometry and interaction geometry use one source of truth. */
Homeward.define('content/mechanisms',[],()=>({
  gondolaWeight(state,value,localY=-20){
    const index=state.weights.indexOf(value);
    if(index<0)return [425+(value-1)*113,691+localY];
    const a=(state.weights.reduce((sum,v)=>sum+v,0)-4)*3*Math.PI/180,x=115+index*28,y=150+localY*.65;
    return [810+x*Math.cos(a)-y*Math.sin(a),451+x*Math.sin(a)+y*Math.cos(a)];
  },
  gears:[
    {item:'gearS',socket:'socketS',x:1032,y:538,radius:35,teeth:10,hit:82,label:'低处的小齿轮槽'},
    {item:'gearM',socket:'socketM',x:1090,y:486,radius:50,teeth:12,hit:100,label:'中间的对位齿轮'},
    {item:'gearL',socket:'socketL',x:1180,y:416,radius:70,teeth:14,hit:151,label:'高处的大齿轮槽'}
  ],
  witnessIndex:3,
  beacon:{pivot:[1292,492],target:[1044,176],tolerance:9}
}));

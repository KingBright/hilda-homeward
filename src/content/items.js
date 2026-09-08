/** Physical affordances, descriptions and feedback are authored separately from art. */
Homeward.define('content/items', [], () => {
  const itemSpecs = {
    lamp:{material:'黄铜 · 玻璃 · 温暖的灯芯',detail:'玻璃上有擦拭过的指印，底座还留着厨房的余温。提环可以挂起，灯光也能引燃别的灯。',hint:'不一定要更亮。有时，柔和一点才不会吓到别人。'},
    scarf:{material:'柔软羊毛 · 手工流苏',detail:'妈妈替你把散开的线头缝好了。它透气、遮光，也能让陌生的地方变得温暖。',hint:'可以和随身的提灯组合。'},
    shade:{material:'羊毛灯罩 · 黄铜提灯',detail:'围巾只包住灯罩外缘，留出了通风的缝隙。明亮的灯心变成一团不刺眼的暖光。',hint:'适合放在害怕强光的孩子身边。'},
    crank:{material:'黄铜 · 方形榫头',detail:'握柄上的漆磨掉了一圈，榫头上刻着与旧水钟相同的记号。方轴能传递扭矩，但不能代替长柄杠杆。',hint:'城门和水钟的阀轴使用相同的接口。'},
    rope:{material:'编织麻绳 · 完整绳圈',detail:'先检查纤维，再拉紧打结。绳圈够长，可以套住远一点的树藤；它本身抓不住光滑铁环。',hint:'能套住树藤。装上铁钩后还可跨过溪流。'},
    hook:{material:'锻铁 · 弯曲钩尖',detail:'钩尖被藤蔓磨得发亮，钩柄有一只穿绳孔。单独扔出去，它就只是一块沉进水里的铁。',hint:'与旧绳圈组合成带钩绳索。'},
    grapple:{material:'麻绳 · 铁钩 · 双重绳结',detail:'铁钩负责抓住，绳结负责不松开。抛出去前，先确认对岸有坚固的固定点。',hint:'适合套住对岸的铁环，不是用来直接拉断桥。'},
    line:{material:'救援绳 · 编织护套',detail:'升降站留下的安全绳。边缘没有磨损，长度足以跨过屋顶缺口。先锚定，再伸手。',hint:'先固定近处铁环，再救同伴。'},
    plan:{material:'防水纸 · 褪色蓝墨',detail:'图纸边缘布满折痕。人类的细小批注旁，还有巨魔留下的宽大指印。维护顺序比机关形状更重要。',hint:'先旁路，再缓冲，最后协作排洪。'},
    fork:{material:'合金 · 两根等长叉齿',detail:'轻敲就能感觉到细微振动。叉柄能扣入排洪飞轮的共振锁，石壁也记得这个声音。',hint:'两名同伴稳住机构后，用它启动飞轮。'},
    felt:{material:'羊毛毡 · 厚实纤维',detail:'被旧油纸包着的维护软垫。它能缓冲撞击，却不能替洪水寻找出口。',hint:'先让压力表稳定，再靠近钟舌。'},
    gearS:{material:'黄铜 · 小号齿圈',detail:'轮毂周围有细密的放射状磨痕。尺寸必须和轴位相合，不能用力硬塞。',hint:'匹配最低的小轴承。'},
    gearM:{material:'黄铜 · 校时刻痕',detail:'轮缘有一枚浅色见证点。轴座上也有一道刻线，对齐后定位销才能落下。',hint:'装回轴位后还能转动，观察轮缘与机架的标记。'},
    gearL:{material:'铸铜 · 加强辐条',detail:'最重的一枚。轮毂和辐条承受门的重量，石阶边留下了推运它的轨迹。',hint:'沿石阶借力送回高处主轴，不要举过头顶。'},
    pole:{material:'木柄 · 钢制弯头',detail:'检修工用它拨动高处的活节。长柄既能扩大够到的范围，也能与同伴配合撬起压住人的横梁。',hint:'高处弯管和屋顶横梁都需要它。'}
  };
  const recipes=[{inputs:['rope','hook'],output:'grapple'},{inputs:['lamp','scarf'],output:'shade'}];
  const uses=[
    {},{wheel:['crank']},{hook:['rope'],anchor:['grapple']},{},
    {pipe0:['pole']},{},{holder:['lamp','shade']},
    {socketS:['gearS'],socketM:['gearM'],socketL:['gearL']},
    {bypass:['crank'],clapper:['felt'],drive:['fork']},
    {anchor:['line'],frida:['pole']},
    {trail0:['lamp','shade'],trail1:['lamp','shade'],trail2:['lamp','shade']},{}
  ];
  function canUse(scene,id,item) { return !item || (uses[scene]?.[id]??[]).includes(item); }
  function recipeFor(a,b) { return recipes.find(r=>r.inputs.includes(a)&&r.inputs.includes(b)&&a!==b)?.output??null; }
  return {itemSpecs,recipes,canUse,recipeFor};
});

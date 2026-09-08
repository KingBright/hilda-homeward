/** A single piecewise-linear profile for the service deck and actors' feet. */
Homeward.define('content/walkways', [], () => {
  const waterworks=Object.freeze([[60,793],[520,793],[620,720],[990,720],[1090,793],[1540,793]].map(Object.freeze));
  function height(points,x){
    if(!Number.isFinite(x))throw new TypeError('Invalid walkway position');
    if(x<=points[0][0])return points[0][1];
    for(let i=1;i<points.length;i++)if(x<=points[i][0]){
      const [a,b]=[points[i-1],points[i]],t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t;
    }
    return points.at(-1)[1];
  }
  const waterworksGround=x=>height(waterworks,x);
  const waterworksPath=(offset=0)=>waterworks.map(([x,y],i)=>(i?'L':'M')+x+' '+(y+offset)).join('');
  return {waterworks,height,waterworksGround,waterworksPath};
});

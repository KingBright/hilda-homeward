/** Elbow connectivity in clockwise quarter-turns: N/E, E/S, S/W, W/N.
 * The renderer and puzzle share this graph, not independent answer tables.
 */
Homeward.define('engine/hydraulics', [], () => {
  const ports = Object.freeze([['N','E'],['E','S'],['S','W'],['W','N']]);
  const edges = [ {S:[1,'N']}, {N:[0,'S'],E:[2,'W']}, {W:[1,'E']} ];
  function trace(rotations, enabled = true) {
    if (!Array.isArray(rotations) || rotations.length !== 3 || rotations.some(v => !Number.isInteger(v) || v < 0 || v > 3)) {
      throw new TypeError('Three valid pipe rotations are required');
    }
    const wet = [], leaks = [];
    let index = 0, inlet = 'W';
    if (!enabled) return {connected:false, wet, leaks, pressure:0};
    for (let visits = 0; visits < 4; visits++) {
      const open = ports[rotations[index]];
      if (!open.includes(inlet)) { leaks.push({node:index,port:inlet}); break; }
      wet.push(index);
      const outlet = open.find(p => p !== inlet);
      if (index === 2 && outlet === 'N') return {connected:true,wet,leaks,pressure:1};
      const edge = edges[index][outlet];
      if (!edge) { leaks.push({node:index,port:outlet}); break; }
      [index,inlet] = edge;
      if (wet.includes(index)) break;
    }
    return {connected:false,wet,leaks,pressure:wet.length / 4};
  }
  return Object.freeze({ports,trace});
});

/** Small dependency registry. No globals besides Homeward, no runtime packages. */
(function (root) {
  'use strict';
  const definitions = new Map();
  const instances = new Map();
  const resolving = new Set();
  function define(id, dependencies, factory) {
    if (definitions.has(id)) throw new Error('Duplicate module: ' + id);
    definitions.set(id, { dependencies, factory });
  }
  function use(id) {
    if (instances.has(id)) return instances.get(id);
    if (resolving.has(id)) throw new Error('Circular module dependency: ' + id);
    const entry = definitions.get(id);
    if (!entry) throw new Error('Missing module: ' + id);
    resolving.add(id);
    try {
      const value = entry.factory(...entry.dependencies.map(use));
      instances.set(id, value);
      return value;
    } finally { resolving.delete(id); }
  }
  root.Homeward = Object.freeze({ define, use, modules: () => [...definitions.keys()] });
})(globalThis);

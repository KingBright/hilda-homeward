/** Reconcile SVG without replacing actors, focus, weather or active CSS timelines. */
Homeward.define('engine/dom', [], () => {
  const ns = 'http://www.w3.org/2000/svg';
  function same(a,b) {
    return a.nodeType === b.nodeType && a.nodeName === b.nodeName &&
      (a.nodeType !== 1 || (a.getAttribute('id') === b.getAttribute('id') &&
      a.getAttribute('data-hotspot') === b.getAttribute('data-hotspot')));
  }
  function reconcile(parent, source) {
    let old = parent.firstChild;
    for (const wanted of [...source.childNodes]) {
      let next = old?.nextSibling;
      if (!old) parent.appendChild(wanted.cloneNode(true));
      else if (!same(old,wanted)) parent.replaceChild(wanted.cloneNode(true),old);
      else if (wanted.nodeType === 3) {
        if (old.nodeValue !== wanted.nodeValue) old.nodeValue = wanted.nodeValue;
      } else if (wanted.nodeType === 1) {
        for (const attr of [...old.attributes]) if (!wanted.hasAttribute(attr.name)) old.removeAttribute(attr.name);
        for (const attr of [...wanted.attributes]) if (old.getAttribute(attr.name) !== attr.value) old.setAttribute(attr.name,attr.value);
        if(!(old.id==='hotspotLayer'&&!wanted.hasChildNodes()))reconcile(old,wanted);
      }
      old = next;
    }
    while (old) { const next=old.nextSibling; parent.removeChild(old); old=next; }
  }
  function patchSvg(element, markup) {
    if (element.__markup === markup) return;
    const source=document.createElementNS(ns,'g'); source.innerHTML=markup;
    reconcile(element,source); element.__markup=markup;
  }
  return {patchSvg};
});

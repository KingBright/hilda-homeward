/** Presentation-only attention and dialogue acting. Never writes game/save state.
 * Text cadence drives stylized mouths; this is not phoneme-aligned lip sync.
 * Contact choreography owns the inner head/limbs; acting uses an outer neck pivot.
 */
Homeward.define('art/cast-acting', ['art/cast-design','engine/idle-life','engine/kinematics'], (Cast,Idle,{solve}) => {
  const caches = new WeakMap();
  const clamp = n => Math.max(-1, Math.min(1, Number.isFinite(n) ? n : 0));
  const punctuation = /^[\s，。！？、…—·：；“”‘’「」.,!?;:]+$/u;
  const rhythms = {'希尔达': [8.8, .4], '大卫': [10.2, 1.7], '芙丽达': [8, 3.1], '妈妈': [6.8, 4.6]};
  const closedMouth = mood => mood === 'worried' ? 'M1-94q5-5 10 0'
    : mood === 'resolve' ? 'M1-94q5 1 10-1'
    : mood === 'relieved' ? 'M-1-96q7 9 14-1'
    : mood === 'gentle' ? 'M1-95q5 3 10-1' : 'M0-95q6 5 12-1';

  function sample({who = '希尔达', time = 0, role = 'idle', mood = 'curious', gaze = 0,
    typing = false, character = '', reduced = false} = {}) {
    const t = Number.isFinite(time) ? Math.max(0, time) % 3600 : 0;
    const [rate, offset] = Object.hasOwn(rhythms, who) ? rhythms[who] : [8, 0];
    const direction = clamp(gaze);
    const talking = role === 'speaker' && typing && !reduced && character.length > 0 && !punctuation.test(character);
    const syllable = Math.floor(t * rate + offset) % 4;
    const open = talking && syllable !== 3;
    const mouths = ['M0-95q6-2 12 0q-5 8-12 0Z', 'M3-95q3-3 6 0v3q-3 4-6 0Z', 'M0-95q6 1 12-1q-5 5-12 1Z'];
    const nod = role === 'speaker' ? Math.sin(t * 3.1 + offset) * 1.3
      : role === 'listener' ? Math.sin(t * 1.7 + offset) * .55 : 0;
    return {
      gazeX: direction,
      tilt: reduced ? 0 : -direction * 1.4 + nod,
      mouth: open ? mouths[syllable] : closedMouth(mood),
      fill: open ? '#825047' : 'none',
      open
    };
  }

  function refresh(root) {
    if (!root) return;
    const entries = [...root.querySelectorAll('[data-cast]')].map(actor => {
      const head = actor.querySelector('[data-cast-head]');
      return {actor, who: actor.dataset.cast, head,
        pivot: head?.closest('.cast-attention'),
        pupils: head?.querySelector('.cast-pupils'),
        mouth: head?.querySelector('.cast-mouth'),
        blink: head?.querySelector('.cast-blink,#rigEyes'),
        upper: actor.querySelector('.cast-rest-upper'),
        slot: actor.closest('#davidFollow,#fridaFollow,#roofDavid,#roofFrida'),
        arms: [...actor.querySelectorAll('[data-rest-arm]')].map(n=>({node:n,name:n.dataset.restArm,paths:[...n.querySelectorAll(':scope > path')],hand:n.querySelector('.rest-hand')}))};
    });
    caches.set(root, entries);
  }

  function put(node, key, value) {
    if (!node) return;
    const text = String(value);
    if (node.getAttribute(key) !== text) node.setAttribute(key, text);
  }

  function paint(root, time, {scene = 0, flags = {}, speaker = '', listener = '',
    typing = false, character = '', reduced = false, paused = false,
    portrait = false, working = false, moving = false} = {}) {
    if (!root || paused) return;
    if (!caches.has(root)) refresh(root);
    const entries = caches.get(root);
    // Read all transforms before writes. No bounding-box reads or per-frame selectors.
    const positions = new Map();
    if (!portrait) for (const entry of entries) {
      const m = entry.actor.getCTM();
      if (m) positions.set(entry, {x: m.e - m.c * 110, unit: Math.max(.01, Math.hypot(m.a, m.b)), face: m.a < 0 ? -1 : 1});
    }
    const hero = entries.find(e => e.who === '希尔达');
    const source = entries.find(e => e.who === speaker);
    const addressee = entries.find(e => e.who === listener && e !== source)
      || (source !== hero ? hero : entries.find(e => e !== source && e.head));
    if (portrait) put(root, 'data-role', speaker ? 'speaker' : 'idle');
    for (const entry of entries) {
      if (!entry.head) continue;
      const role = speaker ? entry.who === speaker ? 'speaker' : 'listener' : 'idle';
      const target = entry === source ? addressee : source || hero;
      const from = positions.get(entry), to = positions.get(target);
      const gaze = !portrait && target !== entry && from && to
        ? clamp((to.x - from.x) / (from.unit * 140)) * from.face : 0;
      const mood = working && entry === hero ? 'resolve' : Cast.expression(scene, flags, entry.who);
      const walking=entry.slot?.dataset.gait==='walking'||entry===hero&&moving;
      const reserved=!!entry.slot?.classList.contains('bracing')
        ||entry.slot?.id==='roofDavid'&&flags.roofBrace&&!flags.roofDone
        ||scene===8&&((entry.who==='大卫'&&flags.leverFriend)||(entry.who==='芙丽达'&&flags.brakeFriend))
        ||working&&(entry===hero||scene===8||scene===9);
      const idle=Idle.sample({who:entry.who,time,scene,reduced,reserved,moving:walking,speaker:role==='speaker'});
      const pose = sample({who: entry.who, time, role, mood, gaze, typing, character, reduced});
      if(!speaker&&!reserved){pose.gazeX=clamp(pose.gazeX*.8+idle.look);pose.tilt+=idle.head;}
      put(entry.actor,'data-idle',idle.beat);
      if(entry.upper){
        put(entry.upper,'transform',`translate(${idle.shift.toFixed(3)} ${(-idle.breath).toFixed(3)}) rotate(${idle.lean.toFixed(3)} 0 -44)`);
        for(const arm of entry.arms){
          const front=arm.name==='front',origin=[front?17:-19,-79],target=front?idle.front:idle.back;
          const j=solve(origin,target,25,27,-1);
          const fmt=a=>a.map(n=>n.toFixed(3));
          const d=`M${fmt(origin)}L${fmt(j.elbow)}L${fmt(j.end)}`;
          arm.paths.forEach(n=>put(n,'d',d));
          const angle=Math.atan2(j.end[1]-j.elbow[1],j.end[0]-j.elbow[0])*180/Math.PI-90;
          put(arm.hand,'transform',`translate(${fmt(j.end).join(' ')}) rotate(${angle.toFixed(3)})`);
        }
      }
      if(entry.blink){
        entry.blink.style.animation='none';
        put(entry.blink,'transform',`translate(0 -111) scale(1 ${idle.blink.toFixed(3)}) translate(0 111)`);
      }
      put(entry.actor, 'data-role', role);
      put(entry.head, 'data-mood', mood);
      put(entry.actor, 'data-gaze', pose.gazeX.toFixed(3));
      put(entry.pupils, 'transform', `translate(${pose.gazeX.toFixed(3)} 0)`);
      put(entry.pivot, 'transform', `rotate(${(working && entry === hero ? 0 : pose.tilt).toFixed(3)} 0 -87)`);
      put(entry.mouth, 'd', pose.mouth);
      put(entry.mouth, 'fill', pose.fill);
      put(entry.mouth, 'data-open', pose.open);
    }
  }
  return {sample, refresh, paint};
});

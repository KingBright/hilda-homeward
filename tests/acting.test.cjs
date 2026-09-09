const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({console});
for (const name of ['engine/modules', 'engine/kinematics', 'engine/idle-life', 'art/twig-design', 'art/cast-design', 'art/cast-acting']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', name + '.js'), 'utf8'), context);
}
const Acting = context.Homeward.use('art/cast-acting');
const Cast = context.Homeward.use('art/cast-design');
const plain = value => JSON.parse(JSON.stringify(value));
const humans = ['希尔达', '大卫', '芙丽达', '妈妈'];
const speech = {role: 'speaker', typing: true, character: '你'};

test('Acting is deterministic and leaves its input untouched', () => {
  const input = Object.freeze({...speech, who: '妈妈', time: 1.37, gaze: -.6});
  const before = JSON.stringify(input);
  assert.deepEqual(plain(Acting.sample(input)), plain(Acting.sample(input)));
  assert.equal(JSON.stringify(input), before);
});
test('Attention remains finite and bounded for extreme clocks and gaze', () => {
  for (const time of [NaN, Infinity, -Infinity, -1, 0, 1e300]) {
    for (const gaze of [NaN, Infinity, -Infinity, -100, -.3, 0, 100]) {
      const pose = Acting.sample({...speech, time, gaze});
      assert.ok(Number.isFinite(pose.gazeX) && Math.abs(pose.gazeX) <= 1);
      assert.ok(Number.isFinite(pose.tilt) && Math.abs(pose.tilt) <= 2.71);
      assert.doesNotMatch(pose.mouth, /NaN|undefined|Infinity/);
    }
  }
});
test('Only the currently typing speaker opens a mouth', () => {
  for (const who of humans) {
    const poses = Array.from({length: 40}, (_, i) => Acting.sample({...speech, who, time: i / 20}));
    assert.ok(poses.some(p => p.open) && poses.some(p => !p.open), who);
    assert.ok(poses.filter(p => p.open).every(p => p.fill !== 'none'));
    for (const role of ['listener', 'idle']) assert.equal(Acting.sample({...speech, who, role}).open, false);
    assert.equal(Acting.sample({...speech, who, typing: false}).open, false);
  }
});
test('Punctuation and whitespace close the mouth rather than chattering', () => {
  for (const character of ['', ' ', '，', '。', '！', '？', '…', '、', '.', ',', '\n']) {
    for (const who of humans) assert.equal(Acting.sample({...speech, who, character}).open, false);
  }
});
test('Reduced motion removes nodding and mouth cycles at every time', () => {
  for (const who of humans) {
    const input = {...speech, who, gaze: .7, reduced: true};
    const still = plain(Acting.sample(input));
    assert.equal(still.tilt, 0); assert.equal(still.open, false);
    for (const time of [0, .4, 2, 33, 3601]) assert.deepEqual(plain(Acting.sample({...input, time})), still);
  }
});
test('Four human performances have distinct authored timing', () => {
  const signatures = humans.map(who => Array.from({length: 24}, (_, i) => {
    const p = Acting.sample({...speech, who, time: i / 12});
    return [p.mouth, p.tilt.toFixed(3)];
  }));
  assert.equal(new Set(signatures.map(JSON.stringify)).size, 4);
});
test('Closed expressions preserve peril, resolve, tenderness and relief', () => {
  const moods = ['curious', 'worried', 'resolve', 'gentle', 'relieved'];
  const poses = moods.map(mood => Acting.sample({mood}));
  assert.equal(new Set(poses.map(p => p.mouth)).size, moods.length);
  assert.ok(poses.every(p => !p.open && p.fill === 'none'));
});
test('Unknown names including prototype keys use a safe timing fallback', () => {
  for (const who of ['旁白', '__proto__', 'constructor']) {
    const p = Acting.sample({...speech, who});
    assert.ok(Number.isFinite(p.tilt)); assert.match(p.mouth, /^M/);
  }
});
test('Every human shares separate pupil, mouth and outer attention layers', () => {
  for (const who of humans) {
    const art = Cast.standing(who);
    for (const hook of ['cast-attention', 'cast-pupils', 'cast-mouth']) assert.ok(art.includes(hook), who + hook);
    assert.equal((art.match(/class="cast-attention"/g) || []).length, 1);
  }
  assert.match(Cast.head('希尔达', 'curious', true), /class="cast-attention"><g id="rigHead"/);
});

"""Final layer-order correction, checked before the full V3.2 quality gate."""
from pathlib import Path
import hashlib
ROOT=Path(__file__).resolve().parents[1]
art=ROOT/'src/scenes/09-storm-roof/art.js'
tests=ROOT/'tests/unit.test.cjs'
assert hashlib.sha256(art.read_bytes()).hexdigest()=='5bb4b213da24ca70d58752723f57e463828d3f27461ee495c6a4750acad991a7', 'Roof source changed'
assert hashlib.sha256(tests.read_bytes()).hexdigest()=='93310722afff0668891deb13abd5b4e62281377cb2c39683edc40b2e94d7cdcc', 'Test source changed'
lines=art.read_text().splitlines(keepends=True)
actors=[line for line in lines if line.startswith('b+=`<g id="roofDavid"') or line.startswith('b+=`<g id="roofFrida"')]
assert len(actors)==2
lines=[line for line in lines if line not in actors]
index=next(i for i,line in enumerate(lines) if line.startswith('b+=`<g id="roofBeam"'))
lines[index+1:index+1]=actors
result=''.join(lines)
assert hashlib.sha256(result.encode()).hexdigest()=='dc5cac38119e4af7083263ab5cef88392b9b793e7e20533721e87d9234694c3d'
art.write_text(result)
tests.write_text(tests.read_text()+'\ntest(\'Roof beam is drawn behind rescuers so the lifted plank cannot cover their faces\',()=>{\n const s=State.fresh();s.scene=9;s.f={roofAnchor:true,davidSafe:true,roofBrace:true,fridaSafe:true};\n const svg=H.use(\'scene/9/art\')(s);\n assert.ok(svg.indexOf(\'id="roofBeam"\')<svg.indexOf(\'id="roofDavid"\'));\n assert.ok(svg.indexOf(\'id="roofBeam"\')<svg.indexOf(\'id="roofFrida"\'));\n});\n')
(ROOT/'.v32-expected.sha256').write_text('c32115583b688d5bea53f1cb6e583344d8f89c73ded42e2b4c5699d2b374ae6e  index.html\n')

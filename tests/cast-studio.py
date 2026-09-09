"""Native local-file smoke checks for the source-backed character workbench."""
from pathlib import Path
import hashlib
import json
import os
import platform
import traceback
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
CHECKS=[]

def check(name, condition):
    assert condition,name
    CHECKS.append({'name':name,'passed':True})
    print('PASS',len(CHECKS),name,flush=True)

def main(browser):
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http://','https://')) else None)
    page.goto((ROOT/'tools/cast-studio.html').as_uri(),wait_until='load')
    check('Workbench loads four shared stage actors directly from local source modules',page.locator('#castStage [data-cast]').count()==4)
    for who in ['希尔达','大卫','芙丽达','妈妈']:
        page.locator('#castSelect').select_option(label=who)
        page.wait_for_function('(who)=>document.querySelector(\'#castStage [data-role="speaker"]\')?.dataset.cast===who',arg=who)
        check('Workbench switches stage and portrait together: '+who,page.locator('#portrait [data-cast]').get_attribute('data-cast')==who)
        check('Portrait leaves headroom for hats and hair: '+who,page.evaluate("(()=>{const box=document.querySelector('#portrait svg').viewBox.baseVal,head=document.querySelector('#portrait [data-cast-head]').getBBox();return head.y>=box.y+2 && head.y+head.height<box.y+box.height})()"))
    check('Workbench includes the same four-legged animal rig as the game',page.locator('#animalStage [data-twig-leg]').count()==4)
    page.locator('#animalMode').select_option('trot')
    page.wait_for_function('Math.abs(Number(document.querySelector(\'#animalStage [data-animal-rig]\').dataset.speed))>30')
    check('Animal workbench actually drives locomotion instead of a static pose',True)
    page.locator('#dialogueControl').uncheck()
    check('Disabling dialogue exposes quiet NPC idle roles',page.evaluate("[...document.querySelectorAll('#castStage [data-cast]')].every(n=>n.dataset.role==='idle')"))
    page.locator('#dialogueControl').check()
    page.locator('#sceneSelect').select_option('9')
    check('Peril preview uses the game character-specific expressions',page.locator('#castStage [data-cast-head="大卫"]').get_attribute('data-mood')=='worried' and page.locator('#castStage [data-cast-head="妈妈"]').get_attribute('data-mood')=='resolve')
    page.locator('#sceneSelect').select_option('10')
    check('Homecoming preview restores relief to the full human cast',page.evaluate("[...document.querySelectorAll('#castStage [data-cast-head]')].every(n=>n.dataset.mood==='relieved')"))
    page.locator('#facingSelect').select_option('-1')
    check('Mirrored workbench uses each actor local gaze direction',page.evaluate("Number(document.querySelector('#castStage [data-cast=\"希尔达\"]').dataset.gaze)<0 && Number(document.querySelector('#castStage [data-cast=\"妈妈\"]').dataset.gaze)>0"))
    page.locator('#reducedControl').check()
    check('Reduced preview disables secondary animation and mouth loops',page.evaluate("[...document.querySelectorAll('.cast-mouth')].every(n=>n.dataset.open==='false') && [...document.querySelectorAll('.cast-blink')].every(n=>getComputedStyle(n).animationName==='none')"))
    page.locator('#reducedControl').uncheck()
    page.locator('#pauseControl').click()
    animal=page.locator('#animalStage').inner_html()
    pose=page.locator('#castStage').inner_html();text=page.locator('#subtitle').inner_text()
    page.wait_for_timeout(220)
    check('Workbench pause freezes actual SVG and subtitle',pose==page.locator('#castStage').inner_html() and text==page.locator('#subtitle').inner_text())
    check('Workbench pause also freezes the animal and follower',animal==page.locator('#animalStage').inner_html())
    page.screenshot(path=str(ROOT/'previews/cast-studio-v3.6.png'))
    page.set_viewport_size({'width':390,'height':844})
    check('Narrow workbench layout fits viewport without horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    check('Shared renderers do not introduce duplicate SVG IDs',page.evaluate("(()=>{const ids=[...document.querySelectorAll('svg [id]')].map(n=>n.id);return ids.length===new Set(ids).size})()"))
    page.set_viewport_size({'width':1440,'height':1000})
    page.locator('a[href="../dev.html"]').click()
    page.wait_for_selector('#startBtn')
    check('Workbench links to a functioning source-loaded development game',page.locator('#titleScreen').is_visible())
    check('Workbench and development entry have no uncaught exceptions',not errors)
    check('Local preview needs no external asset service',not external)
    page.close()

if __name__=='__main__':
    (ROOT/'previews').mkdir(exist_ok=True)
    failure=None
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:main(browser)
        except Exception:
            failure=traceback.format_exc();print(failure,flush=True)
        finally:
            paths=['tools/cast-studio.html','src/engine/modules.js','src/engine/kinematics.js','src/engine/idle-life.js','src/engine/animal-life.js','src/art/twig-design.js','src/art/creature-life.js','src/art/cast-design.js','src/art/cast-acting.js','src/ui/cast.css']
            report={'passed':failure is None,'checks_passed':len(CHECKS),'checks':CHECKS,'failure':failure,'browser':browser.version,'host':platform.platform(),'source_sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths},'scope':'Native file navigation and source-backed workbench controls; narrow viewport emulation, not a physical phone.'}
            (ROOT/'previews/cast-studio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
    raise SystemExit(1 if failure else 0)

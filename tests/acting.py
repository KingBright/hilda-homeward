"""Dialogue UI checks plus an isolated four-character SVG acting fixture.
Uses the existing explicit save adapter, not native persistence or real phones.
"""
from pathlib import Path
import hashlib
import json
import os
import traceback
from playwright.sync_api import sync_playwright
from playthrough import newpage, settle, ERRORS, REQUESTS

ROOT = Path(__file__).resolve().parents[1]
CHECKS = []

def check(name, condition):
    assert condition, name
    CHECKS.append({'name': name, 'passed': True})
    print('PASS', len(CHECKS), name, flush=True)

def main(browser):
    page = newpage(browser)
    page.locator('#startBtn').click()
    settle(page)
    # Use the supported keyboard path: animated hotspot bounds need not settle.
    page.locator('[data-hotspot="mom"]').focus()
    page.locator('[data-hotspot="mom"]').press('Enter')
    page.wait_for_function('!!HildaTest.ui().dialogue')
    page.wait_for_function('document.querySelector(\'#world [data-role="speaker"] .cast-mouth[data-open="true"]\')')
    observations = page.evaluate('''async () => {
      const frames = [];
      for (let i = 0; i < 15; i++) {
        const a = document.querySelector('#world [data-role="speaker"] .cast-mouth');
        const b = document.querySelector('#portrait .cast-mouth');
        frames.push({equal: a?.getAttribute('d') === b?.getAttribute('d'), open: a?.dataset.open});
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      return frames;
    }''')
    check('Real dialogue uses identical stage and portrait mouth frames', all(f['equal'] for f in observations))
    check('Speaking mouths animate while sound remains disabled', any(f['open'] == 'true' for f in observations) and page.evaluate('HildaTest.audio()') is None)
    check('Listeners remain silent during another character dialogue', page.evaluate('''[...document.querySelectorAll('#world [data-role="listener"] .cast-mouth')].every(n => n.dataset.open === 'false')'''))
    # Controlled long dialogue isolates pause behavior without changing progression.
    page.evaluate("Homeward.use('engine/runtime').say([['妈妈','我们会在窗边留一盏温暖的灯。走过雨城的时候，记得抬头看看星星，也记得等一等身边的朋友。']])")
    page.wait_for_timeout(180)
    page.locator('#menuBtn').click()
    frozen = page.evaluate("[document.querySelector('#line').textContent, ...[...document.querySelectorAll('#world .cast-attention,#portrait .cast-attention')].map(n=>n.getAttribute('transform'))]")
    page.wait_for_timeout(400)
    check('Pause freezes both typewriter and character attention', frozen == page.evaluate("[document.querySelector('#line').textContent, ...[...document.querySelectorAll('#world .cast-attention,#portrait .cast-attention')].map(n=>n.getAttribute('transform'))]"))
    page.locator('#resumePlay').click()
    page.wait_for_function('document.querySelector(\'#portrait .cast-mouth[data-open="true"]\')')
    page.screenshot(path=str(ROOT / 'previews' / 'dialogue-v3.4.png'))
    page.keyboard.press('Space')
    page.wait_for_function('''[...document.querySelectorAll('#world .cast-mouth,#portrait .cast-mouth')].every(n => n.dataset.open === 'false')''')
    check('Revealing a complete line closes stage and portrait mouths', True)
    settle(page)
    page.evaluate("Homeward.use('engine/runtime').say([['妈妈','带着围巾，找到朋友，然后一起回来。'],['希尔达','不落下任何一个，我保证。每一个朋友都要安全地一起回到家。']])")
    page.keyboard.press('Space')
    page.keyboard.press('Space')
    page.wait_for_function('HildaTest.ui().dialogue?.lines[HildaTest.ui().dialogue.index]?.[0] === "希尔达"')
    page.wait_for_function('document.querySelector(\'#performer .cast-mouth[data-open="true"]\')')
    check('Keyboard dialogue handoff moves speaking role from mother to Hilda', page.evaluate('''document.querySelector('#world [data-cast="妈妈"]').dataset.role === 'listener' && document.querySelector('#world [data-cast="妈妈"] .cast-mouth').dataset.open === 'false' && document.querySelector('#portrait [data-cast]').dataset.cast === '希尔达' '''))
    settle(page)
    result = page.evaluate('''() => {
      const C = Homeward.use('art/cast-design'), A = Homeward.use('art/cast-acting');
      const fixture = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      fixture.id = 'actingFixture'; fixture.setAttribute('viewBox', '0 0 640 345');
      fixture.setAttribute('class', 'paused');
      fixture.style.cssText = 'position:fixed;left:24px;top:24px;width:1000px;height:540px;z-index:10000;background:#203945;border:1px solid #bdaf87;border-radius:16px';
      fixture.innerHTML = '<text x="30" y="34" fill="#e6d4a8" font-size="15">HOMEWARD / V3.4 — ATTENTION STUDY</text>' +
        ['希尔达','大卫','芙丽达','妈妈'].map((who,i) => '<g transform="translate('+(90+i*150)+' 290) scale('+(i===2?-1.4:1.4)+' 1.4)">'+C.standing(who)+'</g><text x="'+(90+i*150)+'" y="324" text-anchor="middle" fill="#e6d4a8" font-size="13">'+who+'</text>').join('');
      document.body.append(fixture); A.refresh(fixture);
      const stateBefore = JSON.stringify(HildaTest.state());
      const options = {speaker:'妈妈',listener:'希尔达',typing:true,character:'灯'};
      const rows = [];
      for (const time of [0,.13,.26,.39,.52]) {
        A.paint(fixture,time,options);
        rows.push([...fixture.querySelectorAll('[data-cast]')].map(n => ({who:n.dataset.cast,role:n.dataset.role,gaze:Number(n.dataset.gaze),open:n.querySelector('.cast-mouth').dataset.open})));
      }
      const frozen = fixture.innerHTML;
      A.paint(fixture,90,{...options,paused:true});
      const pauseOK = fixture.innerHTML === frozen;
      A.paint(fixture,1,{...options,reduced:true});const reduced = fixture.innerHTML;
      A.paint(fixture,8,{...options,reduced:true});const reducedOK = fixture.innerHTML === reduced;
      A.paint(fixture,2,{...options,character:'。'});
      const punctuationOK = [...fixture.querySelectorAll('.cast-mouth')].every(n=>n.dataset.open==='false');
      const head = document.querySelector('#world #rigHead'), old = head.getAttribute('transform');
      head.setAttribute('transform','rotate(17 0 -87)');
      A.paint(document.querySelector('#world'),2,{working:true});
      const contactOK = head.getAttribute('transform') === 'rotate(17 0 -87)';
      head.setAttribute('transform',old || '');
      const stateOK = JSON.stringify(HildaTest.state()) === stateBefore;
      // A new scene/portrait subtree must replace the cached nodes explicitly.
      const stale = fixture.querySelector('[data-cast="妈妈"] .cast-mouth');
      fixture.innerHTML = fixture.innerHTML; A.refresh(fixture); A.paint(fixture,.1,options);
      const refreshOK = !stale.isConnected && fixture.querySelector('[data-cast="妈妈"]').dataset.role === 'speaker';
      return {rows,pauseOK,reducedOK,punctuationOK,contactOK,stateOK,refreshOK};
    }''')
    check('SVG attention follows the speaker on both normal and mirrored actors', all(r[0]['gaze'] > 0 and r[1]['gaze'] > 0 and r[2]['gaze'] < 0 and r[3]['gaze'] < 0 for r in result['rows']))
    check('Only the nominated fixture speaker has an animated mouth', all(all(n['open'] == 'false' for n in r[:3]) for r in result['rows']) and any(r[3]['open'] == 'true' for r in result['rows']))
    for label, key in [('Paused fixture retains exactly its rendered pose','pauseOK'),('Reduced-motion acting is time-invariant','reducedOK'),('Punctuation closes mouths in rendered SVG','punctuationOK'),('Attention does not overwrite the contact-driven head transform','contactOK'),('Acting does not mutate any gameplay or save state','stateOK'),('Cache refresh replaces detached scene and portrait nodes','refreshOK')]:
        check(label, result[key])
    page.locator('#actingFixture').screenshot(path=str(ROOT / 'previews' / 'cast-acting-v3.4.png'))
    page.evaluate("document.querySelector('#actingFixture').remove()")
    page.close()
    check('No uncaught runtime exceptions in acting checks', not ERRORS)
    check('No external asset requests in acting checks', not REQUESTS)

if __name__ == '__main__':
    (ROOT / 'previews').mkdir(exist_ok=True)
    failure = None
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True)
        try:
            main(browser)
        except Exception:
            failure = traceback.format_exc()
            print(failure, flush=True)
        finally:
            report = {'passed': failure is None, 'checks_passed':len(CHECKS), 'checks':CHECKS, 'failure':failure, 'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(), 'browser':browser.version, 'scope':'Real Chromium dialogue UI plus isolated SVG acting fixture; explicit in-memory save adapter. Not physical-phone, native-persistence or subjective art certification.'}
            (ROOT/'acting-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
            browser.close()
    raise SystemExit(1 if failure else 0)

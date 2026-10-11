"""iPad/WebKit-like motion regression: touch + prefers-reduced-motion + sparse frames.
Uses Chromium emulation to reproduce media-query behavior; this is not physical Safari certification.
"""
from pathlib import Path
import hashlib,json,os,traceback,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(); SHA=hashlib.sha256(HTML.encode()).hexdigest(); OUT=ROOT/'previews/v3.8';OUT.mkdir(parents=True,exist_ok=True)
CHECKS=[]
def check(name,ok): assert ok,name; CHECKS.append({'name':name,'passed':True}); print('PASS',len(CHECKS),name,flush=True)
def main(browser):
    context=browser.new_context(viewport={'width':1180,'height':820},device_scale_factor=2,has_touch=True,is_mobile=True,reduced_motion='reduce',user_agent='Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1')
    page=context.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_default_timeout(30000)
    page.evaluate("window.__HILDA_TEST_REQUESTED__=true; const m=new Map(); window.storageSnapshot=()=>Object.fromEntries(m); Object.defineProperty(window,'localStorage',{value:{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>Array.from(m.keys())[i]||null,get length(){return m.size}},configurable:true});")
    page.set_content(HTML,wait_until='load');page.wait_for_timeout(100)
    check('iPad-style context reports reduced motion',page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
    page.locator('#startBtn').tap();
    while True:
        u=page.evaluate('HildaTest.ui()')
        if u['dialogue']: page.keyboard.press('Space');page.wait_for_timeout(50);continue
        if not (u['locked'] or u['moving'] or u['working'] or u['dialogue']): break
        page.wait_for_timeout(60)
    check('Fresh iPad-style game honors reduced preference without disabling play',page.evaluate('HildaTest.state().settings.reduced===true'))
    page.locator('[data-hotspot="lamp"]').tap();page.wait_for_function('HildaTest.ui().working')
    p0=page.evaluate('HildaTest.ui().performance.progress');page.wait_for_timeout(260);p1=page.evaluate('HildaTest.ui().performance.progress')
    check('Essential pickup is not compressed to the old 300ms fast-forward',p0<.2 and p1<.45)
    page.wait_for_function('HildaTest.ui().performance && HildaTest.ui().performance.progress > .5')
    check('Reduced-motion pickup still renders the held object',page.locator('[data-held-item="lamp"]').count()==1)
    page.wait_for_function('!HildaTest.ui().working');check('Pickup completes normally',page.evaluate("HildaTest.state().inventory.includes('lamp')"))
    # Dialogue text must remain readable, not 10 ms per glyph.
    page.evaluate("Homeward.use('engine/runtime').say([['希尔达','这句话应该以正常节奏出现，而不是在平板上一闪而过。']])")
    page.wait_for_timeout(120);text=page.locator('#line').inner_text();full='这句话应该以正常节奏出现，而不是在平板上一闪而过。'
    check('Reduced-motion dialogue is not instant fast-forward',0<len(text)<len(full))
    page.keyboard.press('Space');page.keyboard.press('Space')
    # Pure staging regression: reduced mode still communicates essential relocation.
    result=page.evaluate('''()=>{const A=Homeward.use('engine/action-track').ActionTrack,M=Homeward.use('engine/setpiece-motion');
      const t=new A(2800,{effect:'clockPad',accessY:617});t.advance(1400);const a=M.actor({x:789,y:833,face:1},t,true);
      const s=HildaTest.state();s.f.davidSafe=false;const r=new A(2000,{effect:'roofRescue'});r.advance(1400);const cast=M.cast(s,r,true);
      return {clockY:a.y,david:cast.david};}''')
    check('Reduced motion preserves essential climb staging',result['clockY']<700)
    check('Reduced motion preserves essential rescue staging',result['david'][0]<650)
    check('No runtime exceptions in iPad-style motion regression',not errors)
    context.close()
if __name__=='__main__':
    failure=None
    with sync_playwright() as pw:
      b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
      try:main(b)
      except Exception: failure=traceback.format_exc();print(failure,flush=True)
      finally:
       (OUT/'ipad-motion-report.json').write_text(json.dumps({'passed':failure is None,'checks_passed':len(CHECKS),'checks':CHECKS,'failure':failure,'artifact_sha256':SHA,'browser':b.version,'scope':'Chromium emulation of iPad touch, Safari UA and prefers-reduced-motion; not physical WebKit certification.'},ensure_ascii=False,indent=2));b.close()
    raise SystemExit(1 if failure else 0)

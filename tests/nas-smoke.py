"""Post-publication check against the real NAS HTTPS origin in a fresh browser profile."""
from pathlib import Path
import hashlib,json,os,traceback
from playwright.sync_api import sync_playwright
from playthrough import settle,state
ROOT=Path(__file__).resolve().parents[1]
VERSION=json.loads((ROOT/'package.json').read_text())['version']
OUT=ROOT/('previews/v'+'.'.join(VERSION.split('.')[:2]))
URL='https://games.hackerlife.fun:8443/hilda/'
CHECKS=[]
def check(name,ok):
    assert ok,name
    CHECKS.append({'name':name,'passed':True});print('PASS',len(CHECKS),name,flush=True)

def main(browser):
    manifest=json.loads((ROOT/'build-manifest.json').read_text());expected=manifest['sha256']
    context=browser.new_context(viewport={'width':1600,'height':900})
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    response=page.goto(URL+'?test&v='+manifest['version'],wait_until='load',timeout=40000)
    check('Public NAS serves the byte-identical tested build',response.status==200 and hashlib.sha256(response.body()).hexdigest()==expected)
    check('Published title footer shows the new version',('V'+'.'.join(manifest['version'].split('.')[:2])) in page.locator('.titleFooter').inner_text())
    page.locator('#startBtn').click();settle(page)
    check('Native HTTPS game starts with the enlarged home actor',page.locator('#performer').get_attribute('data-scale')=='1.92')
    check('Published Twig has four articulated legs and NPCs have independent hands',page.locator('#twigPosition [data-twig-leg]').count()==4 and page.locator('#world [data-cast="妈妈"] [data-rest-arm]').count()==2)
    check('Published game hides automatic scene and task overlays',page.evaluate("['sceneLabel','chapterCard','actionLabel'].every(id=>getComputedStyle(document.getElementById(id)).display==='none')"))
    page.keyboard.press('Escape')
    eyes=page.evaluate('''()=>{
      const root=document.querySelector('#world'),cast=Homeward.use('art/cast-acting');let drift=0,minimum=1;
      for(let i=0;i<700;i++){cast.paint(root,i/100,{scene:0});for(const eye of root.querySelectorAll('#rigEyes,.cast-blink')){
        const m=eye.parentNode.getCTM().inverse().multiply(eye.getCTM()),v=new DOMPoint(0,-111).matrixTransform(m);
        drift=Math.max(drift,Math.hypot(v.x,v.y+111));minimum=Math.min(minimum,m.d);
      }}return {drift,minimum};
    }''')
    check('Published human eyes stay on the face during fully closed blinks',eyes['drift']<.01 and eyes['minimum']<.1)
    page.locator('#resumePlay').click()
    page.locator('#world').click(position={'x':1140,'y':810})
    page.wait_for_function('Math.abs(HildaTest.ui().pet.speed)>40')
    check('Native NAS interaction starts the independent companion follow',True)
    settle(page)
    page.screenshot(path=str(OUT/'nas-home.png'))
    page.locator('[data-hotspot="lamp"] .hit').click();settle(page)
    check('Real NAS pointer input completes the new lamp pickup',state(page)['inventory'].count('lamp')==1 and page.locator('#homeLamp').count()==0)
    page.evaluate('HildaTest.flush()');page.reload(wait_until='load');page.locator('#continueBtn').click();settle(page)
    check('Native HTTPS storage preserves progress through a real reload',state(page)['inventory'].count('lamp')==1 and page.evaluate('HildaTest.ui().storageOK'))
    alias=context.request.get(URL+'hilda-homeward-v2.html?v='+manifest['version'],timeout=30000)
    check('Legacy NAS entry serves the same new build',alias.status==200 and hashlib.sha256(alias.body()).hexdigest()==expected)
    # A locally captured chapter is an isolated online interaction regression,
    # not another full playthrough. The browser profile is disposable.
    forest=json.loads((ROOT/'tests/fixtures.json').read_text())['2']
    forest['settings']['sound']=False
    page.evaluate('s=>HildaTest.loadFixture(s)',forest);settle(page)
    check('Published forest keeps one reachable rope with protected ground-object depth',page.locator('#forestRope').count()==1 and page.locator('#forestRope').get_attribute('data-scene-depth')=='ground')
    page.locator('[data-hotspot="rope"] .hit').click();settle(page)
    check('Published forest rope can be taken with a real mouse click',state(page)['inventory'].count('rope')==1)
    check('Published game has no uncaught runtime errors',not errors)
    context.close()

if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True);failure=None
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:main(browser)
        except Exception:failure=traceback.format_exc();print(failure,flush=True)
        finally:
            report={'passed':failure is None,'checks':CHECKS,'checks_passed':len(CHECKS),'failure':failure,'url':URL,'browser':browser.version,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'scope':'Native public NAS HTTPS navigation, real mouse input and real localStorage reload. Fresh headless profile; no user browser data touched.'}
            (OUT/'nas-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
    raise SystemExit(1 if failure else 0)

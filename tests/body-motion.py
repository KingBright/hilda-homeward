"""Browser verification of scene scale, contact, pickup transactions and interrupted saves.
Includes scene fixtures captured by the existing full UI playthrough; not a second full run.
"""
from pathlib import Path
import copy,hashlib,json,os,traceback
from playwright.sync_api import sync_playwright
from playthrough import newpage,settle,state,ui,ERRORS,REQUESTS
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/v3.5';OUT.mkdir(parents=True,exist_ok=True)
CHECKS=[]
def check(name,condition):
    assert condition,name
    CHECKS.append({'name':name,'passed':True});print('PASS',len(CHECKS),name,flush=True)

def capture(page,name):
    page.evaluate("document.querySelector('#panelLayer').style.visibility='hidden'")
    page.screenshot(path=str(OUT/(name+'.png')))
    page.evaluate("document.querySelector('#panelLayer').style.visibility=''")

def pause_at_grasp(page):
    page.wait_for_function('''() => {
      const u=HildaTest.ui();
      if(u.performance?.progress>=.45 && !u.modal){
        document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
        return true;
      }
      return false;
    }''',timeout=20000)

def main(browser):
    fixtures=json.loads((ROOT/'tests/fixtures.json').read_text())
    p=newpage(browser);p.locator('#startBtn').click();settle(p)
    p.keyboard.press('Escape');capture(p,'home-after')
    metrics=p.evaluate('''() => {
      const head=document.querySelector('#rigHead'),eye=new DOMPoint(0,-111).matrixTransform(head.getCTM());
      const w=document.querySelector('#homeWindow'),sill=new DOMPoint(0,517).matrixTransform(w.getCTM());
      const m=document.querySelector('#world [data-cast="妈妈"]'),h=document.querySelector('#performer');
      return {eye:eye.y,sill:sill.y,heroScale:Number(h.dataset.scale),adultScale:Math.hypot(m.getCTM().a,m.getCTM().b)};
    }''')
    check('Home child face is above the lowered window sill',metrics['eye']+25<metrics['sill'])
    check('Home child is enlarged and adult retains believable relative height',metrics['heroScale']==1.92 and 1.15<metrics['adultScale']/1.92<1.4)
    p.locator('#resumePlay').click()
    # Verify lamp action through supported keyboard input, with a saved interruption.
    p.locator('[data-hotspot="lamp"]').focus();p.locator('[data-hotspot="lamp"]').press('Enter');pause_at_grasp(p)
    check('Lamp is grasped before the inventory transaction commits','lamp' not in state(p)['inventory'] and not state(p)['f'].get('lampTaken'))
    check('Grasp shows a held lamp and hides only its stage source',p.locator('[data-held-item="lamp"]').count()==1 and p.locator('#homeLamp').evaluate("n=>getComputedStyle(n).visibility==='hidden'"))
    contact=p.evaluate('''() => {
      const h=document.querySelector('#rigHandFront'),point=new DOMPoint(0,0).matrixTransform(h.getCTM());
      const w=document.querySelector('#world'),target=HildaTest.ui().performance.score.target;
      const contact=new DOMPoint(...target).matrixTransform(w.getCTM());
      return Math.hypot(point.x-contact.x,point.y-contact.y);
    }''')
    check('Rendered hand actually reaches the lamp ring, not an off-screen proxy',contact<3)
    capture(p,'lamp-grasp')
    before=p.locator('#rigArmFront').get_attribute('d');p.wait_for_timeout(250)
    check('Paused pickup freezes the actual articulated hand',before==p.locator('#rigArmFront').get_attribute('d'))
    p.evaluate('HildaTest.flush()');saved=p.evaluate('storageSnapshot()')
    q=newpage(browser,storage=saved);q.locator('#continueBtn').click();settle(q)
    check('Reload during grasp restores the lamp instead of losing or duplicating it',not state(q)['f'].get('lampTaken') and 'lamp' not in state(q)['inventory'] and q.locator('#homeLamp').count()==1)
    q.close();p.locator('#resumePlay').click();settle(p)
    check('Completion commits the lamp exactly once and removes the source',state(p)['inventory'].count('lamp')==1 and p.locator('#homeLamp').count()==0)
    check('Hand returns to an open idle pose after stowing',p.locator('#performer').get_attribute('data-grip')=='open')
    p.close()
    for scene,id,item,source in [(1,'crank','crank','northCrank'),(2,'rope','rope','forestRope'),(5,'line','line','gondolaLine'),(7,'gearS','gearS','pickup-gearS'),(7,'gearM','gearM','pickup-gearM'),(7,'gearL','gearL','pickup-gearL'),(8,'felt','felt','clockFelt')]:
        f=copy.deepcopy(fixtures[str(scene)])
        f['settings']['reduced']=False;f['settings']['sound']=False
        if scene==1:f['f']['awning']=True
        p=newpage(browser);p.evaluate('s=>HildaTest.loadFixture(s)',f);settle(p)
        p.locator('[data-hotspot="'+id+'"]').focus();p.locator('[data-hotspot="'+id+'"]').press('Enter');pause_at_grasp(p)
        check(f'{scene}/{item} has a visible grasp before inventory commit',p.locator('[data-held-item="'+item+'"]').count()==1 and item not in state(p)['inventory'])
        check(f'{scene}/{item} hides its source only during transfer',p.locator('#'+source).evaluate("n=>getComputedStyle(n).visibility==='hidden'"))
        if id in ['gearL','line','felt']:capture(p,id+'-grasp')
        p.locator('#resumePlay').click();settle(p)
        check(f'{scene}/{item} completes and stows once',state(p)['inventory'].count(item)==1)
        p.close()
    # Existing save fixtures still traverse all scenes with the newly scaled renderers.
    p=newpage(browser)
    for scene in range(12):
        f=copy.deepcopy(fixtures[str(scene)]);f['settings']['sound']=False
        p.evaluate('s=>HildaTest.loadFixture(s)',f);settle(p)
        check(f'Chapter {scene} renders with finite actor geometry',p.evaluate("[...document.querySelectorAll('#performer path')].every(n=>!/(NaN|Infinity|undefined)/.test(n.getAttribute('d')||''))"))
        if scene in [7,8,11]:p.keyboard.press('Escape');capture(p,'scene-'+str(scene));p.locator('#resumePlay').click()
    p.close()
    p=newpage(browser,844,390,True);p.locator('#startBtn').tap();settle(p)
    p.locator('[data-hotspot="lamp"]').tap();settle(p)
    check('Landscape touch follows the same lamp pickup transaction',state(p)['inventory'].count('lamp')==1)
    p.close()
    check('No uncaught browser exceptions',not ERRORS)
    check('No external asset requests',not REQUESTS)
    return metrics

if __name__=='__main__':
    failure=None;metrics={}
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:metrics=main(b)
        except Exception:failure=traceback.format_exc();print(failure,flush=True)
        finally:
            report={'passed':failure is None,'checks_passed':len(CHECKS),'checks':CHECKS,'metrics':metrics,'failure':failure,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'browser':b.version,'scope':'Real Chromium keyboard and touch-emulated events; recorded scene fixtures and explicit in-memory storage adapter. Native storage verified separately.'}
            (OUT/'body-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
    raise SystemExit(1 if failure else 0)

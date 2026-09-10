"""Rendered eye attachment, mirrored limbs, quiet scenes and real foreground-object input.
Uses recorded scene fixtures for regression, not a substitute for the full playthrough.
"""
from pathlib import Path
import copy,hashlib,json,os,traceback
from playwright.sync_api import sync_playwright
from playthrough import newpage,settle,state,ERRORS,REQUESTS
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/v3.7';OUT.mkdir(parents=True,exist_ok=True)
CHECKS=[]
def check(name,ok):
    assert ok,name
    CHECKS.append({'name':name,'passed':True});print('PASS',len(CHECKS),name,flush=True)

def main(browser):
    p=newpage(browser);p.locator('#startBtn').click();settle(p);p.keyboard.press('Escape')
    result=p.evaluate('''() => {
      const C=Homeward.use('art/cast-design'),N=Homeward.use('art/cast-acting'),A=Homeward.use('art/creature-life'),S=Homeward.use('art/species-life');
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='presentationGallery';svg.setAttribute('viewBox','0 0 1200 630');
      svg.setAttribute('class','paused');svg.style.cssText='position:fixed;left:20px;top:20px;width:1200px;height:630px;z-index:10000;background:#203a42;border-radius:12px';
      const names=['希尔达','大卫','芙丽达','妈妈','阿尔弗','枝枝','小巨魔','巨魔妈妈','沃夫'];
      svg.innerHTML=names.map((name,i)=>{
        let art=i<4?C.standing(name):i===4?C.elf():i===5?C.twig():i<8?C.troll(i===7):C.woff();
        let scale=i<4?1.15:i===4?1.45:i===5?1.8:i<8?1.15:1.1;
        let x=i<5?120+i*235:180+(i-5)*275,y=i<5?242:i===8?480:565;
        return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+art+'</g><text x="'+x+'" y="'+(i<5?275:605)+'" text-anchor="middle" fill="#ead7b1" font-size="16">'+name+'</text>';
      }).join('');document.body.append(svg);N.refresh(svg);A.refresh(svg);S.refresh(svg);
      const xml=new DOMParser().parseFromString(svg.outerHTML,'image/svg+xml');
      let drift=0,minScale=1;const observed=new Set();
      for(let i=0;i<1100;i++){
        const t=i/100;N.paint(svg,t);A.paint(svg,t);S.paint(svg,t);
        for(const eye of svg.querySelectorAll('.cast-blink,#rigEyes,[data-life-eye],.twig-eye')){
          const y=eye.hasAttribute('data-eye-y')?Number(eye.dataset.eyeY):eye.classList.contains('twig-eye')?-42:-111;
          const m=eye.parentNode.getCTM().inverse().multiply(eye.getCTM()),v=new DOMPoint(0,y).matrixTransform(m);
          drift=Math.max(drift,Math.hypot(v.x,v.y-y));minScale=Math.min(minScale,m.d);observed.add(eye.closest('[data-cast]').dataset.cast);
        }
      }
      N.paint(svg,0,{reduced:true});A.paint(svg,0,{reduced:true});S.paint(svg,0,{reduced:true});
      const limbs=[...svg.querySelectorAll('[data-rest-arm]')].map(n=>{const nums=n.querySelector('path').getAttribute('d').match(/-?\\d+(?:\\.\\d+)?/g).map(Number),a=[nums[2]-nums[0],nums[3]-nums[1]],b=[nums[4]-nums[2],nums[5]-nums[3]];return {name:n.dataset.restArm,nums,bend:Math.acos(Math.max(-1,Math.min(1,(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b)))))*180/Math.PI,det:n.querySelector('.rest-hand').getCTM().a*n.querySelector('.rest-hand').getCTM().d-n.querySelector('.rest-hand').getCTM().b*n.querySelector('.rest-hand').getCTM().c};});
      const frozen=svg.innerHTML;N.paint(svg,8,{paused:true});A.paint(svg,8,{paused:true});S.paint(svg,8,{paused:true});const paused=frozen===svg.innerHTML;
      N.paint(svg,9,{reduced:true});A.paint(svg,9,{reduced:true});S.paint(svg,9,{reduced:true});const reduced=frozen===svg.innerHTML;
      return {drift,minScale,observed:[...observed],limbs,paused,reduced,xmlValid:!xml.querySelector('parsererror')};
    }''')
    check('All nine named cast members retain attached eyes throughout open and closed blink frames',len(result['observed'])==9 and result['drift']<.01 and result['minScale']<.1)
    check('Rendered neutral human elbows are less than 35 degrees bent',len(result['limbs'])==8 and all(5<l['bend']<35 for l in result['limbs']))
    check('Rendered left palms are mirrored and right palms retain their own handedness',all(l['det']<0 if l['name']=='back' else l['det']>0 for l in result['limbs']))
    check('Expanded species drawings remain structurally valid SVG',result['xmlValid'])
    check('Pause and reduced motion freeze human and nonhuman face layers',result['paused'] and result['reduced'])
    p.locator('#presentationGallery').screenshot(path=str(OUT/'cast-corrected.png'))
    p.evaluate("document.querySelector('#presentationGallery').remove();document.querySelector('#panelLayer').style.visibility='hidden'")
    p.screenshot(path=str(OUT/'home-quiet.png'));p.close()
    fixtures=json.loads((ROOT/'tests/fixtures.json').read_text())
    p=newpage(browser)
    for scene in range(12):
        f=copy.deepcopy(fixtures[str(scene)]);f['settings']['sound']=False
        p.evaluate('s=>HildaTest.loadFixture(s)',f);settle(p)
        quiet=p.evaluate('''() => ({labels:[...document.querySelectorAll('#world text')].map(n=>n.textContent).filter(t=>/[\\u3400-\\u9fff]/u.test(t)),hud:['sceneLabel','chapterCard','actionLabel'].every(id=>getComputedStyle(document.getElementById(id)).display==='none'),ids:(()=>{const a=[...document.querySelectorAll('#world [id]')].map(n=>n.id);return a.length===new Set(a).size})()})''')
        check(f'Chapter {scene} has no prose placards or automatic guide overlay',quiet['hud'] and not quiet['labels'])
        check(f'Chapter {scene} retains unique SVG IDs after foreground-object promotion',quiet['ids'])
    f=copy.deepcopy(fixtures['2']);f['settings']['sound']=False
    p.evaluate('s=>HildaTest.loadFixture(s)',f);settle(p)
    check('Forest rope and winch drawings sit above the companion layer without being duplicated',p.locator('#interactionObjects #forestRope').count()==1 and p.locator('#interactionObjects #forestWinch').count()==1 and p.locator('#forestRope').count()==1)
    separation=p.evaluate('''() => {const rope=document.querySelector('#forestRope').getBoundingClientRect(),d=document.querySelector('#davidFollow').getBoundingClientRect();return d.left-rope.right;}''')
    check('Waiting David no longer stands on the ground rope',separation>=0)
    p.screenshot(path=str(OUT/'forest-rope-clear.png'))
    p.locator('[data-hotspot="rope"] .hit').click();settle(p)
    check('Real pointer input picks up the rope instead of starting NPC conversation',state(p)['inventory'].count('rope')==1 and p.locator('#forestRope').count()==0)
    p.locator('[data-hotspot="hook"] .hit').click();p.wait_for_function('!!HildaTest.ui().dialogue');
    check('Investigation expresses the missing tool through character dialogue',p.locator('#speech').is_visible() and p.locator('#speaker').inner_text()=='希尔达')
    settle(p);p.close()
    q=newpage(browser,844,390,True);f=copy.deepcopy(fixtures['2']);f['settings']['reduced']=True
    q.evaluate('s=>HildaTest.loadFixture(s)',f);settle(q);q.locator('[data-hotspot="rope"] .hit').tap();settle(q)
    check('Touch and reduced motion use the same protected rope hit target',state(q)['inventory'].count('rope')==1);q.close()
    check('Presentation suite has no uncaught JavaScript exceptions',not ERRORS)
    check('Quiet-world and species changes need no external assets',not REQUESTS)
    return {'max_eye_anchor_drift_local':result['drift'],'cast_covered':result['observed'],'elbow_angles':[l['bend'] for l in result['limbs']],'rope_companion_gap_pixels':separation}

if __name__=='__main__':
    failure=None;metrics={}
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:metrics=main(browser)
        except Exception:failure=traceback.format_exc();print(failure,flush=True)
        finally:
            report={'passed':failure is None,'checks_passed':len(CHECKS),'checks':CHECKS,'metrics':metrics,'failure':failure,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'browser':browser.version,'scope':'Real Chromium renderer, pointer and touch-emulated interaction, recorded scene fixtures and explicit storage adapter; full adventure and native persistence are separate suites.'}
            (OUT/'presentation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
    raise SystemExit(1 if failure else 0)

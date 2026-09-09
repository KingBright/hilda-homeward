"""Live keyboard/pointer animal follow tests plus an explicitly isolated acting fixture.
Storage uses the shared in-memory test adapter; native persistence is a separate suite.
"""
from pathlib import Path
import hashlib,json,os,traceback
from playwright.sync_api import sync_playwright
from playthrough import newpage,settle,ERRORS,REQUESTS
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/v3.6';OUT.mkdir(parents=True,exist_ok=True)
CHECKS=[]
def check(name,ok):
    assert ok,name
    CHECKS.append({'name':name,'passed':True});print('PASS',len(CHECKS),name,flush=True)

def main(browser):
    p=newpage(browser);p.locator('#startBtn').click();settle(p)
    check('Running game uses four independent articulated Twig legs',p.locator('#twigPosition [data-twig-leg]').count()==4)
    check('NPC shoulders and hands are independently articulated',p.locator('#world [data-cast="妈妈"] [data-rest-arm]').count()==2)
    p.locator('#world').click(position={'x':1170,'y':810})
    frames=p.evaluate('''async()=>{
      const frames=[];
      for(let i=0;i<95;i++){
        const a=document.querySelector('#twigPosition [data-animal-rig]'),base=document.querySelector('#world').getCTM().inverse();
        frames.push({x:HildaTest.ui().pet.x,speed:HildaTest.ui().pet.speed,face:a.dataset.facing,
          legs:[...a.querySelectorAll('[data-twig-leg]')].sort((a,b)=>Number(a.dataset.twigLeg)-Number(b.dataset.twigLeg)).map(n=>{
            const m=base.multiply(n.querySelector('.twig-hoof').getCTM());return {planted:n.dataset.planted==='true',contact:n.dataset.contact,x:m.e,y:m.f,d:n.querySelector('path').getAttribute('d')};})});
        await new Promise(r=>setTimeout(r,18));
      }return frames;
    }''')
    check('Actual following accelerates and traverses the room',max(f['speed'] for f in frames)>70 and max(f['x'] for f in frames)-min(f['x'] for f in frames)>120)
    check('All four limbs change shape, not only the parent translation',all(len(set(f['legs'][k]['d'] for f in frames))>12 for k in range(4)))
    slip=0;pairs=0
    for a,b in zip(frames,frames[1:]):
        if a['face']!=b['face']:continue
        for l,r in zip(a['legs'],b['legs']):
            if l['planted'] and r['planted'] and l['contact']==r['contact']:
                slip=max(slip,((l['x']-r['x'])**2+(l['y']-r['y'])**2)**.5);pairs+=1
    (OUT/'hoof-frames.json').write_text(json.dumps({'slip':slip,'pairs':pairs,'frames':frames},ensure_ascii=False))
    check(f'Rendered support hooves remain planted (drift {slip:.4f}, pairs {pairs})',pairs>30 and slip<.15)
    settle(p);p.wait_for_function('Math.abs(HildaTest.ui().pet.speed)<.001',timeout=12000);p.wait_for_timeout(850)
    before=p.evaluate('HildaTest.ui().pet.x');p.wait_for_timeout(250)
    check('Arrival reaches a real stop rather than an endless exponential slide',abs(before-p.evaluate('HildaTest.ui().pet.x'))<.001)
    p.locator('#world').click(position={'x':650,'y':810})
    p.wait_for_function('HildaTest.ui().pet.turn>0',timeout=5000)
    check('Reversing the hero first produces a stopped companion turn',p.evaluate('HildaTest.ui().hero.face===-1 && HildaTest.ui().pet.speed===0'))
    p.wait_for_timeout(320);p.keyboard.press('Escape')
    frozen=p.locator('#twigPosition').inner_html();human=p.locator('#world [data-cast="妈妈"] .cast-rest-upper').inner_html();position=p.evaluate('HildaTest.ui().pet.x')
    p.wait_for_timeout(220)
    check('Pause freezes paws, face, NPC gesture and actual companion movement',frozen==p.locator('#twigPosition').inner_html() and human==p.locator('#world [data-cast="妈妈"] .cast-rest-upper').inner_html() and position==p.evaluate('HildaTest.ui().pet.x'))
    p.evaluate("document.querySelector('#panelLayer').style.visibility='hidden'");p.screenshot(path=str(OUT/'living-home.png'));p.evaluate("document.querySelector('#panelLayer').style.visibility=''")
    p.locator('#resumePlay').click();settle(p)
    p.keyboard.press('Escape')
    result=p.evaluate('''()=>{
      const C=Homeward.use('art/cast-design'),N=Homeward.use('art/cast-acting'),A=Homeward.use('art/creature-life');
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='lifeFixture';svg.setAttribute('viewBox','0 0 1100 490');
      svg.setAttribute('class','paused');svg.style.cssText='position:fixed;left:20px;top:20px;width:1100px;height:490px;z-index:10000;background:#203940;border:1px solid #80948a;border-radius:12px';
      svg.innerHTML='<path d="M30 312H1070M30 456H1070" stroke="#769389" opacity=".4"/>'+['希尔达','大卫','芙丽达','妈妈'].map((who,i)=>'<g id="'+(i===1?'roofDavid':'life'+i)+'" transform="translate('+(170+i*240)+' 300) scale(1.5)">'+C.standing(who)+'</g><text x="'+(170+i*240)+'" y="337" text-anchor="middle" fill="#e2d6b2" font-size="16">'+who+'</text>').join('')+'<g transform="translate(360 452) scale(1.25)">'+C.twig()+'</g><text x="520" y="412" fill="#e2d6b2" font-size="16">四足落地 · 停步嗅闻 · 耳朵与尾巴独立动作</text>';
      document.body.append(svg);N.refresh(svg);A.refresh(svg);
      const snap=()=>[...svg.querySelectorAll('.cast-leg-front,.cast-leg-back')].map(n=>{const m=n.getCTM();return [m.e,m.f];});
      const feet=snap(),beats=new Map(),modes=new Set();
      for(let i=0;i<360;i++){
        const t=i/20;N.paint(svg,t);A.paint(svg,t,{ground:()=>452});
        for(const n of svg.querySelectorAll('[data-cast-head]')){const actor=n.closest('[data-cast]');if(!beats.has(actor.dataset.cast))beats.set(actor.dataset.cast,new Set());beats.get(actor.dataset.cast).add(actor.dataset.idle);}
        modes.add(svg.querySelector('[data-animal-rig]').dataset.life);
      }
      const fixedFeet=JSON.stringify(feet)===JSON.stringify(snap());
      N.paint(svg,12,{scene:9,flags:{roofBrace:true}});
      const hand=svg.querySelector('#roofDavid [data-rest-arm="front"]').outerHTML;
      N.paint(svg,16,{scene:9,flags:{roofBrace:true}});
      const braceStable=hand===svg.querySelector('#roofDavid [data-rest-arm="front"]').outerHTML;
      N.paint(svg,1,{reduced:true});A.paint(svg,1,{reduced:true,ground:()=>452});const still=svg.innerHTML;
      N.paint(svg,80,{reduced:true});A.paint(svg,80,{reduced:true,ground:()=>452});const reducedStable=still===svg.innerHTML;
      for(let i=0;i<110;i++){N.paint(svg,i/20);A.paint(svg,i/20,{ground:()=>452});}
      return {fixedFeet,braceStable,reducedStable,beats:Object.fromEntries([...beats].map(([k,v])=>[k,[...v]])),modes:[...modes]};
    }''')
    check('Standing NPC feet do not rise with the breathing or shoulder layer',result['fixedFeet'])
    check('Each main human has a distinct idle habit and real quiet intervals',all('rest' in v and len(v)>=3 for v in result['beats'].values()))
    check('Idle Twig visibly alternates rest, sniffing and listening',all(m in result['modes'] for m in ['rest','sniff','listen']))
    check('A bracing NPC keeps both hands on its assigned action',result['braceStable'])
    check('Reduced-motion humans and animal are exactly time invariant',result['reducedStable'])
    p.locator('#lifeFixture').screenshot(path=str(OUT/'life-study.png'))
    p.evaluate("document.querySelector('#lifeFixture').remove()")
    p.close()
    q=newpage(browser,844,390,True);q.locator('#startBtn').tap();settle(q)
    q.locator('[data-hotspot="lamp"]').tap();settle(q)
    check('Touch input and real pickup still work with the new companion',q.evaluate('HildaTest.state().inventory.includes("lamp")'))
    q.close()
    check('Life suite has no uncaught JavaScript exceptions',not ERRORS)
    check('Life suite requires no external assets',not REQUESTS)
    return {'max_planted_hoof_drift':slip,'measured_support_pairs':pairs,'idle_beats':result['beats'],'animal_modes':result['modes']}

if __name__=='__main__':
    failure=None;metrics={}
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:metrics=main(browser)
        except Exception:failure=traceback.format_exc();print(failure,flush=True)
        finally:
            report={'passed':failure is None,'checks_passed':len(CHECKS),'checks':CHECKS,'failure':failure,'metrics':metrics,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'browser':browser.version,'scope':'Live pointer/keyboard follow and touch emulation, explicit storage adapter, isolated deterministic acting fixture. Not physical-phone or subjective art certification.'}
            (OUT/'life-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
    raise SystemExit(1 if failure else 0)

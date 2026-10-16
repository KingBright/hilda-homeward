"""Rendered transition endpoints and interruption checks; isolated fixtures, not a playthrough."""
import hashlib,json,os,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
from playthrough import newpage,settle,state,ui,act,drag_object,ERRORS,REQUESTS

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/v3.9'
OUT.mkdir(parents=True,exist_ok=True)
CHECKS=[]

def check(name,ok):
    if not ok: raise AssertionError(name)
    CHECKS.append(name)
    print('PASS',name,flush=True)

def load_scene(page,scene,flags=None,weights=None,reduced=False):
    page.evaluate('''o=>{
      const s=Homeward.use('engine/state').fresh();s.scene=o.scene;s.heroX=o.scene===10?634:875;
      const milestones=['','promise','gateOpen','bridge','planTaken','pump','lift','calm','towerGate','heart','roofDone'];
      for(let i=1;i<=o.scene;i++)s.f[milestones[i]]=true;
      if(s.f.pump)s.f.pumpPrimed=true;if(s.f.towerGate)s.f.gearAligned=true;
      Object.assign(s.f,o.flags);s.weights=o.weights;s.inventory=['lamp'];s.settings.sound=false;s.settings.relaxed=true;s.settings.reduced=o.reduced;
      HildaTest.loadFixture(s);
    }''',{'scene':scene,'flags':flags or {},'weights':weights or [],'reduced':reduced})
    settle(page)

def main(browser):
    p=newpage(browser)
    check('Title hides the player and inactive game buttons',p.evaluate("getComputedStyle(document.querySelector('#actors')).visibility==='hidden' && getComputedStyle(document.querySelector('#hud')).opacity==='0'"))
    metrics=p.evaluate('''()=>{
      const Art=Homeward.use('art'),State=Homeward.use('engine/state'),Life=Homeward.use('art/chapter-life'),Track=Homeward.use('engine/action-track').ActionTrack;
      const results=[];
      function mount(s){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1600 900');svg.style.cssText='position:fixed;left:-2000px;top:0;width:1600px;height:900px';svg.innerHTML=Art.defs+Art.scene(s)+'<g id="actionFX"></g>';document.body.append(svg);return svg;}
      function anchors(root,selector){const n=root.querySelector(selector);if(!n)throw Error(selector);const m=n.getCTM();const points=n.getPointAtLength?[n.getPointAtLength(0),n.getPointAtLength(n.getTotalLength())]:[new DOMPoint(0,0),new DOMPoint(30,-40)];return points.map(p=>p.matrixTransform(m));}
      function compare(name,scene,flags,score,after,selectors,weights=[],afterWeights=weights){
        const s=State.fresh();s.scene=scene;s.f=flags;s.weights=weights;
        const before=mount(s),initial=selectors.map(q=>anchors(before,q));
        const action=new Track(1000,score);Life.animate(before,action,s);
        const start=selectors.map(q=>anchors(before,q));action.advance(1000);Life.animate(before,action,s);
        const completed=mount({...s,f:{...flags,...after},weights:afterWeights});
        const end=selectors.map(q=>anchors(before,q)),rest=selectors.map(q=>anchors(completed,q));
        const drift=(a,b)=>Math.max(...a.flatMap((points,i)=>points.map((v,j)=>Math.hypot(v.x-b[i][j].x,v.y-b[i][j].y))));
        results.push({name,startDrift:drift(start,initial),endDrift:drift(end,rest)});before.remove();completed.remove();
      }
      compare('gondola beam',5,{}, {effect:'gondolaWeight',weightValue:3,removing:false},{},['#gondolaBeam'],[1],[1,3]);
      compare('gondola arrival',5,{}, {effect:'gondolaLift'},{lift:true},['#gondolaCabin','#gondolaBrake path'],[1,3]);
      const gears={gearSSet:true,gearMSet:true,gearLSet:true,gearIndex:2};
      compare('tower alignment',7,gears,{effect:'towerAlign',from:2},{gearIndex:3,gearAligned:true},['[data-tower-gear="gearS"]','[data-tower-gear="gearM"]','[data-tower-gear="gearL"]','#towerWitnessMark path']);
      compare('tower alignment wrap',7,{...gears,gearIndex:3},{effect:'towerAlign',from:3},{gearIndex:0},['[data-tower-gear="gearS"]','[data-tower-gear="gearL"]','#towerWitnessMark path']);
      compare('tower gate',7,{...gears,gearIndex:3},{effect:'towerDoor'},{towerGate:true},['#towerGateDoor','#towerLeverArm','[data-tower-gear="gearS"]','#towerWitnessMark path']);
      for(let from=0;from<2;from++)compare('bypass '+from,8,{bypassMounted:true,bypassTurns:from},{effect:'clockBypass',mounted:true,from},{bypassTurns:from+1,bypass:from===1},['#clockGaugeNeedle','#clockBypassWheel path']);
      compare('clock drive',8,{}, {effect:'clockDrive'},{heart:true},['#clockDriveWheel > path']);
      compare('trail hood',10,{}, {effect:'trailHood',node:0},{hood0:true},['#trailHood0 path']);
      compare('ridge reunion',10,{}, {effect:'ridgeReunite'},{reunited:true},['#ridgeChild','#ridgeMotherArm']);
      return results;
    }''')
    for m in metrics:
        check(m['name']+' matches its initial and committed drawing',m['startDrift']<.01 and m['endDrift']<.01)

    load_scene(p,5,weights=[1,3])
    drag_object(p,'weight1',target=[425,691])
    check('Dragging a placed weight back to the floor removes only that weight',state(p)['weights']==[3])
    drag_object(p,'weight1',target=[810,490])
    check('Dragging the same weight to the balance restores the solution',sorted(state(p)['weights'])==[1,3])

    lights={**{'trail'+str(i):True for i in range(3)},**{'hood'+str(i):True for i in range(3)}}
    load_scene(p,10,lights)
    p.locator('[data-hotspot="child"]').click()
    p.wait_for_function('HildaTest.ui().working && HildaTest.ui().performance.progress>.4')
    p.locator('#menuBtn').click()
    frozen=ui(p)['performance']['progress']
    p.wait_for_timeout(300)
    check('Pausing the escort freezes the action before reunion is committed',ui(p)['performance']['progress']==frozen and not state(p)['f'].get('reunited'))
    p.evaluate('HildaTest.flush()')
    interrupted=state(p)
    p.locator('#resumePlay').click()
    p.screenshot(path=str(OUT/'ridge-escort.png'))
    p.evaluate('s=>HildaTest.loadFixture(s)',interrupted)
    settle(p)
    check('Reload during escort restores the safe pre-action position',not state(p)['f'].get('reunited') and ui(p)['hero']['x']==634 and not ui(p)['working'])
    for reduced in [False,True]:
        load_scene(p,10,lights,reduced=reduced)
        p.locator('[data-hotspot="child"]').click()
        p.wait_for_function('HildaTest.ui().working')
        movement=p.evaluate('''()=>new Promise((resolve,reject)=>{
          const node=()=>document.querySelector('#heroPosition'),x=()=>node().transform.baseVal.consolidate().matrix.e;
          let previous=x(),min=previous,max=previous,count=0;const end=performance.now()+8000;
          function step(){const value=x();min=Math.min(min,value);max=Math.max(max,value);count++;
            if(!HildaTest.ui().working)return resolve({travel:max-min,commitJump:Math.abs(value-previous),count});
            if(performance.now()>end)return reject(Error('Escort did not finish'));
            previous=value;requestAnimationFrame(step);
          }requestAnimationFrame(step);
        })''')
        settle(p)
        check(f'Escort moves continuously and commits without teleporting (reduced={reduced})',movement['travel']>300 and movement['commitJump']<1 and state(p)['f'].get('reunited') and ui(p)['hero']['x']==960)
    p.screenshot(path=str(OUT/'ridge-reunited.png'))
    p.close()
    check('No uncaught script errors or external resources',not ERRORS and not REQUESTS)
    return metrics

if __name__=='__main__':
    failure=None;metrics=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:metrics=main(browser)
        except Exception:failure=traceback.format_exc();print(failure,flush=True)
        finally:
            (OUT/'scene-continuity-report.json').write_text(json.dumps({'passed':failure is None,'checks':CHECKS,'metrics':metrics,'failure':failure,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'scope':'Isolated real SVG rendering and UI-driven actions, with explicit in-memory storage; full playthrough and native persistence are separate.'},indent=2))
            browser.close()
    raise SystemExit(1 if failure else 0)

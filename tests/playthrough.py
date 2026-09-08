"""UI playthrough plus isolated regression checks. HTML is loaded into Chromium
with set_content: this environment's navigation policy blocks file/http URLs.
The storage adapter is explicitly simulated, never presented as real persistence.
"""
from pathlib import Path
import json,time,traceback,os,copy,hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CHECKS=[]; ERRORS=[]; REQUESTS=[]; FIXTURES={}; PAGES=[]
START=time.monotonic()
HTML=(ROOT/'index.html').read_text()
HTML_SHA=hashlib.sha256(HTML.encode()).hexdigest()

def check(name,condition=True):
    if not condition: raise AssertionError(name)
    CHECKS.append({'name':name,'passed':True})
    print('PASS',len(CHECKS),name,flush=True)

def newpage(browser,width=1600,height=900,mobile=False,storage=None,blocked=False):
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,has_touch=mobile,is_mobile=mobile)
    PAGES.append(page)
    page.on('pageerror',lambda e:ERRORS.append(str(e)))
    page.on('request',lambda r:REQUESTS.append(r.url))
    page.set_default_timeout(30000)
    page.evaluate('window.__HILDA_TEST_REQUESTED__=true;')
    if blocked:
        page.evaluate("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Test storage refusal','SecurityError')},configurable:true});")
    else:
        page.evaluate("""initial=>{const m=new Map(Object.entries(initial));window.storageSnapshot=()=>Object.fromEntries(m);Object.defineProperty(window,'localStorage',{value:{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear(),key:i=>Array.from(m.keys())[i]||null,get length(){return m.size}},configurable:true});}""",storage or {})
    page.set_content(HTML,wait_until='load')
    page.wait_for_timeout(130)
    return page

def state(p): return p.evaluate('HildaTest.state()')
def ui(p): return p.evaluate('HildaTest.ui()')
def settle(p,timeout=22):
    end=time.monotonic()+timeout
    while time.monotonic()<end:
        u=ui(p)
        if u['modal']: return
        if u['dialogue']:
            p.keyboard.press('Space');p.wait_for_timeout(65);continue
        if u['locked'] or u['moving'] or u['working'] or u['sequenceActive']:
            p.wait_for_timeout(70);continue
        p.wait_for_timeout(100)
        u=ui(p)
        if not (u['locked'] or u['moving'] or u['working'] or u['sequenceActive'] or u['dialogue']): return
    raise AssertionError('UI failed to settle: '+json.dumps(ui(p),ensure_ascii=False))

def clear(p):
    if ui(p)['selected']:
        p.locator('#cancelItem').click();p.wait_for_timeout(50)

def act(p,name,clear_item=True,touch=False,keyboard=False):
    settle(p)
    if clear_item:clear(p)
    el=p.locator('[data-hotspot="'+name+'"]')
    if keyboard:el.focus();el.press('Enter')
    elif touch:el.tap()
    else:el.click()
    settle(p)

def choose(p,item,touch=False):
    settle(p)
    if ui(p)['selected']==item:return
    if not p.locator('#pocket').is_visible():p.locator('#bagBtn').click()
    el=p.locator('[data-item="'+item+'"]')
    if touch:el.tap()
    else:el.click()
    p.wait_for_timeout(80)
    assert ui(p)['selected']==item,('select failed',item,ui(p))

def use(p,item,name,drag=False,touch=False):
    if not drag:
        choose(p,item,touch);act(p,name,clear_item=False,touch=touch)
    else:
        settle(p);clear(p)
        if not p.locator('#pocket').is_visible():p.locator('#bagBtn').click()
        a=p.locator('[data-item="'+item+'"]').bounding_box();b=p.locator('[data-hotspot="'+name+'"]').bounding_box()
        p.mouse.move(a['x']+a['width']/2,a['y']+a['height']/2);p.mouse.down()
        p.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2,steps=16);p.mouse.up();settle(p)

def combine(p,a,b):
    clear(p);choose(p,a)
    if not p.locator('#pocket').is_visible():p.locator('#bagBtn').click()
    p.locator('[data-item="'+b+'"]').click();p.wait_for_timeout(100)

def drag_object(p,name,dx=0,dy=0,target=None):
    settle(p);clear(p)
    a=p.locator('[data-hotspot="'+name+'"]').bounding_box()
    x=a['x']+a['width']/2;y=a['y']+a['height']/2
    if target:
        c=ui(p)['camera'];r=p.locator('#world').bounding_box()
        xx=r['x']+(target[0]-c['x'])/c['w']*r['width'];yy=r['y']+(target[1]-c['y'])/c['h']*r['height']
    else:xx=x+dx;yy=y+dy
    p.mouse.move(x,y);p.mouse.down();p.mouse.move(xx,yy,steps=18);p.mouse.up();settle(p)

def fixture(p,n):
    assert state(p)['scene']==n,('wrong scene',n,state(p)['scene'])
    FIXTURES[str(n)]=state(p)
    (ROOT/'tests/fixtures.json').write_text(json.dumps(FIXTURES,ensure_ascii=False,indent=2))
    print('SCENE',n,flush=True)

def shot(p,name):
    settle(p);p.mouse.move(3,3);p.wait_for_timeout(900)
    p.screenshot(path=str(ROOT/'previews'/f'{name}.png'))

def load(p,n):
    p.evaluate('s=>HildaTest.loadFixture(s)',FIXTURES[str(n)]);settle(p)

def flags(p,*names):return all(state(p)['f'].get(n) for n in names)

def main(browser):
    p=newpage(browser)
    check('Title loads without a network request',len(REQUESTS)==0)
    shot(p,'title')
    p.locator('#startBtn').click();settle(p);fixture(p,0)
    check('Game fills browser viewport',p.locator('#game').bounding_box()['height']==900 and p.locator('#game').bounding_box()['width']==1600)
    check('Story notebook does not reveal later plot at start',len(state(p)['notes'])==0)
    act(p,'leave');check('Cannot leave before reading letter and preparing',state(p)['scene']==0)
    act(p,'bird');act(p,'mom');act(p,'lamp');act(p,'picture')
    check('Letter, promise, lamp and scarf acquired',flags(p,'letter','promise','lampTaken') and {'lamp','scarf'}<=set(state(p)['inventory']))
    act(p,'detail');check('Environmental discovery joins the journal','doorMarks' in state(p)['notes'])
    choose(p,'lamp');p.locator('#inspectSelected').click();check('Item inspection shows enlarged art and material',p.locator('.item-hero svg').count()==1 and p.locator('.material-label').inner_text()!='')
    p.locator('#putInspected').click();p.locator('#focusBtn').click();check('Scene inspection changes the actual camera',ui(p)['inspection'] and ui(p)['camera']['w']<1500)
    p.keyboard.press('Escape');check('Escape leaves inspection without opening menu',not ui(p)['inspection'] and not ui(p)['modal'])
    shot(p,'00-home');act(p,'leave');fixture(p,1)
    act(p,'wheel');check('Gate wheel requires its crank',not flags(p,'gateOpen','crankMounted'))
    drag_object(p,'awning',dy=113);check('Direct rope drag raises the awning',flags(p,'awning'))
    act(p,'crank');use(p,'crank','wheel')
    for _ in range(3):act(p,'wheel')
    check('Three turns raise gate and return reusable crank',flags(p,'gateOpen') and 'crank' in state(p)['inventory'])
    act(p,'puddle');shot(p,'01-north-gate');act(p,'gate');fixture(p,2)
    act(p,'next');check('Broken bridge blocks travel and walking',state(p)['scene']==2 and ui(p)['hero']['x']<=545)
    act(p,'rope');use(p,'rope','hook');act(p,'hook');combine(p,'rope','hook')
    check('Inventory combines hook and rope without duplication','grapple' in state(p)['inventory'] and 'rope' not in state(p)['inventory'] and 'hook' not in state(p)['inventory'])
    use(p,'grapple','anchor',drag=True);check('Inventory drag attaches grapple to far anchor',flags(p,'grappleSet'))
    act(p,'winch');check('Bridge requires a companion on the brake',not flags(p,'bridge'));act(p,'david');act(p,'winch');act(p,'stream');check('Bridge repaired and reverse water clue recorded',flags(p,'bridge') and 'water' in state(p)['notes'])
    shot(p,'02-forest');act(p,'next');fixture(p,3)
    act(p,'book');check('High book requires moving ladder',not flags(p,'planTaken'))
    drag_object(p,'ladder',target=(1170,585));act(p,'book')
    check('Dragging archive ladder makes high book reachable',flags(p,'planTaken') and 'plan' in state(p)['inventory'])
    act(p,'record');shot(p,'03-archive');act(p,'next');fixture(p,4)
    act(p,'pipe0');check('Water cannot run through clogged filter',not flags(p,'pump'))
    act(p,'filter');check('Intake pressure prevents premature filter removal',not flags(p,'filter'));act(p,'intake');act(p,'filter');act(p,'intake')
    for i,v in enumerate([2,0,3]):
        for _ in range(4):
            if state(p)['valves'][i]==v:break
            if i==0:use(p,'pole','pipe0')
            else:act(p,'pipe'+str(i))
    check('Connected water needs explicit pressure test',not flags(p,'pump'))
    act(p,'prime')
    check('Actual pipe topology powers pump and reveals consequence',flags(p,'pump') and 'surge' in state(p)['notes'])
    act(p,'pipe1');check('Operating pipe joints cannot be loosened',state(p)['valves']==[2,0,3])
    p.locator('#focusBtn').click();shot(p,'04-waterworks-detail');p.locator('#focusExit').click()
    shot(p,'04-waterworks');act(p,'next');fixture(p,5)
    act(p,'brake');check('Unbalanced gondola cannot depart',not flags(p,'lift'))
    act(p,'line');drag_object(p,'weight1',target=(810,491));act(p,'weight3')
    act(p,'brake');check('Balance accepts weights one plus three',flags(p,'lift') and sum(state(p)['weights'])==4)
    shot(p,'05-gondola');act(p,'cabin');fixture(p,6)
    use(p,'lamp','holder');check('Unshaded lamp does not satisfy calming puzzle','lamp' in state(p)['inventory'] and not flags(p,'shadePlaced'))
    combine(p,'lamp','scarf');use(p,'shade','holder')
    check('Selected inventory item folds pocket clear of scenery',not p.locator('#pocket').is_visible())
    check('Scarf softens light while lamp remains available',flags(p,'shadePlaced') and 'lamp' in state(p)['inventory'] and 'scarf' not in state(p)['inventory'])
    act(p,'song')
    for i in [2,2,2,2]:act(p,'tone'+str(i))
    check('Incorrect melody resets safely',not flags(p,'calm') and state(p)['melody']==[])
    for i in [0,1,0,2]:act(p,'tone'+str(i))
    check('Visual melody works with sound disabled',flags(p,'calm') and 'fork' in state(p)['inventory'] and not state(p)['settings']['sound'])
    shot(p,'06-shelter');act(p,'next');fixture(p,7)
    act(p,'lever');check('Tower door requires complete gear train',not flags(p,'towerGate'))
    for g in ['gearS','gearM','gearL']:act(p,g)
    use(p,'gearL','socketS');check('Wrong-size gear is not consumed','gearL' in state(p)['inventory'] and not flags(p,'gearSSet'))
    use(p,'gearS','socketS');use(p,'gearM','socketM',drag=True);use(p,'gearL','socketL');act(p,'lever')
    check('Door cannot open with misaligned witness mark',not flags(p,'towerGate'))
    for _ in range(3):act(p,'socketM')
    act(p,'lever');act(p,'etching')
    check('Three correctly fitted gears open tower',flags(p,'towerGate','gearSSet','gearMSet','gearLSet'))
    shot(p,'07-tower-door');act(p,'next');fixture(p,8)
    act(p,'felt');use(p,'felt','clapper')
    check('Unsafe shutdown warns without consuming felt','felt' in state(p)['inventory'] and not flags(p,'damped'))
    use(p,'crank','bypass');act(p,'bypass');act(p,'bypass');use(p,'felt','clapper');act(p,'drive')
    check('Mechanism needs both companions',not flags(p,'heart'))
    act(p,'frida');act(p,'david');use(p,'fork','drive')
    check('Cooperative sequence repairs water clock',flags(p,'bypass','damped','fridaHold','davidHold','heart'))
    shot(p,'08-water-clock');act(p,'next');fixture(p,9)
    p.locator('#menuBtn').click();before=state(p)['danger'];p.wait_for_timeout(1100)
    check('Storm pressure pauses in menu',abs(state(p)['danger']-before)<.001)
    p.locator('#resumePlay').click();settle(p)
    p.locator('#bagBtn').click();before=state(p)['danger'];p.wait_for_timeout(400);check('Storm pauses while choosing equipment',abs(state(p)['danger']-before)<.001);p.locator('#closeBag').click()
    use(p,'line','anchor');act(p,'david');use(p,'pole','frida')
    drag_object(p,'beacon',target=(1178,353))
    check('Rotating actual beacon toward star summons rescue',flags(p,'beacon','davidSafe','fridaSafe'))
    act(p,'board');check('Cannot leave Twig behind',state(p)['scene']==9 and not flags(p,'roofDone'))
    shot(p,'09-storm-roof');act(p,'twig');act(p,'board');fixture(p,10)
    check('Entire rooftop party leaves safely',flags(p,'roofDone','twigSafe','davidSafe','fridaSafe'))
    use(p,'lamp','trail0');check('Wind-exposed lantern requires turned hood',not flags(p,'trail0'))
    for i in range(3):act(p,'trail'+str(i));use(p,'lamp','trail'+str(i))
    act(p,'child');act(p,'sunrise');check('Three protected lights reunite troll family',flags(p,'trail0','trail1','trail2','reunited'))
    shot(p,'10-dawn-ridge');act(p,'hand');fixture(p,11)
    check('Returning home is playable, not an immediate victory popup',not flags(p,'ended') and not ui(p)['modal'])
    act(p,'mom')
    for i in range(3):act(p,'tea'+str(i))
    check('Hug and sharing three cups unlock completed ending',flags(p,'ended','hug','tea0','tea1','tea2') and ui(p)['modal'])
    check('Ending explicitly includes everyone safe','全部平安' in p.locator('#panelLayer').inner_text())
    p.locator('#stayHome').click();settle(p);act(p,'window');act(p,'friends');shot(p,'11-homecoming');fixture(p,11)
    check('Six optional observation sketches collectible',len(state(p)['sketches'])==6)
    p.evaluate('HildaTest.flush()');storage=p.evaluate('storageSnapshot()')
    return p,storage

if __name__=='__main__':
    error=None;page=None
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
        try:
            page,storage=main(browser)
            # Regression suite is kept separate from the UI-driven full playthrough.
            if (ROOT/'tests/regressions.py').exists():
                exec((ROOT/'tests/regressions.py').read_text(),globals())
                run_regressions(browser,page,storage)
            exec((ROOT/'tests/chapter-regressions.py').read_text(),globals())
            run_chapter_regressions(browser)
            check('No uncaught JavaScript errors',not ERRORS)
            check('No external asset or network requests',not REQUESTS)
        except Exception as e:
            error=traceback.format_exc();print(error,flush=True)
            active_pages=[page for page in PAGES if not page.is_closed()]
            if active_pages:
                try:
                    active_pages[-1].screenshot(path=str(ROOT/'previews/test-failure.png'))
                    (ROOT/'tests/failure-state.json').write_text(json.dumps({'state':state(active_pages[-1]),'ui':ui(active_pages[-1])},ensure_ascii=False,indent=2))
                except Exception:pass
        finally:
            report={'artifact_sha256':HTML_SHA,'passed':error is None,'checks_passed':len(CHECKS),'checks':CHECKS,'uncaught_errors':ERRORS,'network_requests':REQUESTS,'failure':error,'duration_seconds':round(time.monotonic()-START,2),'environment':{'browser':browser.version,'html_loading':'Playwright set_content of complete generated HTML','storage':'Explicit in-memory Storage adapter. Real file-origin/browser persistence is not verified.','navigation':'Container administration policy blocks file:// and HTTP navigation; no policy bypass attempted.','mobile':'Browser touch/layout emulation only, not physical devices.'}}
            (ROOT/'test-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
            browser.close()
    raise SystemExit(1 if error else 0)

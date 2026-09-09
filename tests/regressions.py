"""Run after the full UI playthrough. load() uses captured, valid scene saves;
these fixture tests are not counted as a second complete playthrough."""
def run_regressions(browser,completed,storage):
    completed.close()
    timer=newpage(browser);load(timer,9)
    use(timer,'line','anchor');act(timer,'david')
    timer_start=time.monotonic()
    p=newpage(browser,storage=storage)
    check('Continue button appears for validated saved state',p.locator('#continueBtn').is_visible())
    p.locator('#continueBtn').click();settle(p)
    check('Reload restores ending and six sketches through storage adapter',flags(p,'ended') and len(state(p)['sketches'])==6 and state(p)['scene']==11)
    p.locator('#menuBtn').click();p.locator('#restartBtn').click();p.locator('#cancelRestart').click();settle(p)
    check('Cancel restart preserves completed progress',flags(p,'ended') and state(p)['scene']==11)
    # Read the actual exported bytes, then exercise native file input and confirmation.
    p.locator('#menuBtn').click()
    with p.expect_download() as dl:p.locator('#exportBtn').click()
    exported=Path(dl.value.path()).read_bytes()
    parsed=json.loads(exported)
    check('JSON export contains validated V3 ending state',parsed['version']==3 and parsed['f']['ended'])
    p.locator('#resumePlay').click();load(p,8)
    p.locator('#importFile').set_input_files({'name':'valid-save.json','mimeType':'application/json','buffer':exported})
    p.locator('#cancelImport').click();settle(p)
    check('Cancel import does not replace current chapter',state(p)['scene']==8)
    p.locator('#importFile').set_input_files({'name':'valid-save.json','mimeType':'application/json','buffer':exported})
    p.locator('#confirmImport').click();settle(p)
    check('Confirmed file import restores full ending',state(p)['scene']==11 and flags(p,'ended'))
    for description,change in [
        ('Unknown item is rejected',lambda s:s['inventory'].append('<img src=x onerror=alert(1)>')),
        ('Out-of-range scene is rejected',lambda s:s.update(scene=99)),
        ('Out-of-range pipe rotation is rejected',lambda s:s.update(valves=[4,0,3])),
        ('Missing story prerequisite is rejected',lambda s:s['f'].pop('heart')),
        ('Wrong-version save is rejected',lambda s:s.update(version=1)),
    ]:
        bad=copy.deepcopy(parsed);change(bad)
        result=p.evaluate('v=>{try{HildaTest.validate(v);return false}catch(e){return true}}',bad)
        check(description,result)
    p.locator('#importFile').set_input_files({'name':'bad-save.json','mimeType':'application/json','buffer':b'{ broken json'})
    p.wait_for_timeout(200)
    check('Malformed imported JSON leaves gameplay intact',state(p)['scene']==11 and flags(p,'ended') and '无法载入' in p.locator('#toast').inner_text())
    # A normal scene can be reloaded at the same mechanism state.
    load(p,4);act(p,'intake');act(p,'filter');use(p,'pole','pipe0');p.evaluate('HildaTest.flush()')
    partial=state(p);raw=p.evaluate('storageSnapshot()')
    p2=newpage(browser,storage=raw);p2.locator('#continueBtn').click();settle(p2)
    check('Partly rotated pipe puzzle survives save and restore',state(p2)['valves']==partial['valves'] and flags(p2,'filter'))
    p2.close()
    # Check adaptive hints and two different forms of pausing.
    load(p,9)
    check('Storm meter is visible on entering rooftop',p.locator('#hazard').is_visible())
    p.locator('#menuBtn').click()
    for _ in range(4):
        p.locator('#motionSetting').click()
        assert p.locator('#hazard').is_visible()
    p.locator('#resumePlay').click()
    check('Storm meter survives repeated scene rerenders',p.locator('#hazard').is_visible())
    p.locator('#journalBtn').click();before=state(p)['danger'];p.wait_for_timeout(1000)
    check('Storm pressure pauses while reading notebook',abs(state(p)['danger']-before)<.001)
    for _ in range(5):p.locator('#hintBtn').click()
    check('Hints stop at level three for the current scene',state(p)['hints'][9]==3 and sum(state(p)['hints'])==3)
    check('Notebook does not reveal unvisited homecoming ending','全部平安' not in p.locator('#panel').inner_text())
    p.locator('#backFromNotes').click();p.wait_for_function('before=>HildaTest.state().danger>before+.004',arg=before,timeout=12000)
    check('Storm pressure advances during active gameplay',state(p)['danger']>before+.004)
    p.locator('#menuBtn').click();p.locator('#relaxSetting').click();p.locator('#resumePlay').click()
    before=state(p)['danger'];p.wait_for_timeout(1200)
    check('Relaxed mode removes pressure without changing chapter',state(p)['settings']['relaxed'] and abs(state(p)['danger']-before)<.001 and state(p)['scene']==9)
    use(p,'line','anchor');act(p,'david');p.evaluate('HildaTest.resetRoof()');settle(p)
    check('Safe checkpoint retains secured line and completed rescue',state(p)['failures']==1 and 'line' not in state(p)['inventory'] and flags(p,'roofAnchor','davidSafe'))
    check('Safe checkpoint preserves previous chapters and items',flags(p,'heart','towerGate','pump','calm') and 'crank' in state(p)['inventory'])
    p.locator('#menuBtn').click();p.locator('#motionSetting').click();p.locator('#resumePlay').click();settle(p)
    check('Reduced motion mode updates game class and preference',state(p)['settings']['reduced'] and 'reduced' in p.locator('#game').get_attribute('class'))
    p.locator('#audioBtn').click();p.wait_for_timeout(200)
    check('Audio can be enabled by explicit user gesture',state(p)['settings']['sound'] and p.locator('#audioBtn').get_attribute('aria-label')=='关闭声音')
    p.locator('#audioBtn').click();check('Audio can be disabled',not state(p)['settings']['sound'])
    p.close()
    # Blocked storage regression uses an explicit throwing storage shim.
    b=newpage(browser,blocked=True);b.locator('#startBtn').click();settle(b);act(b,'bird');b.evaluate('HildaTest.flush()')
    check('Storage refusal does not stop story interactions',flags(b,'letter') and not ui(b)['storageOK'])
    b.locator('#menuBtn').click();check('Storage refusal exposes clear export guidance','阻止了本地存储' in b.locator('#panel').inner_text())
    b.close()
    # Real pointer/touch events at landscape mobile dimensions.
    m=newpage(browser,844,390,mobile=True);m.locator('#startBtn').tap();settle(m)
    act(m,'bird',touch=True);act(m,'mom',touch=True);act(m,'lamp',touch=True);act(m,'leave',touch=True)
    check('Touch emulation completes prologue and scene transition',state(m)['scene']==1 and flags(m,'promise','lampTaken'))
    for n in [2,3,4,6,8,9,10,11]:
        load(m,n)
        check('Mobile landscape scene '+str(n)+' viewport containment',m.evaluate('document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight'))
    load(m,9);m.locator('#menuBtn').tap();m.locator('#relaxSetting').tap();m.locator('#resumePlay').tap()
    use(m,'line','anchor',touch=True);act(m,'david',touch=True);act(m,'david',touch=True);use(m,'pole','frida',touch=True)
    for _ in range(3):act(m,'beacon',touch=True)
    check('Beacon has touch-friendly click alternative to rotation drag',flags(m,'beacon'))
    act(m,'twig',touch=True);shot(m,'mobile-landscape-roof');act(m,'board',touch=True)
    check('Touch emulation completes entire rooftop rescue',state(m)['scene']==10 and flags(m,'roofDone','twigSafe'))
    m.close()
    # Portrait camera can inspect the complete wider-than-screen environment.
    q=newpage(browser,390,844,mobile=True);load(q,6)
    c0=ui(q)['camera'];q.locator('#panRight').tap();q.wait_for_timeout(100);c1=ui(q)['camera']
    check('Portrait camera pans horizontally without shrinking whole scene',c1['x']>c0['x'] and c1['w']<500 and c1['h']==900)
    shot(q,'mobile-portrait')
    q.locator('#journalBtn').tap()
    check('Portrait notebook remains inside viewport',q.locator('#panel').bounding_box()['width']<=390 and q.locator('#panel').bounding_box()['height']<=844)
    q.locator('#backFromNotes').tap()
    for width,height in [(360,780),(390,844),(768,1024),(1024,768),(1920,1080),(2560,1080)]:
        q.set_viewport_size({'width':width,'height':height});q.wait_for_timeout(100)
        check(f'No page overflow at {width} x {height}',q.evaluate('document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight'))
    q.close()
    # Keyboard accessibility actions, not direct action calls.
    k=newpage(browser);k.locator('#startBtn').focus();k.keyboard.press('Enter');settle(k)
    act(k,'bird',keyboard=True);check('Keyboard focus and Enter activate scene object',flags(k,'letter'))
    k.keyboard.press('h');check('Keyboard H reveals scene targets','revealing' in k.locator('#world').get_attribute('class'))
    k.keyboard.press('j');check('Keyboard J opens notebook',ui(k)['modal'])
    k.keyboard.press('Escape');check('Escape closes notebook',not ui(k)['modal'])
    k.keyboard.press('i');check('Keyboard I opens inventory',k.locator('#pocket').is_visible())
    # Pointer-free archive ladder operation, including repeated render/focus.
    load(k,3)
    for _ in range(8):
        if abs(state(k)['f'].get('ladderX',769)-1170)<75:break
        act(k,'ladder',keyboard=True)
    act(k,'ladderBrake',keyboard=True);act(k,'book',keyboard=True)
    check('Archive ladder and high shelf can be solved without dragging',flags(k,'planTaken'))

    # At canonical aspect ratio every active object's centre must be clickable.
    for n in range(12):
        load(k,n)
        overlaps=k.evaluate("""()=>HildaTest.hotspots().filter(h=>{const r=document.querySelector('[data-hotspot="'+h.id+'"]').getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-hotspot]')?.dataset.hotspot!==h.id}).map(h=>h.id)""")
        check('Scene '+str(n)+' active hotspot centres are not obstructed',not overlaps)
    k.close()
    # This page has run concurrently in real browser time, with actual requestAnimationFrame.
    # No call to resetRoof() or state mutation is used for this deadline check.
    until=time.monotonic()+130
    while state(timer)['failures']==0 and time.monotonic()<until:
        timer.wait_for_timeout(1000)
    check('Actual storm deadline triggers automatic safe checkpoint',state(timer)['failures']==1 and ui(timer)['dialogue'] is not None)
    check('Timed checkpoint preserves the anchored line, rescued David and completed heart',flags(timer,'roofAnchor','davidSafe','heart') and 'line' not in state(timer)['inventory'])
    timer.close()

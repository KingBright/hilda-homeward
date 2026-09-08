"""Contact actions and cooperative/maintenance logic, exercised through public UI controls.
Loaded by playthrough.py into its report namespace, like the existing regressions suite.
"""
def run_chapter_regressions(browser):
    p=newpage(browser)
    load(p,1)
    # A dragged rope must not actuate at a distance or when the pointer is cancelled.
    x=p.locator('[data-hotspot="awning"]').bounding_box()
    cx=x['x']+x['width']/2;cy=x['y']+x['height']/2
    p.mouse.move(cx,cy);p.mouse.down();p.mouse.move(cx,cy+100,steps=8)
    p.dispatch_event('#viewport','pointercancel',{'pointerId':1})
    p.mouse.up();p.wait_for_timeout(150)
    check('Cancelled awning drag leaves cloth, inventory and flags unchanged',not flags(p,'awning'))
    load(p,1)
    p.mouse.move(cx,cy);p.mouse.down();p.mouse.move(cx,cy+100,steps=8);p.mouse.up()
    check('Accepted scene drag walks to its contact point before changing state',ui(p)['moving'] and not flags(p,'awning'))
    p.wait_for_function('HildaTest.ui().working')
    p.wait_for_timeout(180)
    # Pause through the real menu, not an injected state change.
    p.locator('#menuBtn').click();before=ui(p)['performance']['progress']
    p.wait_for_timeout(400)
    check('Action clock freezes while menu is open',ui(p)['performance']['progress']==before and not flags(p,'awning'))
    p.locator('#resumePlay').click();settle(p)
    check('Paused action resumes and commits once',flags(p,'awning'))
    # Reloading during a pickup preserves the pre-action item and checkpoint.
    el=p.locator('[data-hotspot="crank"]');el.click()
    p.wait_for_function('HildaTest.ui().working')
    p.evaluate('HildaTest.flush()');snapshot=p.evaluate('storageSnapshot()')
    check('Pickup flag and inventory are not written during preparation',not flags(p,'crankTaken') and 'crank' not in state(p)['inventory'])
    resumed=newpage(browser,storage=snapshot);resumed.locator('#continueBtn').click();settle(resumed)
    check('Reload cancels only unfinished acting, without losing the collectible',not flags(resumed,'crankTaken') and resumed.locator('[data-hotspot="crank"]').count()==1)
    act(resumed,'crank');check('Retrying interrupted pickup creates exactly one item',state(resumed)['inventory'].count('crank')==1)
    resumed.close();settle(p)
    use(p,'crank','wheel')
    # A repeat click during contact cannot advance the detent counter twice.
    p.locator('[data-hotspot="wheel"]').click();p.wait_for_function('HildaTest.ui().working')
    p.wait_for_timeout(420)
    check('Gate lift is visibly intermediate before its checkpoint commits',-335<float(p.locator('#gateBars').get_attribute('transform').split()[1].rstrip(')'))<0 and not state(p)['f'].get('gateTurns'))
    check('Reach animation is attached to the actor and contact phase',p.locator('#performer').get_attribute('data-pose')=='turn' and ui(p)['performance']['phase']=='contact')
    p.locator('[data-hotspot="wheel"]').click();settle(p)
    check('Repeated input during a crank action advances only one detent',state(p)['f']['gateTurns']==1)
    # Opening a bag while walking cancels the queued object operation.
    load(p,1);p.locator('[data-hotspot="awning"]').click();p.wait_for_timeout(70);p.locator('#bagBtn').click()
    p.wait_for_timeout(250)
    check('Opening inventory cancels a queued remote action',not ui(p)['moving'] and not flags(p,'awning'))
    p.locator('#closeBag').click();settle(p)
    # A valid old checkpoint remains playable without new chapter prerequisites.
    old=copy.deepcopy(FIXTURES['5']);old['f'].pop('intakeClosed',None)
    p.evaluate('s=>HildaTest.loadFixture(s)',old);settle(p)
    check('Completed V3 waterworks migrate without requiring a new valve step',state(p)['scene']==5 and flags(p,'pump'))
    # Close intake, clear, connect dry, reject priming, reopen, then run.
    load(p,4);act(p,'intake');act(p,'filter')
    for i,v in enumerate([2,0,3]):
        for _ in range(4):
            if state(p)['valves'][i]==v:break
            if i==0:use(p,'pole','pipe0')
            else:act(p,'pipe'+str(i))
    act(p,'prime');check('Dry connected pipes do not start a pump with the inlet shut',not flags(p,'pump') and flags(p,'intakeClosed'))
    act(p,'intake');act(p,'prime');act(p,'intake')
    check('Inlet locks only after successful priming, not during inspection',flags(p,'pump') and not state(p)['f'].get('intakeClosed'))
    # Touch and keyboard use the same new contact execution on an actual mobile-sized viewport.
    m=newpage(browser,844,390,True);load(m,4)
    act(m,'intake',touch=True);act(m,'filter',touch=True)
    check('Touch operates inlet and clears filter on a landscape phone viewport',flags(m,'intakeClosed','filter') and 'pole' in state(m)['inventory'])
    act(m,'pipe1',keyboard=True)
    check('Keyboard triggers the same animated pipe operation',state(m)['valves'][1]==2)
    m.locator('#menuBtn').click();m.locator('#motionSetting').click();m.locator('#resumePlay').click()
    act(m,'intake',touch=True)
    check('Reduced-motion mode keeps the new puzzle fully usable',state(m)['settings']['reduced'] and not state(m)['f'].get('intakeClosed'))
    m.close()
    load(p,2)
    p.locator('[data-hotspot="rope"]').click();settle(p)
    check('David hotspot does not cover the rope pickup',flags(p,'ropeTaken'))
    # DOM IDs must remain unique after dynamic SVG patching.
    ids=p.evaluate('()=>Array.from(document.querySelectorAll("#world [id]")).map(n=>n.id)')
    check('Dynamic actor and mechanism layers have no duplicate SVG IDs',len(ids)==len(set(ids)))
    p.close()

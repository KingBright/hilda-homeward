"""Real Chromium rendering and Web Audio regression tests, with an explicit
in-memory save adapter. Offline PCM proves synthesis, not subjective mix quality.
Run native-storage.py separately for actual browser storage persistence.
"""
from pathlib import Path
import base64, hashlib, json, os, traceback
from playwright.sync_api import sync_playwright
from playthrough import newpage, settle, act, state, ERRORS, REQUESTS
ROOT=Path(__file__).resolve().parents[1]
CHECKS=[]
def check(name,ok):
    assert ok,name
    CHECKS.append({'name':name,'passed':True})
    print('PASS',len(CHECKS),name,flush=True)

def main(browser):
    p=newpage(browser)
    p.locator('#startBtn').click();settle(p)
    check('Stage Hilda uses shared costume and articulated rig',p.locator('#performer [data-costume="希尔达"]').count()==1)
    check('Character SVG has no duplicate IDs',p.evaluate("(()=>{let a=[...document.querySelectorAll('#world [id]')].map(n=>n.id);return a.length===new Set(a).size})()"))
    check('No sound is created before opt-in',p.evaluate('HildaTest.audio()') is None)
    p.locator('#audioBtn').click();p.wait_for_function('HildaTest.audio()?.context==="running" && HildaTest.audio().score.scheduled>0')
    p.wait_for_timeout(900)
    check('Explicit opt-in schedules authored music in a running AudioContext',p.evaluate('HildaTest.audio().score.cue==="hearth" && HildaTest.audio().mix>0.2'))
    p.locator('#audioBtn').click();p.wait_for_function('HildaTest.audio().context==="suspended"')
    before=p.evaluate('HildaTest.audio().score.scheduled');p.wait_for_timeout(400)
    check('Muted transport stops scheduling',p.evaluate('HildaTest.audio().score.scheduled')==before)
    p.locator('#audioBtn').click();p.wait_for_function('HildaTest.audio().context==="running"')
    p.wait_for_function('(n)=>HildaTest.audio().score.scheduled>n',arg=before)
    check('Same-scene unmute restores gain and music',p.evaluate('HildaTest.audio().mix>.2 && HildaTest.audio().score.running'))
    p.locator('#audioBtn').click();p.locator('#audioBtn').click();p.locator('#audioBtn').click();p.wait_for_timeout(300)
    check('Rapid mute/unmute/mute cannot resurrect audio',p.evaluate('!HildaTest.state().settings.sound && HildaTest.audio().context==="suspended"'))
    p.locator('#audioBtn').click();p.wait_for_timeout(300)
    p.locator('#menuBtn').click()
    check('Four independent accessible mixer sliders',p.locator('[data-volume]').count()==4)
    p.locator('#musicVolume').fill('0');p.wait_for_timeout(1200)
    check('Music can be muted without muting sound effects',p.evaluate('HildaTest.audio().musicGain<.005 && HildaTest.audio().effectsGain>.7'))
    p.locator('#musicVolume').fill('63');p.locator('#voiceVolume').fill('0');p.wait_for_timeout(350)
    check('Dialogue blips have an independent zero-volume control',p.evaluate('HildaTest.audio().voiceGain<.002 && HildaTest.state().settings.musicVolume===.63'))
    p.evaluate('HildaTest.flush()');saved=p.evaluate('storageSnapshot()')
    q=newpage(browser,storage=saved);q.locator('#continueBtn').click();q.wait_for_timeout(400)
    check('Mixer values survive validated save reload (adapter)',state(q)['settings']['musicVolume']==.63 and state(q)['settings']['voiceVolume']==0)
    q.close()
    p.locator('#resumePlay').click();settle(p);p.wait_for_timeout(600)
    p.locator('[data-hotspot="mom"]').click();p.wait_for_function('!!HildaTest.ui().dialogue');p.wait_for_timeout(850)
    check('Dialogue ducks score, not effects bus',p.evaluate('HildaTest.audio().musicGain<.31 && HildaTest.audio().effectsGain>.7'))
    settle(p)
    p.evaluate("Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))")
    p.wait_for_function('HildaTest.audio().context==="suspended"')
    check('Simulated background visibility suspends audio and transport',p.evaluate('!HildaTest.audio().score.running'))
    p.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
    p.wait_for_function('HildaTest.audio().context==="running"')
    check('Foreground return resumes transport',p.evaluate('HildaTest.audio().score.running'))
    # A previously UI-recorded valid fixture is used, not a fabricated progression.
    fixtures=json.loads((ROOT/'tests/fixtures.json').read_text())
    for scene in [3,9,11,3,9,11]:
        f=fixtures[str(scene)];f['settings']['sound']=True
        p.evaluate('s=>HildaTest.loadFixture(s)',f);p.wait_for_timeout(120)
    p.wait_for_timeout(2200)
    check('Rapid chapter changes keep music voices bounded',p.evaluate('HildaTest.audio().score.voices<=72'))
    check('Homecoming reprises the home theme',p.evaluate('HildaTest.audio().score.cue==="hearth"'))
    p.locator('#menuBtn').click();p.locator('#motionSetting').click()
    if not state(p)['settings']['reduced']:p.locator('#motionSetting').click()
    p.locator('#resumePlay').click()
    check('Reduced motion suppresses NPC secondary animation',p.evaluate("[...document.querySelectorAll('#world .cast-breathe,#world .cast-blink')].every(n=>getComputedStyle(n).animationName==='none')"))
    touch=newpage(browser,844,390,True);touch.locator('#startBtn').tap();settle(touch);touch.locator('#menuBtn').tap()
    check('Mixer remains usable in landscape touch layout',touch.locator('#musicVolume').is_visible() and touch.locator('#musicVolume').bounding_box()['width']>150)
    touch.close()
    # Render the same note renderer used by the running game, including its room.
    metrics=[]
    for scene in [0,2,3,9,10]:
        result=p.evaluate('''async scene=>{
          const S=Homeward.use('content/score'),R=Homeward.use('engine/score-player'),cue=S.cueFor(scene),spb=60/cue.bpm,seconds=16*spb+2;
          const ctx=new OfflineAudioContext(2,Math.ceil(seconds*48000),48000),master=ctx.createGain(),music=ctx.createGain();
          master.gain.value=.32;music.gain.value=.72;music.connect(master);master.connect(ctx.destination);const room=R.createRoom(ctx,master);music.connect(room.input);
          for(let bar=0;bar<4;bar++)for(const e of S.eventsForBar(cue,bar,.8))R.renderNote(ctx,music,e,.05+(bar*4+e.beat)*spb,spb);
          const b=await ctx.startRendering(),a=b.getChannelData(0),c=b.getChannelData(1);let peak=0,sum=0,bad=0,diff=0;
          for(let i=0;i<a.length;i++){peak=Math.max(peak,Math.abs(a[i]),Math.abs(c[i]));sum+=a[i]*a[i]+c[i]*c[i];diff+=Math.abs(a[i]-c[i]);if(!Number.isFinite(a[i])||!Number.isFinite(c[i]))bad++;}
          const bytes=new Uint8Array(44+a.length*4),v=new DataView(bytes.buffer),str=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
          str(0,'RIFF');v.setUint32(4,bytes.length-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,48000,true);v.setUint32(28,192000,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,a.length*4,true);
          for(let i=0;i<a.length;i++){v.setInt16(44+i*4,Math.round(Math.max(-1,Math.min(1,a[i]))*32767),true);v.setInt16(46+i*4,Math.round(Math.max(-1,Math.min(1,c[i]))*32767),true);}
          let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));
          return {name:cue.name,cue:cue.key,seconds:b.duration,peak,rms:Math.sqrt(sum/(a.length*2)),stereoDifference:diff/a.length,bad,wav:btoa(text)};
        }''',scene)
        wav=base64.b64decode(result.pop('wav'))
        (ROOT/'previews'/('score-'+result['cue']+'.wav')).write_bytes(wav)
        check('Offline '+result['cue']+' produces finite stereo PCM without sample clipping',result['bad']==0 and .005<result['peak']<.95 and result['rms']>.001 and result['stereoDifference']>.0001)
        metrics.append(result)
    p.close()
    check('No uncaught runtime exceptions in art/audio suite',not ERRORS)
    check('No external asset requests in art/audio suite',not REQUESTS)
    return metrics

if __name__=='__main__':
    error=None;metrics=[]
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
        try:metrics=main(b)
        except Exception:error=traceback.format_exc();print(error,flush=True)
        finally:
            report={'passed':error is None,'checks_passed':len(CHECKS),'checks':CHECKS,'audio_metrics':metrics,'failure':error,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'browser':b.version,'scope':'Real Chromium Web Audio and OfflineAudioContext. Save adapter and visibility simulation explicitly used. No physical-device, listening-panel or perceptual loudness certification.'}
            (ROOT/'art-audio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
    raise SystemExit(1 if error else 0)

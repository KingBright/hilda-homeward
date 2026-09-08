"""Native Chromium origin/storage checks, intended for an unrestricted CI runner.
Unlike playthrough.py this deliberately does not install a Storage adapter.
"""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json, os, threading, hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
checks=[]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

def run_origin(browser,url,label):
    context=browser.new_context()
    page=context.new_page();errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(url,wait_until='load')
    page.wait_for_function('!!window.HildaTest')
    # Use a valid captured checkpoint, then verify the browser really persists it.
    checkpoint=json.loads((ROOT/'tests/fixtures.json').read_text())['4']
    page.evaluate('state=>HildaTest.loadFixture(state)',checkpoint)
    page.evaluate('HildaTest.flush()')
    stored=page.evaluate("localStorage.getItem('hilda-echoes-homeward-v3')")
    assert json.loads(stored)['scene']==4
    page.reload(wait_until='load')
    page.locator('#continueBtn').click()
    page.wait_for_function('HildaTest.state().scene===4 && HildaTest.ui().started')
    assert page.evaluate('HildaTest.ui().storageOK')
    checks.append({'name':label+' persists and restores a checkpoint across native reload','passed':True})
    page.evaluate('HildaTest.flush()')
    page.evaluate("localStorage.setItem('hilda-echoes-homeward-v3','{broken')")
    page.reload(wait_until='load');page.locator('#continueBtn').click()
    page.wait_for_function('HildaTest.state().scene===4 && HildaTest.ui().started')
    checks.append({'name':label+' restores independently validated native backup','passed':True})
    assert not errors,errors
    checks.append({'name':label+' has no uncaught JavaScript errors','passed':True})
    context.close()

server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True,args=['--no-sandbox'])
        run_origin(browser,f'http://127.0.0.1:{server.server_port}/index.html?test','HTTP')
        run_origin(browser,(ROOT/'index.html').as_uri()+'?test','file://')
        browser.close()
    result={'passed':True,'checks':checks,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'environment':'Native Chromium HTTP and file origins, no storage shim; CI runner, not physical phones.'}
    (ROOT/'native-storage-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps(result,ensure_ascii=False,indent=2))
finally:
    server.shutdown();server.server_close()

"""Independently rerun archive/roof regression checks on captured UI checkpoints.
This does not replace or rewrite the original full-playthrough report.
"""
import hashlib
import json
import os
import platform
import traceback
from playthrough import *

if __name__=='__main__':
    FIXTURES.update(json.loads((ROOT/'tests/fixtures.json').read_text()))
    exec((ROOT/'tests/regressions.py').read_text(),globals())
    exec((ROOT/'tests/setpiece-regressions.py').read_text(),globals())
    failure=None
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,headless=True)
        try:
            run_setpiece_regressions(browser)
            check('Isolated setpieces have no uncaught runtime errors',not ERRORS)
            check('Isolated setpieces make no external asset requests',not REQUESTS)
        except Exception:
            failure=traceback.format_exc();print(failure,flush=True)
        finally:
            report={'passed':failure is None,'checks_passed':len(CHECKS),'checks':CHECKS,'failure':failure,'artifact_sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'host':platform.platform(),'browser':browser.version,'scope':'Isolated setpiece regressions using checkpoints produced by the real full adventure. Does not claim another full playthrough.','test_source_sha256':hashlib.sha256((ROOT/'tests/setpiece-regressions.py').read_bytes()).hexdigest()}
            (ROOT/'previews/setpiece-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
    raise SystemExit(1 if failure else 0)

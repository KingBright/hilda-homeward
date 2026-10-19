#!/usr/bin/env python3
"""Browser acceptance test for Phaser 4 HD Stage & Machinarium Contraption Workbench."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
REPORT = ROOT / "phaser-contraptions-report.json"
CHROMIUM_CANDIDATES = [
    os.environ.get("CHROMIUM_PATH"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
]


def find_browser() -> str | None:
    for path in CHROMIUM_CANDIDATES:
        if path and Path(path).exists():
            return path
    return None


def main() -> None:
    uri = INDEX.as_uri() + "?test=1"
    errors: list[str] = []
    requests: list[str] = []

    with sync_playwright() as p:
        executable = find_browser()
        browser = p.chromium.launch(executable_path=executable) if executable else p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("request", lambda r: None if r.url.startswith(INDEX.as_uri()) or r.url.startswith("data:") else requests.append(r.url))

        page.goto(uri, wait_until="load")
        page.wait_for_function("() => window.HildaTest && window.HildaTest.phaser().ready === true")

        # Start game
        page.click("#startBtn")
        page.wait_for_function("() => !window.HildaTest.ui().locked && window.HildaTest.ui().dialogue !== null")
        while page.evaluate("() => window.HildaTest.ui().dialogue !== null"):
            page.click("#nextLine")
            page.wait_for_timeout(45)

        phaser_status = page.evaluate(
            """() => {
            const c = document.querySelector('#phaserStage canvas');
            const st = window.HildaTest.phaser();
            return {
                version: window.Phaser && window.Phaser.VERSION,
                hasCanvas: !!c,
                canvasWidth: c ? c.width : 0,
                canvasHeight: c ? c.height : 0,
                status: st
            };
        }"""
        )
        assert phaser_status["version"] == "4.2.1", phaser_status
        assert phaser_status["hasCanvas"], phaser_status
        assert phaser_status["canvasWidth"] == 1600 and phaser_status["canvasHeight"] == 900, phaser_status
        assert phaser_status["status"]["phaserLoaded"] is True and phaser_status["status"]["ready"] is True, phaser_status

        # Verify Machinarium Doodle Thought Bubble
        page.click("#thoughtBtn")
        thought_check = page.evaluate(
            """() => {
            const tb = document.querySelector('#thoughtBubble');
            const svg = tb && tb.querySelector('svg.doodle-svg');
            return {
                thoughtOpen: window.HildaTest.ui().thoughtOpen,
                visible: tb && !tb.classList.contains('hidden'),
                hasSvg: !!svg,
                xVar: tb ? tb.style.getPropertyValue('--thought-x') : '',
                yVar: tb ? tb.style.getPropertyValue('--thought-y') : ''
            };
        }"""
        )
        assert thought_check["thoughtOpen"] is True and thought_check["visible"] is True, thought_check
        assert thought_check["hasSvg"] is True and thought_check["xVar"].endswith("px"), thought_check

        # Verify Machinarium Contraption Workbench Modal & Step Execution
        page.click("#contraptionBtn")
        workbench_check = page.evaluate(
            """() => {
            const dlg = document.querySelector('#contraptionModal');
            const cvs = document.querySelector('#contraptionCanvas');
            const steps = [...document.querySelectorAll('.contraption-step-btn')];
            const style = getComputedStyle(dlg);
            return {
                open: !!(dlg && dlg.open),
                closedByAttr: dlg ? dlg.getAttribute('closedby') : null,
                overscroll: style.overscrollBehavior,
                canvasWidth: cvs ? cvs.width : 0,
                canvasHeight: cvs ? cvs.height : 0,
                stepCount: steps.length
            };
        }"""
        )
        assert workbench_check["open"] is True, workbench_check
        assert workbench_check["closedByAttr"] == "any", workbench_check
        assert workbench_check["overscroll"] == "contain", workbench_check
        assert workbench_check["canvasWidth"] == 1440 and workbench_check["canvasHeight"] == 640, workbench_check
        assert workbench_check["stepCount"] == 3, workbench_check

        # Trigger step 1 ('letter') inside the contraption workbench
        page.click('.contraption-step-btn[data-step="letter"]')
        page.click("#contraptionDoneBtn")
        assert page.evaluate("() => !document.querySelector('#contraptionModal').open")

        # Verify posture stretch & crouch
        posture_check = page.evaluate(
            """() => {
            window.HildaTest.setPosture(16);
            const stretched = window.HildaTest.phaser().postureOffset;
            window.HildaTest.setPosture(-18);
            const crouched = window.HildaTest.phaser().postureOffset;
            window.HildaTest.setPosture(0);
            return { stretched, crouched };
        }"""
        )
        assert posture_check["stretched"] > 0 and posture_check["crouched"] < 0, posture_check

        browser.close()

    assert not errors, f"Console/Page errors: {errors}"
    assert not requests, f"Unexpected network requests: {requests}"

    report = {
        "passed": True,
        "artifact_sha256": hashlib.sha256(INDEX.read_bytes()).hexdigest(),
        "phaser_version": phaser_status["version"],
        "canvas": [phaser_status["canvasWidth"], phaser_status["canvasHeight"]],
        "thought_bubble": thought_check,
        "workbench": workbench_check,
        "posture": posture_check,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

# V3.3 光与回声

This release changes the running game, not only a concept sheet. It retains all twelve chapters, the V3 save key and existing puzzle prerequisites.

## Characters

- One shared layered SVG cast library is used by both stage characters and dialogue portraits. Hilda's playable actor uses that same head, hair, costume, scarf and boots with the existing contact-driven rig.
- Hilda, David, Frida and Johanna receive distinct costume palettes, shaped hair, facial features, layered fabric, satchel straps, buckles and boot details. Alfur, Twig, the trolls and Woff also have dedicated redrawn renderers.
- Facial expressions respond to peril and homecoming. Hilda has a small talking-mouth animation. Companion leg motion follows actual distance travelled, rather than continuing to walk while stationary. Breathing, blinking, scarf and tail motion respect reduced-motion/pause settings.
- Bridge and roof brace sleeves match David's new costume. Roof brace hides the redundant resting arms, then restores them for boarding.

## Sound

- Five original synthesized cue families with deterministic eight-bar phrases: hearth, trail, mystery, storm and dawn. Returning home reprises the opening motif. The roof cue changes to hope after the beacon and both human rescues are complete.
- Musical layers include a soft plucked voice, woodwind-like lead, sustained bass/pad and a pressure-dependent pulse. Stereo positioning and a short synthesized room are part of the runtime renderer. These are procedural timbres, not recorded orchestral instruments.
- Separate music, environment, effects and speech-blip sliders, persisted and validated in saves. Old saves receive defaults. Dialogue reduces music without reducing the effects bus. Sound is still disabled until the player opts in.
- Fixed same-scene unmute, master-gain restoration, rapid toggle races and transport suspend/resume. Audio-clock lookahead, voice caps and cleanup keep scheduled work bounded.
- Wood/metal/rope/water effects now include short filtered transients rather than all being sequences of notes.

## Checks

`npm run check` builds the dependency-free offline HTML and runs unit tests.
`python tests/playthrough.py` runs the existing complete UI-driven adventure and regressions.
`python tests/art-audio.py` verifies real Chromium rendering, audio opt-in/toggles, mixer controls, score transitions, simulated visibility handling and five finite stereo OfflineAudioContext renders.
`python tests/native-storage.py` checks native HTTP/file-origin storage on an unrestricted runner.

Audio renders and PCM peak checks establish that the same synthesis code produces a signal. They are not a listening-panel, headphone calibration, perceptual-loudness or professional mix certification. Layout emulation is not physical-phone testing. Native persistence must be reported separately from the explicit in-memory adapter used by the main UI tests.

## Boundaries

This is an improved playable prototype, not a claim of completed commercial-release art. The in-game drawings remain procedural vector illustrations. The earlier painterly concept sheets are not shipped animation atlases. Dedicated frame animation, a broader sound library, human listening/playtesting and physical-device/Safari/Firefox validation remain future work. Hilda is a non-official fan setting; no rights clearance is claimed.

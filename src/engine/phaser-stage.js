/**
 * Phaser 3/4 Hardware-Accelerated Stage, Camera, Particle & Skeletal Container Engine.
 * Drives the interactive game viewport using Phaser.Game, Phaser.Scene,
 * hierarchical Phaser.GameObjects.Container character skeletons, dynamic lighting,
 * and Machinarium-style physical body posture (stretch / crouch).
 */
Homeward.define(
  "engine/phaser-stage",
  ["engine/hd-assets", "engine/kinematics", "engine/walk-cycle", "engine/body-motion", "engine/animal-life", "engine/hydraulics", "content/staging", "art/cast-design"],
  (HDAssets, Kinematics, WalkCycle, BodyMotion, Animal, Hydraulics, Staging, CastDesign) => {
    const WORLD_W = HDAssets.WORLD_W;
    const WORLD_H = HDAssets.WORLD_H;

    class PhaserStageController {
      constructor() {
        this.game = null;
        this.scene = null;
        this.ready = false;
        this.mountEl = null;
        this.postureOffset = 0; // Machinarium-style vertical stretch (+) / crouch (-)
        this.targetPosture = 0;
        this.lastSceneKey = "";
        this.footstepPuffs = [];
        this.ripples = [];
        this.lastHeroX = 790;
        this.frameCount = 0;
        this.rigSnapshot = {
          hero: { x: 790, y: 775, scale: 1.36, postureOffset: 0, bones: {} },
          twig: { x: 714, y: 775, mode: "rest", legs: 4 },
          camera: { x: 0, y: 0, w: WORLD_W, h: WORLD_H, zoom: 1 }
        };
      }

      /**
       * Initializes the Phaser.Game instance inside #phaserStage when running in a browser.
       */
      mount(containerEl) {
        if (this.game || !containerEl || typeof globalThis.Phaser === "undefined") {
          return this;
        }
        this.mountEl = containerEl;
        const controller = this;
        const Phaser = globalThis.Phaser;

        class HomewardWorldScene extends Phaser.Scene {
          constructor() {
            super({ key: "HomewardWorldScene" });
          }

          create() {
            controller.scene = this;
            controller.ready = true;

            // Create 5 Parallax & Stage Layer Containers in Phaser Scene Graph
            this.skyLayer = this.add.container(0, 0).setDepth(10);
            this.midLayer = this.add.container(0, 0).setDepth(20);
            this.stageLayer = this.add.container(0, 0).setDepth(30);
            this.actorLayer = this.add.container(0, 0).setDepth(40);
            this.fxLayer = this.add.container(0, 0).setDepth(50);

            // Create HiDPI CanvasTexture for atmospheric lighting & shaders
            if (!this.textures.exists("hd-atmosphere")) {
              this.atmoTex = this.textures.createCanvas("hd-atmosphere", WORLD_W, WORLD_H);
            } else {
              this.atmoTex = this.textures.get("hd-atmosphere");
            }
            this.atmoImage = this.add.image(WORLD_W * 0.5, WORLD_H * 0.5, "hd-atmosphere").setDepth(45);

            // Dynamic Graphics layers for weather, hydraulic leaks, and footsteps
            this.stageGraphics = this.add.graphics().setDepth(35);
            this.fxGraphics = this.add.graphics().setDepth(52);

            // Build Hierarchical Skeletal Container for Hilda
            this.heroRoot = this.add.container(790, 775);
            this.heroPelvis = this.add.container(0, -48);
            this.heroTorso = this.add.container(0, -30);
            this.heroHead = this.add.container(0, -57);
            this.heroScarf = this.add.container(16, -34);
            this.heroArmBack = this.add.container(-22, -31);
            this.heroArmFront = this.add.container(22, -31);
            this.heroLegBack = this.add.container(-11, 0);
            this.heroLegFront = this.add.container(11, 0);
            this.heroRigGraphics = this.add.graphics();

            this.heroTorso.add([this.heroScarf, this.heroHead]);
            this.heroPelvis.add([
              this.heroLegBack,
              this.heroArmBack,
              this.heroTorso,
              this.heroLegFront,
              this.heroArmFront
            ]);
            this.heroRoot.add([this.heroPelvis, this.heroRigGraphics]);

            // Build Quadruped Container for Twig
            this.twigRoot = this.add.container(714, 775);
            this.twigGraphics = this.add.graphics();
            this.twigRoot.add(this.twigGraphics);

            this.actorLayer.add([this.twigRoot, this.heroRoot]);
          }
        }

        try {
          this.game = new Phaser.Game({
            type: Phaser.CANVAS,
            parent: containerEl,
            width: WORLD_W,
            height: WORLD_H,
            transparent: true,
            banner: false,
            audio: { noAudio: true },
            scale: {
              mode: Phaser.Scale?.NONE ?? 0,
              width: WORLD_W,
              height: WORLD_H
            },
            scene: [HomewardWorldScene]
          });
        } catch (err) {
          this.ready = false;
        }
        return this;
      }

      /**
       * Sets Machinarium-style vertical body stretch (+18 max) or crouch (-22 min).
       */
      setPosture(offset = 0) {
        if (!Number.isFinite(offset)) return this.postureOffset;
        this.targetPosture = Math.max(-22, Math.min(18, offset));
        this.postureOffset += (this.targetPosture - this.postureOffset) * 0.35;
        return this.postureOffset;
      }

      /**
       * Computes and updates the Phaser skeletal rig pose, camera, particles, and lighting.
       */
      syncFrame({
        state,
        titleMode = false,
        elapsed = 0,
        dt = 0.016,
        hero = { x: 790, y: 775, face: 1 },
        petSnapshot = { x: 714, speed: 0, face: 1, mode: "rest" },
        camera = { x: 0, y: 0, w: WORLD_W, h: WORLD_H },
        moving = false,
        walkDistance = 0,
        walkAmount = 0,
        activeWork = null,
        selected = null,
        paused = false
      } = {}) {
        const sceneIndex = titleMode ? 7 : (state?.scene ?? 0);
        const scale = Staging.scale(sceneIndex);
        const reduced = !!state?.settings?.reduced;
        const score = activeWork?.score || null;
        const frame = activeWork?.sample?.() || null;

        // Smooth posture return when walking or working
        if (moving || activeWork) {
          this.targetPosture = 0;
        }
        this.postureOffset += (this.targetPosture - this.postureOffset) * Math.min(1, dt * 10);

        const pose = BodyMotion.sample({
          x: hero.x,
          y: hero.y,
          face: hero.face || 1,
          scale,
          time: elapsed,
          distance: walkDistance,
          moving,
          walkAmount,
          reduced,
          score,
          frame
        });

        // Apply Machinarium-style vertical posture stretch/crouch to pelvis & head
        const bodyOffsetY = (pose.offset?.[1] || 0) - this.postureOffset * 0.45;
        const bodyOffsetX = pose.offset?.[0] || 0;

        this.rigSnapshot = {
          engine: typeof globalThis.Phaser !== "undefined" ? `Phaser ${globalThis.Phaser.VERSION || "4.x"}` : "Headless",
          ready: this.ready,
          frameCount: ++this.frameCount,
          hero: {
            x: hero.x,
            y: hero.y,
            face: hero.face || 1,
            scale,
            postureOffset: Number(this.postureOffset.toFixed(3)),
            pelvis: [Number(bodyOffsetX.toFixed(3)), Number((-48 + bodyOffsetY).toFixed(3))],
            headTilt: Number((pose.headTilt || 0).toFixed(3)),
            armFront: pose.armFront,
            armBack: pose.armBack,
            legs: pose.legs
          },
          twig: {
            x: petSnapshot?.x ?? 714,
            speed: petSnapshot?.speed ?? 0,
            face: petSnapshot?.face ?? 1,
            legs: 4
          },
          camera: {
            x: camera.x,
            y: camera.y,
            w: camera.w,
            h: camera.h,
            zoom: Number((WORLD_W / Math.max(1, camera.w)).toFixed(4))
          }
        };

        // Spawn footstep dust puffs when Hilda walks
        if (!paused && !reduced && Math.abs(hero.x - this.lastHeroX) > 14) {
          this.lastHeroX = hero.x;
          this.footstepPuffs.push({
            x: hero.x - (hero.face || 1) * 12,
            y: hero.y - 2,
            r: 4,
            alpha: 0.42,
            vx: -(hero.face || 1) * 18,
            vy: -14
          });
          if (this.footstepPuffs.length > 24) this.footstepPuffs.shift();
        }

        if (!this.ready || !this.scene) {
          return this.rigSnapshot;
        }

        const sc = this.scene;

        // 1. Sync Phaser Main Camera with world viewBox
        const cam = sc.cameras?.main;
        if (cam) {
          const zoomX = WORLD_W / Math.max(1, camera.w);
          const zoomY = WORLD_H / Math.max(1, camera.h);
          const zoom = Math.min(zoomX, zoomY);
          cam.setZoom(zoom);
          cam.centerOn(camera.x + camera.w * 0.5, camera.y + camera.h * 0.5);
        }

        // 2. Sync Hierarchical Phaser Actor Containers
        sc.heroRoot.setPosition(hero.x, hero.y);
        sc.heroRoot.setScale((hero.face || 1) * scale, scale);
        sc.heroPelvis.setPosition(bodyOffsetX, -48 + bodyOffsetY);
        sc.heroHead.setRotation(((pose.headTilt || 0) * Math.PI) / 180);
        sc.heroArmFront.setPosition(pose.armFront.origin[0], pose.armFront.origin[1]);
        sc.heroArmBack.setPosition(pose.armBack.origin[0], pose.armBack.origin[1]);
        sc.twigRoot.setPosition(petSnapshot?.x ?? 714, hero.y);

        // 3. Render HD Atmospheric Lighting & Lantern Aura onto Phaser CanvasTexture
        if (sc.atmoTex && (!paused || this.frameCount % 4 === 1)) {
          const ctx = sc.atmoTex.getContext();
          ctx.clearRect(0, 0, WORLD_W, WORLD_H);
          HDAssets.renderHDAtmosphere(ctx, state, elapsed, hero, selected, titleMode);
          sc.atmoTex.refresh();
        }

        // 4. Render Live Phaser Particle FX (Footsteps, Hydraulic Leaks, Resonance Waves, Rain Splashes)
        const fx = sc.fxGraphics;
        if (fx) {
          fx.clear();

          // Footstep dust puffs
          for (let i = this.footstepPuffs.length - 1; i >= 0; i--) {
            const p = this.footstepPuffs[i];
            if (!paused) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.r += dt * 12;
              p.alpha -= dt * 0.75;
            }
            if (p.alpha <= 0.01) {
              this.footstepPuffs.splice(i, 1);
              continue;
            }
            fx.fillStyle(0xe8d8b0, p.alpha);
            fx.fillCircle(p.x, p.y, p.r);
          }

          // Scene 4: Pressurized Hydraulic Leak Sprays & Water Flow Glow
          if (sceneIndex === 4 && !titleMode) {
            const trace = Hydraulics.trace(state.valves || [0, 1, 0], !state.f.intakeClosed);
            const coords = [[640, 400], [640, 570], [940, 570]];
            for (const wIdx of trace.wet) {
              const [wx, wy] = coords[wIdx] || [640, 570];
              fx.lineStyle(3, 0x7ce8e2, 0.28);
              fx.strokeCircle(wx, wy, 54 + (reduced ? 0 : Math.sin(elapsed * 5 + wIdx) * 3));
            }
            if (!reduced) {
              for (const leak of trace.leaks) {
                const [lx, ly] = coords[leak.node] || [640, 570];
                for (let k = 0; k < 5; k++) {
                  const t = ((elapsed * 3.2 + k * 0.2) % 1);
                  const sx = lx + (k - 2) * 8 * t;
                  const sy = ly + 28 * t + 36 * t * t;
                  fx.fillStyle(0x9ef0ec, (1 - t) * 0.55);
                  fx.fillCircle(sx, sy, 3.2 * (1 - t * 0.5));
                }
              }
            }
          }

          // Scene 6 & 8: Acoustic Resonance Wave Rings
          if ((sceneIndex === 6 || sceneIndex === 8) && !titleMode && !reduced) {
            const cx = sceneIndex === 6 ? 610 : 662;
            const cy = sceneIndex === 6 ? 375 : 650;
            const active = sceneIndex === 6 ? state.f.calm : state.f.heart;
            if (active) {
              for (let rIdx = 0; rIdx < 3; rIdx++) {
                const u = ((elapsed * 0.65 + rIdx * 0.33) % 1);
                fx.lineStyle(2, 0xf5de9e, (1 - u) * 0.32);
                fx.strokeCircle(cx, cy, 36 + u * 145);
              }
            }
          }

          // Rain ground splash ripples in rainy chapters
          if ([1, 2, 5, 7, 9].includes(sceneIndex) && !titleMode && !reduced) {
            for (let i = 0; i < 10; i++) {
              const u = ((elapsed * 1.8 + i * 0.37) % 1);
              const rx = ((i * 173 + sceneIndex * 97) % 1440) + 80;
              const ry = 805 + (i % 3) * 18;
              fx.lineStyle(1.4, 0xb8dfd8, (1 - u) * 0.36);
              fx.strokeEllipse(rx, ry, 8 + u * 26, 2 + u * 5);
            }
          }
        }

        return this.rigSnapshot;
      }

      /**
       * Triggers a Phaser camera shake or flash effect.
       */
      triggerEffect(kind = "shake", reduced = false) {
        if (reduced || !this.ready || !this.scene?.cameras?.main) return;
        const cam = this.scene.cameras.main;
        if (kind === "shake" || kind === "water") {
          cam.shake?.(420, 0.0035);
        }
        if (kind === "water") {
          cam.flash?.(320, 235, 245, 255, false);
        }
      }

      getStatus() {
        return {
          engine: typeof globalThis.Phaser !== "undefined" ? `Phaser ${globalThis.Phaser.VERSION || "4.2.1"}` : "Headless",
          phaserLoaded: typeof globalThis.Phaser !== "undefined",
          ready: this.ready,
          frameCount: this.frameCount,
          postureOffset: this.postureOffset,
          rigSnapshot: this.rigSnapshot
        };
      }
    }

    const instance = new PhaserStageController();
    return {
      PhaserStageController,
      stage: instance
    };
  }
);

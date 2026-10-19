/**
 * Synchronous HiDPI Vector-to-Canvas2D Supersampling & Painterly Shader Pipeline.
 * Renders authored SVG geometry and decomposed parallax layers directly onto
 * Canvas2D / Phaser CanvasTextures using Path2D and DOMMatrix without external
 * or data-URI network requests.
 */
Homeward.define("engine/hd-assets", ["art/kit", "art/cast-design", "art/props", "art"], (Kit, CastDesign, Props, Art) => {
  const WORLD_W = 1600;
  const WORLD_H = 900;
  const DEFAULT_HD_SCALE = 2;

  const SCENE_PALETTES = Object.freeze([
    { name: "hearth", ambient: "#2c1e18", rim: "#ffdfa0", fog: "rgba(255, 214, 153, 0.08)", warmth: 0.88, rain: 0, motes: 28 },
    { name: "rain-gate", ambient: "#102834", rim: "#8ec5d6", fog: "rgba(138, 188, 198, 0.14)", warmth: 0.25, rain: 75, motes: 10 },
    { name: "whisper-woods", ambient: "#112b2d", rim: "#9ed6b8", fog: "rgba(146, 198, 174, 0.16)", warmth: 0.32, rain: 55, motes: 22 },
    { name: "root-archive", ambient: "#1f2826", rim: "#f5d796", fog: "rgba(240, 212, 152, 0.10)", warmth: 0.76, rain: 0, motes: 34 },
    { name: "waterworks", ambient: "#0f272d", rim: "#7fd4d2", fog: "rgba(130, 196, 192, 0.15)", warmth: 0.35, rain: 0, motes: 18 },
    { name: "mist-gondola", ambient: "#16323c", rim: "#b5dfd8", fog: "rgba(182, 218, 210, 0.22)", warmth: 0.40, rain: 35, motes: 16 },
    { name: "giant-shelter", ambient: "#142930", rim: "#ffda94", fog: "rgba(235, 204, 150, 0.12)", warmth: 0.68, rain: 0, motes: 30 },
    { name: "tower-door", ambient: "#152d35", rim: "#ebd094", fog: "rgba(164, 196, 186, 0.16)", warmth: 0.48, rain: 45, motes: 20 },
    { name: "clock-heart", ambient: "#162b2f", rim: "#f2cb82", fog: "rgba(218, 192, 140, 0.13)", warmth: 0.62, rain: 0, motes: 26 },
    { name: "storm-roof", ambient: "#0c2030", rim: "#9ad0e8", fog: "rgba(140, 185, 205, 0.20)", warmth: 0.22, rain: 110, motes: 12 },
    { name: "dawn-ridge", ambient: "#2c3d47", rim: "#ffe6b0", fog: "rgba(244, 220, 178, 0.16)", warmth: 0.82, rain: 0, motes: 32 },
    { name: "homecoming", ambient: "#2e221a", rim: "#ffe8b5", fog: "rgba(255, 228, 172, 0.10)", warmth: 0.95, rain: 0, motes: 36 }
  ]);

  function paletteFor(sceneIndex = 0) {
    const idx = Math.max(0, Math.min(SCENE_PALETTES.length - 1, Math.trunc(Number(sceneIndex) || 0)));
    return SCENE_PALETTES[idx];
  }

  /**
   * Decomposes a scene into 5 distinct parallax & lighting descriptors for Phaser.
   */
  function decomposeSceneLayers(state, titleMode = false) {
    const sceneIndex = titleMode ? 7 : (state?.scene ?? 0);
    const pal = paletteFor(sceneIndex);
    const f = state?.f || {};
    const lights = [];

    if (sceneIndex === 0 || sceneIndex === 11) {
      lights.push(
        { id: "window-sun", x: 1070, y: 440, r: 340, color: sceneIndex === 11 ? "#ffebb3" : "#ffd892", alpha: sceneIndex === 11 ? 0.34 : 0.24 },
        { id: "table-warmth", x: 805, y: 600, r: 210, color: "#ffcf80", alpha: 0.22 }
      );
      if (!f.lampTaken && sceneIndex === 0) {
        lights.push({ id: "door-lamp", x: 1292, y: 585, r: 165, color: "#ffe094", alpha: 0.32 });
      }
    } else if (sceneIndex === 1) {
      lights.push(
        { id: "gate-lantern-left", x: 520, y: 480, r: 190, color: "#ffd88a", alpha: 0.26 },
        { id: "gate-lantern-right", x: 1245, y: 455, r: 210, color: "#ffde96", alpha: f.gateOpen ? 0.35 : 0.22 }
      );
    } else if (sceneIndex === 2) {
      lights.push(
        { id: "elf-window", x: 1210, y: 605, r: 135, color: "#ffe49c", alpha: 0.28 },
        { id: "stream-glint", x: 760, y: 815, r: 240, color: "#8ee6dc", alpha: 0.14 }
      );
    } else if (sceneIndex === 3) {
      lights.push(
        { id: "archive-shaft", x: 960, y: 360, r: 360, color: "#ffe29e", alpha: 0.24 },
        { id: "alfur-desk", x: 406, y: 510, r: 180, color: "#ffd484", alpha: 0.28 }
      );
    } else if (sceneIndex === 4) {
      lights.push(
        { id: "waterworks-gauge", x: 1128, y: 473, r: 190, color: f.pump ? "#9ef0c8" : "#ffd88e", alpha: 0.25 },
        { id: "waterworks-lamp", x: 350, y: 420, r: 210, color: "#ffd890", alpha: 0.22 }
      );
    } else if (sceneIndex === 5) {
      lights.push(
        { id: "gondola-station-lamp", x: 640, y: 450, r: 220, color: "#ffdc94", alpha: 0.26 },
        { id: "gondola-cabin-lamp", x: 1194, y: 560, r: 190, color: "#ffe4a0", alpha: f.lift ? 0.34 : 0.18 }
      );
    } else if (sceneIndex === 6) {
      lights.push(
        { id: "shelter-pedestal", x: 782, y: 650, r: f.shadePlaced ? 290 : 160, color: f.shadePlaced ? "#ffcf86" : "#ffe8b0", alpha: f.shadePlaced ? 0.38 : 0.18 },
        { id: "song-wall-glow", x: 610, y: 375, r: 220, color: "#9cebe2", alpha: f.calm ? 0.30 : 0.16 }
      );
    } else if (sceneIndex === 7) {
      lights.push(
        { id: "tower-arch-left", x: 1090, y: 486, r: 240, color: f.gearAligned ? "#ffe8a6" : "#ffd280", alpha: f.gearAligned ? 0.34 : 0.20 },
        { id: "tower-door-torch", x: 1360, y: 460, r: 210, color: "#ffdb90", alpha: 0.25 }
      );
    } else if (sceneIndex === 8) {
      lights.push(
        { id: "clock-flywheel-glow", x: 662, y: 650, r: 270, color: f.heart ? "#a6f4dc" : "#ffd88c", alpha: f.heart ? 0.36 : 0.22 },
        { id: "clock-bell-glow", x: 838, y: 457, r: 220, color: "#ffe09a", alpha: 0.24 }
      );
    } else if (sceneIndex === 9) {
      lights.push(
        { id: "roof-beacon-core", x: 1292, y: 490, r: f.beacon ? 320 : 200, color: f.beacon ? "#fff0b8" : "#ffd88e", alpha: f.beacon ? 0.42 : 0.24 },
        { id: "roof-star", x: 1044, y: 176, r: 120, color: "#fff4c8", alpha: 0.35 }
      );
    } else if (sceneIndex === 10) {
      [430, 731, 1025].forEach((lx, i) => {
        const ly = [664, 622, 636][i];
        if (f["trail" + i]) {
          lights.push({ id: "trail-light-" + i, x: lx, y: ly, r: 220, color: "#ffe29a", alpha: 0.36 });
        }
      });
      lights.push({ id: "dawn-sun", x: 1190, y: 180, r: 420, color: "#ffebb8", alpha: 0.35 });
    }

    return {
      sceneIndex,
      palette: pal,
      parallax: [
        { key: "sky", scrollFactor: 0.18, depth: 10 },
        { key: "midground", scrollFactor: 0.48, depth: 20 },
        { key: "architecture", scrollFactor: 1.0, depth: 30 },
        { key: "actors", scrollFactor: 1.0, depth: 40 },
        { key: "foreground", scrollFactor: 1.14, depth: 50 }
      ],
      lights
    };
  }

  /**
   * Parses an SVG transform attribute string into a 6-element 2D affine matrix [a,b,c,d,e,f].
   */
  function parseTransform(transformStr) {
    let m = [1, 0, 0, 1, 0, 0];
    if (!transformStr) return m;
    const mul = (a, b) => [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5]
    ];
    const re = /(translate|scale|rotate)\s*\(([^)]+)\)/g;
    let match;
    while ((match = re.exec(transformStr)) !== null) {
      const fn = match[1];
      const args = match[2].trim().split(/[\s,]+/).map(Number);
      if (fn === "translate") {
        const tx = args[0] || 0;
        const ty = args[1] || 0;
        m = mul(m, [1, 0, 0, 1, tx, ty]);
      } else if (fn === "scale") {
        const sx = Number.isFinite(args[0]) ? args[0] : 1;
        const sy = Number.isFinite(args[1]) ? args[1] : sx;
        m = mul(m, [sx, 0, 0, sy, 0, 0]);
      } else if (fn === "rotate") {
        const rad = ((args[0] || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const cx = args[1] || 0;
        const cy = args[2] || 0;
        if (cx !== 0 || cy !== 0) {
          m = mul(m, [1, 0, 0, 1, cx, cy]);
          m = mul(m, [cos, sin, -sin, cos, 0, 0]);
          m = mul(m, [1, 0, 0, 1, -cx, -cy]);
        } else {
          m = mul(m, [cos, sin, -sin, cos, 0, 0]);
        }
      }
    }
    return m;
  }

  /**
   * Collects gradient definitions from an SVG root node so Canvas2D can resolve url(#id) fills.
   */
  function collectDefs(root) {
    const defs = new Map();
    if (!root || !root.querySelectorAll) return defs;
    for (const lg of root.querySelectorAll("linearGradient")) {
      const id = lg.getAttribute("id");
      if (!id) continue;
      const stops = [...lg.querySelectorAll("stop")].map(s => ({
        offset: parseFloat(s.getAttribute("offset") || "0"),
        color: s.getAttribute("stop-color") || "#ffffff",
        opacity: parseFloat(s.getAttribute("stop-opacity") ?? "1")
      }));
      defs.set(id, {
        type: "linear",
        x1: parseFloat(lg.getAttribute("x1") || "0"),
        y1: parseFloat(lg.getAttribute("y1") || "0"),
        x2: parseFloat(lg.getAttribute("x2") || "1"),
        y2: parseFloat(lg.getAttribute("y2") || "0"),
        stops
      });
    }
    for (const rg of root.querySelectorAll("radialGradient")) {
      const id = rg.getAttribute("id");
      if (!id) continue;
      const stops = [...rg.querySelectorAll("stop")].map(s => ({
        offset: parseFloat(s.getAttribute("offset") || "0"),
        color: s.getAttribute("stop-color") || "#ffffff",
        opacity: parseFloat(s.getAttribute("stop-opacity") ?? "1")
      }));
      defs.set(id, { type: "radial", stops });
    }
    return defs;
  }

  function hexWithAlpha(color, alpha = 1) {
    if (!color || color === "none") return "rgba(0,0,0,0)";
    if (alpha >= 0.999) return color;
    if (color.startsWith("#")) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
      if (hex.length >= 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = hex.length === 8 ? (parseInt(hex.slice(6, 8), 16) / 255) * alpha : alpha;
        return `rgba(${r},${g},${b},${a.toFixed(3)})`;
      }
    }
    return color;
  }

  function resolvePaint(ctx, paintStr, defs, bounds) {
    if (!paintStr || paintStr === "none") return null;
    if (paintStr.startsWith("url(#")) {
      const id = paintStr.slice(5, -1);
      if (id === "plaster" || id === "brick" || id === "v3Stone") return "rgba(32, 64, 68, 0.14)";
      if (id === "grain" || id === "v3Fabric" || id === "cast-knit" || id === "paperlines") return "rgba(255, 244, 214, 0.06)";
      const def = defs.get(id);
      if (!def) return "#547672";
      const bx = bounds?.x ?? 0;
      const by = bounds?.y ?? 0;
      const bw = Math.max(1, bounds?.w ?? WORLD_W);
      const bh = Math.max(1, bounds?.h ?? WORLD_H);
      if (def.type === "linear") {
        const grad = ctx.createLinearGradient(
          bx + def.x1 * bw,
          by + def.y1 * bh,
          bx + def.x2 * bw,
          by + def.y2 * bh
        );
        for (const s of def.stops) {
          grad.addColorStop(Math.max(0, Math.min(1, s.offset)), hexWithAlpha(s.color, s.opacity));
        }
        return grad;
      }
      if (def.type === "radial") {
        const cx = bx + bw * 0.5;
        const cy = by + bh * 0.5;
        const r = Math.max(bw, bh) * 0.5;
        const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
        for (const s of def.stops) {
          grad.addColorStop(Math.max(0, Math.min(1, s.offset)), hexWithAlpha(s.color, s.opacity));
        }
        return grad;
      }
    }
    return paintStr;
  }

  /**
   * Synchronously renders an SVG DOM subtree onto a 2D Canvas context at HiDPI resolution.
   * Uses native Path2D for crisp vector rasterization without triggering any network/image requests.
   */
  function renderSvgNodeToCanvas(ctx, node, defs, inheritedOpacity = 1) {
    if (!node || node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "defs" || tag === "clippath" || tag === "filter" || tag === "pattern") return;
    if (node.id === "hotspotLayer") return;
    if (node.style && node.style.visibility === "hidden") return;

    const rawOpacity = parseFloat(node.getAttribute("opacity") ?? "1");
    const opacity = inheritedOpacity * (Number.isFinite(rawOpacity) ? rawOpacity : 1);
    if (opacity <= 0.001) return;

    ctx.save();
    const transformAttr = node.getAttribute("transform");
    if (transformAttr) {
      const [a, b, c, d, e, f] = parseTransform(transformAttr);
      ctx.transform(a, b, c, d, e, f);
    }

    if (tag === "g" || tag === "svg") {
      for (const child of node.children) {
        renderSvgNodeToCanvas(ctx, child, defs, opacity);
      }
      ctx.restore();
      return;
    }

    ctx.globalAlpha = opacity;
    const fillAttr = node.getAttribute("fill") ?? (tag === "text" ? "#f3dfb7" : "#000000");
    const strokeAttr = node.getAttribute("stroke") ?? "none";
    const strokeW = parseFloat(node.getAttribute("stroke-width") || "1");
    const lineCap = node.getAttribute("stroke-linecap") || "round";
    const lineJoin = node.getAttribute("stroke-linejoin") || "round";
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    if (tag === "path" && typeof globalThis.Path2D === "function") {
      const d = node.getAttribute("d");
      if (d && !/NaN|undefined/.test(d)) {
        const p2d = new globalThis.Path2D(d);
        if (fillAttr && fillAttr !== "none") {
          const style = resolvePaint(ctx, fillAttr, defs, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
          if (style) {
            ctx.fillStyle = style;
            ctx.fill(p2d);
          }
        }
        if (strokeAttr && strokeAttr !== "none" && strokeW > 0) {
          const sStyle = resolvePaint(ctx, strokeAttr, defs, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
          if (sStyle) {
            ctx.strokeStyle = sStyle;
            ctx.lineWidth = strokeW;
            ctx.stroke(p2d);
          }
        }
      }
    } else if (tag === "rect") {
      const x = parseFloat(node.getAttribute("x") || "0");
      const y = parseFloat(node.getAttribute("y") || "0");
      const w = parseFloat(node.getAttribute("width") || "0");
      const h = parseFloat(node.getAttribute("height") || "0");
      const rx = parseFloat(node.getAttribute("rx") || "0");
      if (w > 0 && h > 0) {
        ctx.beginPath();
        if (rx > 0 && typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, rx);
        else ctx.rect(x, y, w, h);
        if (fillAttr && fillAttr !== "none") {
          const style = resolvePaint(ctx, fillAttr, defs, { x, y, w, h });
          if (style) {
            ctx.fillStyle = style;
            ctx.fill();
          }
        }
        if (strokeAttr && strokeAttr !== "none" && strokeW > 0) {
          ctx.strokeStyle = resolvePaint(ctx, strokeAttr, defs, { x, y, w, h }) || strokeAttr;
          ctx.lineWidth = strokeW;
          ctx.stroke();
        }
      }
    } else if (tag === "circle") {
      const cx = parseFloat(node.getAttribute("cx") || "0");
      const cy = parseFloat(node.getAttribute("cy") || "0");
      const r = parseFloat(node.getAttribute("r") || "0");
      if (r > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        if (fillAttr && fillAttr !== "none") {
          const style = resolvePaint(ctx, fillAttr, defs, { x: cx - r, y: cy - r, w: r * 2, h: r * 2 });
          if (style) {
            ctx.fillStyle = style;
            ctx.fill();
          }
        }
        if (strokeAttr && strokeAttr !== "none" && strokeW > 0) {
          ctx.strokeStyle = strokeAttr;
          ctx.lineWidth = strokeW;
          ctx.stroke();
        }
      }
    } else if (tag === "ellipse") {
      const cx = parseFloat(node.getAttribute("cx") || "0");
      const cy = parseFloat(node.getAttribute("cy") || "0");
      const rx = parseFloat(node.getAttribute("rx") || "0");
      const ry = parseFloat(node.getAttribute("ry") || "0");
      if (rx > 0 && ry > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (fillAttr && fillAttr !== "none") {
          const style = resolvePaint(ctx, fillAttr, defs, { x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2 });
          if (style) {
            ctx.fillStyle = style;
            ctx.fill();
          }
        }
        if (strokeAttr && strokeAttr !== "none" && strokeW > 0) {
          ctx.strokeStyle = strokeAttr;
          ctx.lineWidth = strokeW;
          ctx.stroke();
        }
      }
    } else if (tag === "polygon") {
      const pts = (node.getAttribute("points") || "").trim().split(/\s+/).map(pair => pair.split(",").map(Number));
      if (pts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        if (fillAttr && fillAttr !== "none") {
          ctx.fillStyle = resolvePaint(ctx, fillAttr, defs, { x: -80, y: -80, w: 160, h: 160 }) || fillAttr;
          ctx.fill();
        }
        if (strokeAttr && strokeAttr !== "none" && strokeW > 0) {
          ctx.strokeStyle = strokeAttr;
          ctx.lineWidth = strokeW;
          ctx.stroke();
        }
      }
    } else if (tag === "text") {
      const x = parseFloat(node.getAttribute("x") || "0");
      const y = parseFloat(node.getAttribute("y") || "0");
      const size = parseFloat(node.getAttribute("font-size") || "15");
      ctx.font = `600 ${size}px "Noto Sans CJK SC", system-ui, sans-serif`;
      ctx.textAlign = node.getAttribute("text-anchor") === "middle" ? "center" : "left";
      ctx.fillStyle = fillAttr;
      ctx.fillText(node.textContent || "", x, y);
    }

    ctx.restore();
  }

  /**
   * Renders HD atmospheric lighting halos, volumetric beams, and watercolor grain onto a Canvas2D context.
   */
  function renderHDAtmosphere(ctx, state, elapsed = 0, hero = { x: 790, y: 780 }, selected = null, titleMode = false) {
    const desc = decomposeSceneLayers(state, titleMode);
    const reduced = !!state?.settings?.reduced;
    const pulse = reduced ? 1 : 0.94 + Math.sin(elapsed * 2.4) * 0.06;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const light of desc.lights) {
      const r = light.r * pulse;
      const grad = ctx.createRadialGradient(light.x, light.y, 2, light.x, light.y, r);
      grad.addColorStop(0, hexWithAlpha(light.color, light.alpha));
      grad.addColorStop(0.45, hexWithAlpha(light.color, light.alpha * 0.38));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(light.x, light.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!titleMode && (selected === "lamp" || selected === "shade" || state?.inventory?.includes("lamp") || state?.inventory?.includes("shade"))) {
      const holding = selected === "lamp" || selected === "shade";
      const lx = hero.x + (hero.face || 1) * (holding ? 38 : 14);
      const ly = hero.y - (holding ? 92 : 76);
      const lr = holding ? 245 * pulse : 140 * pulse;
      const lAlpha = holding ? 0.34 : 0.14;
      const grad = ctx.createRadialGradient(lx, ly, 4, lx, ly, lr);
      grad.addColorStop(0, hexWithAlpha("#ffe59e", lAlpha));
      grad.addColorStop(0.4, hexWithAlpha("#f7b963", lAlpha * 0.42));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Subtle HD vignette & cold-press paper edge polish
    ctx.save();
    const vig = ctx.createRadialGradient(WORLD_W * 0.5, WORLD_H * 0.48, WORLD_W * 0.34, WORLD_W * 0.5, WORLD_H * 0.5, WORLD_W * 0.62);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(9, 24, 31, 0.32)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();
  }

  return {
    WORLD_W,
    WORLD_H,
    DEFAULT_HD_SCALE,
    SCENE_PALETTES,
    paletteFor,
    decomposeSceneLayers,
    parseTransform,
    collectDefs,
    renderSvgNodeToCanvas,
    renderHDAtmosphere
  };
});

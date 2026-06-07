/* InvestRight — Global Background: Green Glow + Liquid Glass Bubbles */
(function () {
  if (document.getElementById('ir-bg-canvas')) return;

  /* ── Inject global styles ── */
  const style = document.createElement('style');
  style.textContent = `
    body {
      background: #0a0f1a !important;
      position: relative;
    }

    /* ── Ambient glow layer ── */
    #ir-bg-glow {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 20% 80%, rgba(0,212,170,0.07) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(124,58,237,0.05) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(0,212,170,0.10) 0%, transparent 55%);
    }

    /* ── Canvas sits behind everything ── */
    #ir-bg-canvas {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    /* ── All page content above canvas ── */
    body > *:not(#ir-bg-glow):not(#ir-bg-canvas) {
      position: relative;
      z-index: 2;
    }

    /* ══════════════════════════════════════
       LIQUID GLASS DESIGN SYSTEM
       Applied globally to matching elements
    ══════════════════════════════════════ */

    /* Nav — liquid glass */
    nav {
      background: rgba(10,15,26,0.55) !important;
      backdrop-filter: blur(24px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
      border-bottom: 1px solid rgba(255,255,255,0.07) !important;
      box-shadow: 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3) !important;
    }

    /* Cards — liquid glass surface */
    .nav-card, .card, [class*="card"]:not([class*="badge"]) {
      background: rgba(255,255,255,0.035) !important;
      backdrop-filter: blur(16px) saturate(150%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(150%) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        inset 0 -1px 0 rgba(0,0,0,0.2),
        0 8px 32px rgba(0,0,0,0.25),
        0 2px 8px rgba(0,0,0,0.15) !important;
      transition: all 0.3s ease !important;
    }
    .nav-card:hover, .card:hover {
      background: rgba(255,255,255,0.055) !important;
      border-color: rgba(0,212,170,0.25) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.12),
        inset 0 -1px 0 rgba(0,0,0,0.2),
        0 16px 48px rgba(0,0,0,0.3),
        0 0 0 1px rgba(0,212,170,0.12),
        0 0 40px rgba(0,212,170,0.06) !important;
      transform: translateY(-3px) !important;
    }

    /* Surface panels — glass */
    .hero-stats, .steps, .cta-inner,
    .prompt-box, .chat-header,
    [class*="panel"], [class*="section"] > [class*="inner"] {
      background: rgba(255,255,255,0.03) !important;
      backdrop-filter: blur(20px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.07),
        0 8px 32px rgba(0,0,0,0.2) !important;
    }

    /* Message bubbles — glass */
    .bubble, .msg.ai .bubble {
      background: rgba(255,255,255,0.04) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.06),
        0 4px 16px rgba(0,0,0,0.2) !important;
    }
    .msg.user .bubble {
      background: rgba(0,212,170,0.08) !important;
      border: 1px solid rgba(0,212,170,0.2) !important;
    }

    /* Input area */
    .input-area {
      background: rgba(10,15,26,0.55) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-top: 1px solid rgba(255,255,255,0.06) !important;
    }

    /* Chips / pills */
    .chip, .app-pill, .hero-badge {
      background: rgba(255,255,255,0.04) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.06) !important;
    }
    .chip:hover {
      background: rgba(0,212,170,0.1) !important;
      border-color: rgba(0,212,170,0.3) !important;
    }

    /* Stat boxes */
    .stat {
      background: transparent !important;
    }

    /* Steps */
    .step {
      background: rgba(255,255,255,0.02) !important;
    }
  `;
  document.head.appendChild(style);

  /* ── Glow layer ── */
  const glow = document.createElement('div');
  glow.id = 'ir-bg-glow';
  document.body.prepend(glow);

  /* ── Canvas ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'ir-bg-canvas';
  document.body.prepend(canvas);

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ════════════════════════════════════
     LIQUID GLASS BUBBLES CONFIG
  ════════════════════════════════════ */

  // Small floating balls (original)
  const SMALL_COLORS = ['#22d38c', '#22d38c', '#00d4aa', '#1EAEDB', '#34d399'];
  const smallBalls = Array.from({ length: 22 }, () => mkSmall());

  function mkSmall() {
    return {
      x:     Math.random() * canvas.width,
      y:     canvas.height + 20 + Math.random() * 180,
      r:     2 + Math.random() * 5,
      vx:    (Math.random() - 0.35) * 0.7,
      vy:    -(0.4 + Math.random() * 0.9),
      alpha: 0.08 + Math.random() * 0.18,
      color: SMALL_COLORS[Math.floor(Math.random() * SMALL_COLORS.length)],
      phase: Math.random() * Math.PI * 2
    };
  }

  // Large liquid glass bubbles
  const BUBBLE_COLORS = [
    { r:0,   g:212, b:170 },  // teal
    { r:0,   g:212, b:170 },  // teal (doubled weight)
    { r:34,  g:211, b:140 },  // green
    { r:124, g:58,  b:237 },  // purple
    { r:30,  g:174, b:219 },  // blue
    { r:52,  g:211, b:153 },  // emerald
  ];

  const largeBubbles = Array.from({ length: 9 }, () => mkBubble());

  function mkBubble() {
    const col = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    const r = 28 + Math.random() * 52;
    return {
      x:       Math.random() * canvas.width,
      y:       canvas.height + r + Math.random() * 300,
      r,
      vx:      (Math.random() - 0.45) * 0.35,
      vy:      -(0.18 + Math.random() * 0.32),
      col,
      alpha:   0.06 + Math.random() * 0.1,
      phase:   Math.random() * Math.PI * 2,
      wobble:  Math.random() * Math.PI * 2,
      wobbleSpeed: 0.008 + Math.random() * 0.01,
    };
  }

  /* ── Draw one liquid glass bubble ── */
  function drawBubble(ctx, b) {
    b.wobble += b.wobbleSpeed;
    b.phase  += 0.012;

    const alpha = b.alpha + Math.sin(b.phase) * 0.025;
    const { r: cr, g: cg, b: cb } = b.col;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(0.9, alpha));

    // Main body — radial gradient (darker center, lighter rim = glass look)
    const body = ctx.createRadialGradient(
      b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.05,
      b.x, b.y, b.r
    );
    body.addColorStop(0,   `rgba(${cr},${cg},${cb},0.04)`);
    body.addColorStop(0.6, `rgba(${cr},${cg},${cb},0.07)`);
    body.addColorStop(1,   `rgba(${cr},${cg},${cb},0.18)`);

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    // Rim highlight
    ctx.globalAlpha = Math.max(0, Math.min(0.9, alpha * 1.8));
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.35)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner specular — top-left shine
    ctx.globalAlpha = Math.max(0, Math.min(0.9, alpha * 2.5));
    const shine = ctx.createRadialGradient(
      b.x - b.r * 0.32, b.y - b.r * 0.38, 0,
      b.x - b.r * 0.28, b.y - b.r * 0.3, b.r * 0.52
    );
    shine.addColorStop(0, `rgba(255,255,255,0.22)`);
    shine.addColorStop(0.5, `rgba(255,255,255,0.06)`);
    shine.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = shine;
    ctx.fill();

    // Bottom caustic glint
    ctx.globalAlpha = Math.max(0, Math.min(0.9, alpha * 1.2));
    const caustic = ctx.createRadialGradient(
      b.x + b.r * 0.2, b.y + b.r * 0.45, 0,
      b.x + b.r * 0.2, b.y + b.r * 0.45, b.r * 0.35
    );
    caustic.addColorStop(0, `rgba(${cr},${cg},${cb},0.25)`);
    caustic.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = caustic;
    ctx.fill();

    ctx.restore();
  }

  /* ── Animation loop ── */
  function tick() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw large glass bubbles first (behind small balls)
    largeBubbles.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.y + b.r < -20) {
        Object.assign(b, mkBubble());
        b.x = Math.random() * canvas.width;
        b.y = canvas.height + b.r;
      }
      drawBubble(ctx, b);
    });

    // Draw small balls on top
    smallBalls.forEach(b => {
      b.x     += b.vx;
      b.y     += b.vy;
      b.phase += 0.018;

      if (b.y + b.r < -10) {
        Object.assign(b, mkSmall());
        b.x = Math.random() * canvas.width;
        b.y = canvas.height + b.r + Math.random() * 100;
      }

      const a = Math.max(0, Math.min(0.9, b.alpha + Math.sin(b.phase) * 0.06));
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = a;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(tick);
  }
  tick();
})();

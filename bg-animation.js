/* InvestRight — Global Background: Green Glow + Diagonal Floating Balls */
(function () {
  if (document.getElementById('ir-bg-canvas')) return;

  /* ── Inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    body {
      background: #0a0f1a !important;
      position: relative;
    }
    #ir-bg-glow {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 50% 90%, rgba(143,255,176,0.18) 0%, rgba(34,211,140,0.10) 30%, transparent 65%),
        radial-gradient(circle at 50% 50%, rgba(34,211,140,0.05) 0%, transparent 60%);
    }
    #ir-bg-canvas {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }
    body > *:not(#ir-bg-glow):not(#ir-bg-canvas) {
      position: relative;
      z-index: 2;
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

  /* ── Ball config ── */
  const COLORS = ['#22d38c', '#22d38c', '#8FFFB0', '#1EAEDB', '#34d399'];
  const COUNT  = 28;

  function mkBall() {
    return {
      x:     Math.random() * canvas.width,
      y:     canvas.height + 20 + Math.random() * 180,
      r:     2.5 + Math.random() * 7,
      vx:    (Math.random() - 0.35) * 0.85,   /* slight left/right drift = diagonal */
      vy:    -(0.55 + Math.random() * 1.15),   /* upward */
      alpha: 0.10 + Math.random() * 0.22,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2
    };
  }

  const balls = Array.from({ length: COUNT }, mkBall);

  /* ── Animate ── */
  function tick() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(b => {
      b.x     += b.vx;
      b.y     += b.vy;
      b.phase += 0.018;

      /* respawn from bottom when off-screen */
      if (b.y + b.r < -10) {
        b.x     = Math.random() * canvas.width;
        b.y     = canvas.height + b.r + Math.random() * 100;
        b.vx    = (Math.random() - 0.35) * 0.85;
        b.vy    = -(0.55 + Math.random() * 1.15);
        b.alpha = 0.10 + Math.random() * 0.22;
        b.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }

      const a = Math.max(0, Math.min(0.9, b.alpha + Math.sin(b.phase) * 0.07));
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

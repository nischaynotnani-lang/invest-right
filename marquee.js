// InvestRight Marquee Strip
(function() {
  const text = 'InvestRight\u00A0\u00A0•\u00A0\u00A0AI Stock Analysis\u00A0\u00A0•\u00A0\u00A0';
  const repeat = 8;
  const content = text.repeat(repeat);

  const strip = document.createElement('div');
  strip.id = 'ir-marquee';
  strip.innerHTML = `
    <div class="ir-marquee-inner">
      <span>${content}</span>
      <span aria-hidden="true">${content}</span>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ir-marquee {
      overflow: hidden;
      white-space: nowrap;
      border-top: 1px solid rgba(59,130,246,0.18);
      border-bottom: 1px solid rgba(59,130,246,0.18);
      background: rgba(7,13,26,0.7);
      padding: 10px 0;
      position: relative;
      z-index: 10;
    }
    .ir-marquee-inner {
      display: inline-flex;
      animation: ir-scroll 28s linear infinite;
    }
    .ir-marquee-inner span {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.08em;
      color: rgba(148,163,184,0.7);
      padding-right: 0;
    }
    .ir-marquee-inner span b {
      color: #3b82f6;
      font-weight: 600;
    }
    @keyframes ir-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    #ir-marquee:hover .ir-marquee-inner {
      animation-play-state: paused;
    }
  `;

  document.head.appendChild(style);

  // Insert after nav
  const nav = document.querySelector('nav');
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(strip, nav.nextSibling);
  } else {
    document.body.prepend(strip);
  }
})();

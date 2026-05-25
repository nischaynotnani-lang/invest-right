const NAV_LINKS = [
  { href: 'index.html', label: '🏠 Home', id: 'home' },
  { href: 'dashboard.html', label: '🧠 AI Dashboard', id: 'dashboard' },
  { href: 'market.html', label: '📊 Markets', id: 'market' },
  { href: 'portfolio.html', label: '💼 Portfolio', id: 'portfolio' },
  { href: 'chat.html', label: '💬 AI Chat', id: 'chat' },
  { href: 'premium.html', label: '⭐ Premium', id: 'premium' },
];

function renderNav(activeId) {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html" class="nav-brand">InvestRight ⚡</a>
    <ul class="nav-links">
      ${NAV_LINKS.map(l => `
        <li><a href="${l.href}" class="${l.id === activeId ? 'active' : ''}">${l.label}</a></li>
      `).join('')}
    </ul>
    <a href="chat.html" class="btn btn-primary" style="font-size:12px;padding:7px 14px;">Ask AI →</a>
  `;
}

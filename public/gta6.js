(() => {
  const launch = new Date('2026-11-19T00:00:00-05:00').getTime();
  const countdown = document.getElementById('gtaCountdown');
  const units = { days: document.getElementById('countDays'), hours: document.getElementById('countHours'), minutes: document.getElementById('countMinutes'), seconds: document.getElementById('countSeconds') };
  function updateCountdown() {
    const distance = launch - Date.now();
    if (!countdown) return;
    if (distance <= 0) { countdown.innerHTML = '<div class="updates-empty"><strong>GTA VI RELEASE DAY</strong><span>Check Rockstar Games for the latest official availability.</span></div>'; return; }
    const second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24;
    units.days.textContent = String(Math.floor(distance / day));
    units.hours.textContent = String(Math.floor((distance % day) / hour)).padStart(2, '0');
    units.minutes.textContent = String(Math.floor((distance % hour) / minute)).padStart(2, '0');
    units.seconds.textContent = String(Math.floor((distance % minute) / second)).padStart(2, '0');
  }
  updateCountdown();
  const countdownTimer = window.setInterval(updateCountdown, 1000);
  window.addEventListener('pagehide', () => window.clearInterval(countdownTimer), { once: true });
  const grid = document.getElementById('gtaNews');
  const config = window.MARKBEEN5_CONFIG || {};
  if (!grid || !window.supabase || !config.SUPABASE_URL || !config.SUPABASE_PUBLISHABLE_KEY) return;
  const db = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const safeHttpUrl = value => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const isGtaPost = post => /\b(gta\s*(?:6|vi)|grand theft auto\s*vi)\b/i.test(`${post.category || ''} ${post.title || ''}`);
  async function loadGtaNews() {
    const { data, error } = await db.from('gaming_news').select('id,category,title,summary,source_url,image_url,published_at').eq('enabled', true).order('published_at', { ascending: false });
    if (error) { grid.innerHTML = '<div class="updates-empty">GTA VI updates are temporarily unavailable. Official links above still work.</div>'; return; }
    const posts = (data || []).filter(isGtaPost);
    grid.innerHTML = posts.map(post => {
      const image = safeHttpUrl(post.image_url), source = safeHttpUrl(post.source_url);
      const date = new Date(post.published_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return `<article class="update-card">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : ''}<div class="update-body"><div class="update-meta">${escapeHtml(post.category)} · ${escapeHtml(date)}</div><h3>${escapeHtml(post.title)}</h3>${post.summary ? `<p>${escapeHtml(post.summary)}</p>` : ''}${source ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">OFFICIAL SOURCE ↗</a>` : ''}</div></article>`;
    }).join('') || '<div class="updates-empty">No GTA VI news posts yet. Use the official Rockstar links above for confirmed information.</div>';
  }
  loadGtaNews();
})();

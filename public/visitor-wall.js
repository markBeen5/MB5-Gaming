(() => {
  if (!/(?:^|\/)(?:index\.html)?$/i.test(location.pathname)) return;

  const cfg = window.MARKBEEN5_CONFIG || {};
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY) return;

  const db = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));

  function visitorToken() {
    let value = localStorage.getItem('mb5_visitor_token');
    if (!value) {
      value = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('mb5_visitor_token', value);
    }
    return value;
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function load() {
    const list = $('visitorList');
    if (!list) return;

    const { data, error } = await db
      .from('visitor_messages')
      .select('id,display_name,message,created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(40);

    if (error) {
      list.innerHTML = '<div class="visitor-empty">The visitor wall is warming up. Check back soon.</div>';
      return;
    }

    list.innerHTML = (data || []).map(entry => `
      <article class="visitor-card">
        <div class="visitor-card-top">
          <strong>${esc(entry.display_name)}</strong>
          <time datetime="${esc(entry.created_at)}">${esc(formatDate(entry.created_at))}</time>
        </div>
        ${entry.message ? `<p>${esc(entry.message)}</p>` : '<p class="visitor-stopped">Stopped by the MB5 website.</p>'}
      </article>
    `).join('') || '<div class="visitor-empty">No check-ins yet. Be the first to leave your mark.</div>';
  }

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = $('visitorName').value.trim();
    const message = $('visitorMessage').value.trim();
    const status = $('visitorStatus');
    const button = $('visitorSubmit');

    if ($('visitorWebsite').value) return;
    if (!name) {
      status.textContent = 'Add your name or gamer tag first.';
      $('visitorName').focus();
      return;
    }

    button.disabled = true;
    button.textContent = 'CHECKING IN…';
    status.textContent = '';

    const { error } = await db.from('visitor_messages').insert({
      display_name: name.slice(0, 24),
      message: message.slice(0, 180),
      visitor_token: visitorToken()
    });

    button.disabled = false;
    button.textContent = 'I STOPPED BY';

    if (error) {
      status.textContent = error.code === '23505'
        ? 'Your check-in is already waiting for MB5 approval.'
        : 'Your check-in could not be saved. Please try again.';
      return;
    }

    form.reset();
    status.textContent = 'Thanks for stopping by! Your check-in is waiting for MB5 approval.';
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('visitorForm')?.addEventListener('submit', submit);
    load();
  });
})();


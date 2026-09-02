(() => {
  if (!/admin\.html$/i.test(location.pathname)) return;

  const cfg = window.MARKBEEN5_CONFIG || {};
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY) return;

  const db = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));

  function build() {
    const tabs = $('tabs');
    const dash = $('dash');
    if (!tabs || !dash || $('visitorAdmin')) return;

    const button = document.createElement('button');
    button.dataset.tab = 'visitors';
    button.textContent = 'VISITORS';
    tabs.appendChild(button);

    const panel = document.createElement('div');
    panel.id = 'visitors';
    panel.className = 'panel';
    panel.innerHTML = `
      <div class="box" id="visitorAdmin">
        <h2>VISITOR WALL <span class="count" id="visitorCount">0</span></h2>
        <p class="hint">Approve check-ins before they appear publicly. Delete anything you do not want on the site.</p>
        <div class="form-actions">
          <button class="ghost" id="visitorRefresh">REFRESH CHECK-INS</button>
          <a class="ghost" href="index.html#visitor-wall" target="_blank" rel="noopener">VIEW VISITOR WALL</a>
        </div>
        <div id="visitorAdminList" class="list"><div class="hint">Loading visitor check-ins…</div></div>
      </div>`;
    dash.appendChild(panel);

    button.addEventListener('click', () => {
      document.querySelectorAll('#tabs button').forEach(item => item.classList.toggle('active', item === button));
      document.querySelectorAll('.panel').forEach(item => item.classList.toggle('active', item === panel));
      load();
    });
    $('visitorRefresh').onclick = load;
    load();
  }

  async function load() {
    const list = $('visitorAdminList');
    if (!list) return;

    const { data, error } = await db
      .from('visitor_messages')
      .select('id,display_name,message,approved,created_at')
      .order('approved', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      list.innerHTML = '<div class="hint">Unable to load visitor check-ins. Run the visitor wall SQL setup first.</div>';
      return;
    }

    const entries = data || [];
    $('visitorCount').textContent = entries.length;
    list.innerHTML = entries.map(entry => `
      <div class="item">
        <div>
          <div class="item-title">${esc(entry.display_name)}</div>
          <div class="item-sub">${entry.approved ? 'LIVE' : 'PENDING'} · ${esc(new Date(entry.created_at).toLocaleString())}</div>
          ${entry.message ? `<div class="hint">${esc(entry.message)}</div>` : ''}
        </div>
        <div class="item-actions">
          ${entry.approved ? '' : `<button class="ghost" data-approve="${entry.id}">APPROVE</button>`}
          <button class="danger" data-delete="${entry.id}">DELETE</button>
        </div>
      </div>`).join('') || '<div class="hint">No visitor check-ins yet.</div>';

    list.querySelectorAll('[data-approve]').forEach(action => {
      action.onclick = () => approve(action.dataset.approve);
    });
    list.querySelectorAll('[data-delete]').forEach(action => {
      action.onclick = () => remove(action.dataset.delete);
    });
  }

  async function approve(id) {
    const { error } = await db.from('visitor_messages').update({ approved: true }).eq('id', id);
    if (error) return alert(error.message);
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this visitor check-in?')) return;
    const { error } = await db.from('visitor_messages').delete().eq('id', id);
    if (error) return alert(error.message);
    load();
  }

  document.addEventListener('DOMContentLoaded', build);
  setTimeout(build, 800);
})();

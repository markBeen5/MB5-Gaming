(() => {
  const fallback = window.MB5_DEFENSE?.plays || [];
  const cfg = window.MARKBEEN5_CONFIG || {};
  const db = window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY
    ? supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY)
    : null;
  const grid = document.getElementById('defenseGrid');
  const empty = document.getElementById('defenseEmpty');
  const count = document.getElementById('defenseCount');
  const search = document.getElementById('defenseSearch');
  const filters = document.getElementById('defenseFilters');
  let plays = fallback;
  let active = 'all';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
  const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function generatedArt(play) {
    const type = slug(play.call_type || play.coverage);
    return `<div class="defense-generated-art ${esc(type)}" aria-hidden="true"><span></span><span></span><span></span><i></i><i></i><i></i></div>`;
  }

  function card(play, index) {
    const image = play.image_url
      ? `<img src="${esc(play.image_url)}" alt="${esc(`${play.name} in ${play.formation}`)}" loading="lazy" decoding="async">`
      : generatedArt(play);
    const tags = Array.isArray(play.tags) ? play.tags : [];
    return `<article class="defense-call-card">
      <div class="defense-call-image">${image}<span class="call-number">CALL ${String(index + 1).padStart(2, '0')}</span><span class="call-type ${esc(slug(play.call_type || play.coverage))}">${esc(play.call_type || play.coverage || 'Defense')}</span></div>
      <div class="defense-call-body"><div class="call-formation">${esc(play.formation || 'DEFENSIVE PACKAGE')}</div><h3>${esc(play.name)}</h3><p>${esc(play.detail || 'MB5 defensive coaching notes coming next.')}</p><div class="call-situation"><span>CALL GROUP</span><strong>${esc(play.situation || play.call_type || play.coverage || 'Defense')}</strong></div><div class="play-tag-list">${tags.map(tag => `<span class="play-tag">${esc(String(tag).replace(/-/g, ' ').toUpperCase())}</span>`).join('')}</div></div>
    </article>`;
  }

  function match(play, query) {
    return [play.name, play.formation, play.call_type, play.coverage, play.situation, play.detail, ...(play.tags || [])]
      .join(' ').toLowerCase().includes(query);
  }

  function render() {
    const query = (search?.value || '').trim().toLowerCase();
    const list = plays.filter(play => {
      const values = [slug(play.call_type), slug(play.coverage), slug(play.formation), ...(play.tags || []).map(slug)];
      return (active === 'all' || values.includes(active)) && (!query || match(play, query));
    });
    count.textContent = list.length;
    grid.innerHTML = list.map(card).join('');
    empty.hidden = list.length !== 0;
  }

  function setFilter(value) {
    active = value;
    filters.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('active', button.dataset.filter === value));
    render();
  }

  async function load() {
    if (db) {
      const { data, error } = await db.from('plays')
        .select('id,name,type,coverage,detail,image_url,formation,call_type,tags,situation,sort_order,enabled')
        .eq('type', 'Defense')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      if (!error && data?.length) plays = data;
    }
    render();
  }

  filters?.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) setFilter(button.dataset.filter);
  });
  search?.addEventListener('input', render);
  document.querySelectorAll('[data-jump-filter]').forEach(button => {
    button.addEventListener('click', () => {
      setFilter(button.dataset.jumpFilter);
      document.getElementById('defenseLibrary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  load();
})();


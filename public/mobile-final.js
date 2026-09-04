(() => {
  function addGtaNav() {
    const nav = document.querySelector('.nav-links');
    if (!nav || nav.querySelector('a[href="gta6-hub.html"]')) return;
    const link = document.createElement('a');
    link.href = 'gta6-hub.html';
    link.textContent = 'GTA VI';
    const admin = nav.querySelector('.admin-link');
    nav.insertBefore(link, admin || null);
  }

  function improveQuickNav() {
    const quick = document.querySelector('.mobile-quick');
    if (!quick || quick.querySelector('a[href="news.html"]')) return;
    const link = document.createElement('a');
    link.href = 'news.html';
    link.textContent = 'NEWS';
    const clips = quick.querySelector('a[href="#clips"]');
    quick.insertBefore(link, clips || null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addGtaNav();
      improveQuickNav();
    });
  } else {
    addGtaNav();
    improveQuickNav();
  }
})();

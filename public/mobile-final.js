(() => {
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
    document.addEventListener('DOMContentLoaded', improveQuickNav);
  } else {
    improveQuickNav();
  }
})();

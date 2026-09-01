(() => {
  if (!/admin\.html$/i.test(location.pathname)) return;
  function addGtaCategory() {
    const select = document.getElementById('newsCategory');
    if (!select || [...select.options].some(option => option.value === 'GTA VI')) return;
    const option = document.createElement('option');
    option.value = 'GTA VI';
    option.textContent = 'GTA VI';
    const gameNews = [...select.options].find(item => item.value === 'Game News');
    gameNews?.after(option);
  }
  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(addGtaCategory, 300);
    window.setTimeout(addGtaCategory, 1000);
  });
})();

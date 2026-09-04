window.MARKBEEN5_CONFIG = {
  SUPABASE_URL: 'https://wifkhdvmuiioisetzqfr.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_Ot-bQ77UbU-tjFs4WLg1mQ_PudPu9DP'
};

(() => {
  const admin = /admin\.html$/i.test(location.pathname);
  const news = /news\.html$/i.test(location.pathname);
  const home = /(?:^|\/)(?:index\.html)?$/i.test(location.pathname);
  const maddenResults = /madden-results\.html$/i.test(location.pathname);
  const css = href => {
    const element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = href;
    document.head.appendChild(element);
  };
  const js = src => {
    const element = document.createElement('script');
    element.src = src;
    element.defer = true;
    document.head.appendChild(element);
  };

  if (admin) {
    css('admin-enhance.css?v=20260831-1');
    css('admin-mobile.css?v=20260901-2');
    js('admin-enhance.js?v=20260831-1');
    js('admin-community.js?v=20260831-1');
    js('admin-news.js?v=20260901-1');
    js('admin-gta6.js?v=20260901-1');
    js('admin-fixes.js?v=20260831-final1');
    js('game-result-scan.js?v=20260901-1');
    js('admin-game-results.js?v=20260901-3');
  } else {
    css('qa.css?v=20260831-1');
    css('mobile-final.css?v=20260901-3');
    js('mobile-final.js?v=20260901-1');
    if (home) {
      css('community.css?v=20260901-2');
      js('community.js?v=20260901-2');
    }
    if (news) {
      css('news-responsive.css?v=20260901-1');
      css('news-mobile-fix.css?v=20260901-3');
    }
    if (maddenResults) {
      css('madden-opponent-intel.css?v=20260904-1');
      css('madden-results-tools.css?v=20260904-1');
      css('madden-mode-insights.css?v=20260904-1');
      css('madden-season-records.css?v=20260904-1');
      css('madden-results-mobile-polish.css?v=20260904-1');
      css('madden-season-story.css?v=20260904-1');
      js('madden-opponent-intel.js?v=20260904-1');
      js('madden-results-tools.js?v=20260904-1');
      js('madden-mode-insights.js?v=20260904-1');
      js('madden-season-records.js?v=20260904-1');
      js('madden-season-story.js?v=20260904-1');
    }
  }
  js('analytics-loader.js?v=20260831-1');
})();

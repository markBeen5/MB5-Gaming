window.MARKBEEN5_CONFIG = {
  SUPABASE_URL: 'https://wifkhdvmuiioisetzqfr.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_Ot-bQ77UbU-tjFs4WLg1mQ_PudPu9DP'
};

(() => {
  const admin = /admin\.html$/i.test(location.pathname);
  const news = /news\.html$/i.test(location.pathname);
  const home = /(?:^|\/)(?:index\.html)?$/i.test(location.pathname);
  const maddenResults = /madden-results\.html$/i.test(location.pathname);
  const css = href => { const element = document.createElement('link'); element.rel = 'stylesheet'; element.href = href; document.head.appendChild(element); };
  const js = src => { const element = document.createElement('script'); element.src = src; element.defer = true; document.head.appendChild(element); };

  if (maddenResults && window.supabase?.createClient && !window.MB5_MADDEN_RESULTS_CACHE_READY) {
    const originalCreateClient = window.supabase.createClient.bind(window.supabase);
    const selectedSeason = new URLSearchParams(location.search).get('season');
    const resultsPromises = new Map();
    window.supabase.createClient = (...args) => {
      const client = originalCreateClient(...args);
      const originalRpc = client.rpc.bind(client);
      client.rpc = (name, params, options) => {
        const sameFeed = name === 'get_madden27_lions_results' && Number(params?.limit_count ?? 100) === 100;
        if (!sameFeed) return originalRpc(name, params, options);
        const feedParams = {...(params || {})};
        if (!feedParams.season_filter && selectedSeason) feedParams.season_filter = selectedSeason;
        const key = feedParams.season_filter || '__active__';
        if (!resultsPromises.has(key)) resultsPromises.set(key, Promise.resolve(originalRpc(name, feedParams, options)));
        return resultsPromises.get(key);
      };
      return client;
    };
    window.MB5_MADDEN_RESULTS_CACHE_READY = true;
  }

  if (admin) {
    css('admin-enhance.css?v=20260831-1'); css('admin-mobile.css?v=20260901-2');
    js('admin-enhance.js?v=20260831-1'); js('admin-community.js?v=20260831-1'); js('admin-news.js?v=20260901-1'); js('admin-gta6.js?v=20260901-1'); js('admin-fixes.js?v=20260831-final1'); js('game-result-scan.js?v=20260901-1'); js('admin-game-results.js?v=20260901-3'); js('admin-madden-season-tools.js?v=20260904-2'); js('admin-madden-season-manager.js?v=20260904-1');
  } else {
    css('qa.css?v=20260831-1'); css('mobile-final.css?v=20260901-3'); js('mobile-final.js?v=20260901-1');
    if (home) { css('community.css?v=20260901-2'); js('community.js?v=20260901-2'); }
    if (news) { css('news-responsive.css?v=20260901-1'); css('news-mobile-fix.css?v=20260901-3'); }
    if (maddenResults) {
      css('madden-dashboard.css?v=20260904-2'); css('madden-opponent-intel.css?v=20260904-1'); css('madden-results-tools.css?v=20260904-2'); css('madden-mode-insights.css?v=20260904-1'); css('madden-season-records.css?v=20260904-1'); css('madden-results-mobile-polish.css?v=20260904-1'); css('madden-season-story.css?v=20260904-1'); css('madden-season-timeline.css?v=20260904-1'); css('madden-playoff-rivalry.css?v=20260904-1'); css('madden-championship-archive.css?v=20260904-1'); css('madden-season-awards.css?v=20260904-1'); css('madden-results-navigation.css?v=20260904-1'); css('madden-share-export.css?v=20260904-1');
      js('madden-dashboard.js?v=20260904-2'); js('madden-opponent-intel.js?v=20260904-1'); js('madden-results-tools.js?v=20260904-2'); js('madden-mode-insights.js?v=20260904-1'); js('madden-season-records.js?v=20260904-1'); js('madden-season-story.js?v=20260904-1'); js('madden-season-timeline.js?v=20260904-1'); js('madden-playoff-rivalry.js?v=20260904-1'); js('madden-championship-archive.js?v=20260904-1'); js('madden-season-awards.js?v=20260904-1'); js('madden-results-navigation.js?v=20260904-2'); js('madden-share-export.js?v=20260904-1');
    }
  }
  js('analytics-loader.js?v=20260831-1');
})();

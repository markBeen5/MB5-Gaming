(()=>{
  const cfg=window.MARKBEEN5_CONFIG||{};
  if(!window.supabase||!cfg.SUPABASE_URL||!cfg.SUPABASE_PUBLISHABLE_KEY)return;
  const s=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const sid=(()=>{try{let v=sessionStorage.getItem('mb5_sid');if(!v){v=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));sessionStorage.setItem('mb5_sid',v)}return v}catch{return null}})();
  const device=()=>{const w=innerWidth;return w<768?'mobile':w<1100?'tablet':'desktop'};
  const ref=()=>{try{return document.referrer?new URL(document.referrer).hostname:null}catch{return null}};
  const send=(event_name,section=null)=>s.from('analytics_events').insert({event_name,path:location.pathname,section,referrer_host:ref(),device_type:device(),session_id:sid}).then(()=>{}).catch(()=>{});
  send('page_view');
  const seen=new Set();
  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.target.id&&!seen.has(e.target.id)){seen.add(e.target.id);send('section_view',e.target.id)}}),{threshold:.45});
    document.querySelectorAll('main section[id],body>section[id]').forEach(x=>io.observe(x));
  }
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';let ev='outbound_click';if(/twitch\.tv/i.test(href))ev='live_click';else if(/instagram|tiktok|youtube|kick\.com/i.test(href))ev='social_click';else if(a.closest('#clips,.clip-grid,.highlight-grid'))ev='clip_click';send(ev,a.closest('section')?.id||a.textContent?.trim().slice(0,80)||null)},{passive:true});
})();
(()=>{
  const wait=()=>{if(!window.supabase||!window.MARKBEEN5_CONFIG)return setTimeout(wait,300);init()};
  async function init(){
    const cfg=window.MARKBEEN5_CONFIG,s=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
    const host=document.querySelector('#overview')||document.querySelector('[data-tab="overview"]')||document.querySelector('main');if(!host)return;
    const box=document.createElement('section');box.className='mb5-analytics-panel';box.innerHTML='<h2>MB5 ANALYTICS</h2><p class="muted">Private owner dashboard · updates on refresh</p><div class="mb5-analytics-grid"><div><b id="aViews">—</b><span>Page Views · 7 Days</span></div><div><b id="aVisitors">—</b><span>Sessions · 7 Days</span></div><div><b id="aMobile">—</b><span>Mobile Traffic</span></div><div><b id="aClicks">—</b><span>Social / Live Clicks</span></div></div><div class="mb5-analytics-detail"><div><h3>Top Sections</h3><ol id="aSections"><li>No data yet</li></ol></div><div><h3>Traffic Sources</h3><ol id="aSources"><li>No data yet</li></ol></div></div>';
    host.prepend(box);
    const {data:{session}}=await s.auth.getSession();if(!session)return;
    const since=new Date(Date.now()-7*864e5).toISOString();const {data,error}=await s.from('analytics_events').select('event_name,section,referrer_host,device_type,session_id,created_at').gte('created_at',since).limit(10000);if(error||!data)return;
    const views=data.filter(x=>x.event_name==='page_view'), sessions=new Set(views.map(x=>x.session_id).filter(Boolean));
    document.querySelector('#aViews').textContent=views.length;document.querySelector('#aVisitors').textContent=sessions.size;
    document.querySelector('#aMobile').textContent=views.length?Math.round(100*views.filter(x=>x.device_type==='mobile').length/views.length)+'%':'0%';
    document.querySelector('#aClicks').textContent=data.filter(x=>['social_click','live_click'].includes(x.event_name)).length;
    fill('#aSections',count(data.filter(x=>x.event_name==='section_view').map(x=>x.section)));
    fill('#aSources',count(views.map(x=>x.referrer_host||'Direct')));
  }
  function count(a){const m={};a.filter(Boolean).forEach(x=>m[x]=(m[x]||0)+1);return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5)}
  function fill(sel,items){const el=document.querySelector(sel);if(!el||!items.length)return;el.innerHTML=items.map(([k,v])=>`<li><span>${esc(k)}</span><b>${v}</b></li>`).join('')}
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  wait();
})();
(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').trim().toLowerCase();
  ready(async()=>{
    if(!/madden-results\.html$/i.test(location.pathname)||!window.supabase||!window.MARKBEEN5_CONFIG||document.getElementById('resultsHqNav'))return;
    const cfg=window.MARKBEEN5_CONFIG;
    const db=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
    const main=document.querySelector('main')||document.body;
    const hero=document.querySelector('.hero')||main.firstElementChild;
    const nav=document.createElement('nav');
    nav.id='resultsHqNav';
    nav.className='results-hq-nav';
    nav.setAttribute('aria-label','Results HQ sections');
    nav.innerHTML='<div class="results-hq-nav-inner"></div>';
    hero?.insertAdjacentElement('afterend',nav);
    const links=[['mb5Dashboard','COMMAND'],['seasonAwards','AWARDS'],['championshipHQ','PLAYOFFS'],['rivalryCenter','RIVALRIES'],['seasonRecords','RECORDS'],['seasonTimeline','TIMELINE'],['games','RECENT'],['championshipArchive','ARCHIVE'],['seasonCompare','COMPARE'],['shareCenter','SHARE']];
    const hydrateNav=()=>{
      const box=nav.firstElementChild;
      box.innerHTML=links.filter(([id])=>document.getElementById(id)).map(([id,label])=>`<a href="#${id}">${label}</a>`).join('');
      links.forEach(([id])=>document.getElementById(id)?.classList.add('mb5-ordered-section'));
    };
    const reorder=()=>{
      const recentTitle=[...document.querySelectorAll('.title')].find(x=>/MADDEN 27 RECENT GAMES/i.test(x.textContent||''));
      if(!recentTitle)return;
      const parent=recentTitle.parentNode;
      const order=['mb5Dashboard','seasonAwards','championshipHQ','rivalryCenter','seasonRecords','seasonTimeline','championshipArchive','seasonCompare','shareCenter'];
      let anchor=recentTitle;
      for(let i=order.length-1;i>=0;i--){
        const el=document.getElementById(order[i]);
        if(el&&el.parentNode===parent){parent.insertBefore(el,anchor);anchor=el;}
      }
      hydrateNav();
    };
    let timer;
    const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(reorder,80)});
    observer.observe(main,{childList:true,subtree:true});
    const seasonRes=await db.rpc('get_madden_seasons');
    const seasons=seasonRes.data||[];
    if(seasons.length){
      const recentTitle=[...document.querySelectorAll('.title')].find(x=>/MADDEN 27 RECENT GAMES/i.test(x.textContent||''));
      if(recentTitle&&!document.getElementById('seasonCompare')){
        const section=document.createElement('section');
        section.id='seasonCompare';
        section.className='season-compare';
        section.innerHTML='<h2 class="title">📊 SEASON COMPARE</h2><p class="subline">Compare two Madden campaigns side by side.</p><article class="season-compare-panel"><div class="season-compare-controls"><div><label for="seasonCompareA">SEASON A</label><select id="seasonCompareA"></select></div><div><label for="seasonCompareB">SEASON B</label><select id="seasonCompareB"></select></div><button id="seasonCompareRun" type="button">COMPARE</button></div><div id="seasonCompareGrid" class="season-compare-grid"></div></article>';
        recentTitle.parentNode.insertBefore(section,recentTitle);
        const a=document.getElementById('seasonCompareA');
        const b=document.getElementById('seasonCompareB');
        const opts=seasons.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
        a.innerHTML=opts;b.innerHTML=opts;if(seasons.length>1)b.selectedIndex=1;
        const summarize=rows=>{
          const all=rows||[],w=all.filter(g=>g.result==='W').length,l=all.filter(g=>g.result==='L').length;
          const sc=all.filter(g=>g.points_for!=null&&g.points_against!=null);
          const avgPF=sc.length?sc.reduce((n,g)=>n+Number(g.points_for),0)/sc.length:0;
          const avgPA=sc.length?sc.reduce((n,g)=>n+Number(g.points_against),0)/sc.length:0;
          let streak=0,best=0;
          all.slice().reverse().forEach(g=>{streak=g.result==='W'?streak+1:0;best=Math.max(best,streak)});
          const post=all.filter(g=>/wild|divisional|conference|super|playoff|postseason/.test(norm(g.season_stage||g.mode)));
          const sb=post.find(g=>/super/.test(norm(g.season_stage||g.mode)));
          return{w,l,pct:all.length?w/all.length*100:0,avgPF,avgPA,best,post:post.length,finish:sb?.result==='W'?'Champion':sb?.result==='L'?'Runner-Up':post.some(g=>g.result==='L')?'Playoff Exit':post.length?'Postseason':'Regular Season'};
        };
        const row=(label,av,bv,an,bn)=>`<div class="season-compare-row"><span>${label}</span><strong class="${an>bn?'season-compare-winner':''}">${av}</strong><strong class="${bn>an?'season-compare-winner':''}">${bv}</strong></div>`;
        const run=async()=>{
          const [ra,rb]=await Promise.all([
            db.rpc('get_madden27_lions_results',{limit_count:100,season_filter:a.value}),
            db.rpc('get_madden27_lions_results',{limit_count:100,season_filter:b.value})
          ]);
          const x=summarize(ra.data),y=summarize(rb.data);
          const na=seasons.find(s=>s.id===a.value)?.name||'Season A',nb=seasons.find(s=>s.id===b.value)?.name||'Season B';
          document.getElementById('seasonCompareGrid').innerHTML=`<div class="season-compare-head"><strong>${esc(na)}</strong><strong>${esc(nb)}</strong></div>${row('Record',`${x.w}–${x.l}`,`${y.w}–${y.l}`,x.pct,y.pct)}${row('Win rate',`${x.pct.toFixed(1)}%`,`${y.pct.toFixed(1)}%`,x.pct,y.pct)}${row('Avg points',x.avgPF.toFixed(1),y.avgPF.toFixed(1),x.avgPF,y.avgPF)}${row('Avg allowed',x.avgPA.toFixed(1),y.avgPA.toFixed(1),-x.avgPA,-y.avgPA)}${row('Best streak',`W${x.best}`,`W${y.best}`,x.best,y.best)}${row('Playoff games',x.post,y.post,x.post,y.post)}${row('Finish',x.finish,y.finish,0,0)}`;
        };
        document.getElementById('seasonCompareRun').onclick=run;
        run();
      }
    }
    reorder();
    setTimeout(reorder,500);
    setTimeout(()=>{observer.disconnect();reorder()},2500);
  });
})();
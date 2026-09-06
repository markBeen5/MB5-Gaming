(()=>{
  const hq=document.querySelector('.halloween-hq');
  if(!hq)return;

  const countdown=hq.querySelector('.halloween-countdown');
  if(countdown)countdown.remove();

  const release=hq.querySelector('#halloweenReleaseLabel');
  if(release){
    release.id='halloweenAvailable';
    release.className='halloween-available';
    release.innerHTML='<strong>NOW AVAILABLE</strong><span>DELUXE EARLY ACCESS IS LIVE • ENTER HADDONFIELD NOW</span>';
  }

  const copy=hq.querySelector('.halloween-copy');
  if(copy)copy.textContent='Halloween: The Game is now available. Watch MarkBeen5 enter Haddonfield, then catch the latest Halloween streams and clips below.';

  const kicker=hq.querySelector('.halloween-kicker');
  if(kicker)kicker.textContent='MB5 • HALLOWEEN: THE GAME • NOW PLAYING';

  const meta=hq.querySelector('.halloween-meta');
  if(meta){
    const labels=[...meta.querySelectorAll('span')];
    labels.forEach(el=>{
      if(el.textContent.trim()==='DELUXE PRE-ORDER')el.textContent='NOW AVAILABLE';
      if(el.textContent.trim()==='EARLY ACCESS')el.textContent='LIVE NOW';
    });
  }

  const inner=hq.querySelector('.halloween-inner');
  if(!inner)return;

  const media=document.createElement('section');
  media.className='halloween-media';
  media.setAttribute('aria-label','Latest Halloween streams and clips from MarkBeen5');
  media.innerHTML=`
    <div class="halloween-media-head">
      <div>
        <div class="halloween-media-kicker">MB5 HADDONFIELD FEED</div>
        <h3>LATEST HALLOWEEN STREAMS & CLIPS</h3>
      </div>
      <a href="https://www.twitch.tv/markbeen5/videos?filter=archives&sort=time" target="_blank" rel="noopener">VIEW ALL STREAMS ↗</a>
    </div>
    <div class="halloween-stream-card">
      <div><span class="halloween-live-dot"></span><b>HALLOWEEN STREAM ARCHIVE</b><p>Catch MarkBeen5's latest Halloween: The Game broadcasts and Haddonfield sessions on Twitch.</p></div>
      <a href="https://www.twitch.tv/markbeen5/videos?filter=archives&sort=time" target="_blank" rel="noopener">WATCH PAST STREAMS ↗</a>
    </div>
    <div id="halloweenClipGrid" class="halloween-clip-grid"><article class="halloween-empty">Loading Halloween highlights…</article></div>`;

  const news=inner.querySelector('.halloween-news');
  if(news)news.insertAdjacentElement('beforebegin',media);else inner.appendChild(media);

  const style=document.createElement('style');
  style.textContent=`
    .halloween-available{max-width:700px;margin:24px 0 18px;padding:16px 18px;border:1px solid #ff6a00;border-radius:16px;background:linear-gradient(90deg,#5a1d00e8,#ff5a0022);box-shadow:0 0 30px #ff5a0026}
    .halloween-available strong{display:block;color:#fff;font-size:clamp(30px,5vw,54px);font-style:italic;line-height:.95;letter-spacing:.035em;text-shadow:0 0 20px #ff5a0066}
    .halloween-available span{display:block;margin-top:9px;color:#ffb077;font-size:11px;font-weight:900;letter-spacing:.12em}
    .halloween-media{margin-top:26px;max-width:760px;border-top:1px solid #5b2a12;padding-top:22px}
    .halloween-media-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:12px}
    .halloween-media-kicker{color:#ff6a00;font-size:10px;font-weight:900;letter-spacing:.18em}
    .halloween-media h3{margin:4px 0 0;color:#fff;font-size:clamp(20px,3vw,30px);font-style:italic}
    .halloween-media-head>a,.halloween-stream-card>a{color:#ff7a1a;text-decoration:none;font-size:10px;font-weight:900;letter-spacing:.06em;white-space:nowrap}
    .halloween-stream-card{display:flex;align-items:center;justify-content:space-between;gap:16px;background:#06080bee;border:1px solid #4b2a18;border-radius:14px;padding:15px;margin-bottom:12px}
    .halloween-stream-card b{color:#fff;font-size:13px}.halloween-stream-card p{margin:5px 0 0;color:#bdb4ab;font-size:12px;line-height:1.4}
    .halloween-live-dot{display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:50%;background:#ff3548;box-shadow:0 0 12px #ff3548}
    .halloween-clip-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .halloween-clip-card{display:block;overflow:hidden;border:1px solid #3b2417;border-radius:14px;background:#06080bee;color:#fff;text-decoration:none}
    .halloween-clip-media{position:relative;width:100%;aspect-ratio:16/9;background:radial-gradient(circle at 50% 40%,#6d2500 0,#241108 38%,#090909 78%);overflow:hidden}
    .halloween-clip-media img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
    .halloween-clip-preview{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;text-decoration:none;background:linear-gradient(135deg,#ff5a0014,#0000 45%),repeating-linear-gradient(135deg,#ffffff05 0 1px,transparent 1px 10px)}
    .halloween-clip-play{display:grid;place-items:center;width:62px;height:62px;border:2px solid #ff7a1a;border-radius:50%;background:#090909cc;box-shadow:0 0 28px #ff5a0055;font-size:24px;padding-left:4px}
    .halloween-clip-preview strong{font-size:12px;letter-spacing:.12em}.halloween-clip-preview span{color:#ff9c58;font-size:10px;font-weight:900;letter-spacing:.14em}
    .halloween-clip-body{padding:12px}.halloween-clip-body small{color:#ff7a1a;font-weight:900;letter-spacing:.08em}.halloween-clip-body b{display:block;margin-top:5px;font-size:13px;line-height:1.3}.halloween-clip-body p{margin:6px 0 0;color:#bdb4ab;font-size:11px;line-height:1.35}
    .halloween-watch{display:inline-block;margin-top:9px;color:#ff7a1a;text-decoration:none;font-size:10px;font-weight:900;letter-spacing:.04em}
    .halloween-empty{grid-column:1/-1;padding:14px;border:1px dashed #5b2a12;border-radius:14px;color:#bdb4ab;background:#06080b99;font-size:12px}

    /* Main Clips & Highlights cards: replace the old empty MB5 placeholder with a real Twitch play preview. */
    #highlightGrid .highlight-thumb.no-thumb{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:250px!important;background:radial-gradient(circle at 50% 40%,#5b2200 0,#241108 42%,#08090c 82%)!important;overflow:hidden!important}
    #highlightGrid .highlight-thumb.no-thumb::before,#highlightGrid .highlight-thumb.no-thumb::after{content:none!important;display:none!important}
    #highlightGrid .mb5-twitch-preview{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;background:linear-gradient(135deg,#ff5a001c,transparent 48%),repeating-linear-gradient(135deg,#ffffff05 0 1px,transparent 1px 12px);pointer-events:none}
    #highlightGrid .mb5-twitch-preview .play{display:grid;place-items:center;width:76px;height:76px;border:2px solid #ff7a1a;border-radius:50%;background:#090909e8;box-shadow:0 0 36px #ff5a0066;color:#fff;font-size:30px;padding-left:5px}
    #highlightGrid .mb5-twitch-preview strong{color:#fff;font-size:15px;letter-spacing:.13em}
    #highlightGrid .mb5-twitch-preview span{color:#ff9c58;font-size:11px;font-weight:900;letter-spacing:.14em}
    @media(max-width:700px){.halloween-media-head,.halloween-stream-card{align-items:flex-start;flex-direction:column}.halloween-clip-grid{grid-template-columns:1fr}.halloween-available strong{font-size:clamp(28px,10vw,42px)}#highlightGrid .highlight-thumb.no-thumb{min-height:210px!important}}
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[ch]));
  const clipMedia=x=>{
    if(x.thumbnail_url)return `<div class="halloween-clip-media"><img src="${esc(x.thumbnail_url)}" alt="${esc(x.title||'Halloween clip')}" loading="lazy" decoding="async"></div>`;
    return `<div class="halloween-clip-media"><a class="halloween-clip-preview" href="${esc(x.url||'https://www.twitch.tv/markbeen5/clips')}" target="_blank" rel="noopener" aria-label="Play ${esc(x.title||'Halloween highlight')} on Twitch"><div class="halloween-clip-play">▶</div><strong>TWITCH HIGHLIGHT</strong><span>PLAY ON TWITCH ↗</span></a></div>`;
  };

  function paintHalloweenClips(items){
    const grid=document.getElementById('halloweenClipGrid');
    if(!grid)return;
    const clips=(items||[]).filter(x=>x&&x.enabled!==false).filter(x=>{
      const hay=[x.game,x.title,x.description,x.category].filter(Boolean).join(' ').toLowerCase();
      return hay.includes('halloween');
    }).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).slice(0,4);
    grid.innerHTML=clips.length?clips.map(x=>`<article class="halloween-clip-card">${clipMedia(x)}<div class="halloween-clip-body"><small>${esc((x.game||'HALLOWEEN: THE GAME').toUpperCase())} • ${esc((x.platform||'CLIP').toUpperCase())}</small><b>${esc(x.title||'Halloween: The Game highlight')}</b><p>${esc(x.description||'Watch this MB5 Halloween highlight.')}</p><a class="halloween-watch" href="${esc(x.url||'https://www.twitch.tv/markbeen5/clips')}" target="_blank" rel="noopener">WATCH HIGHLIGHT ↗</a></div></article>`).join(''):`<article class="halloween-empty">No Halloween clips are posted in the MB5 highlight feed yet. <a href="https://www.twitch.tv/markbeen5/clips" target="_blank" rel="noopener" style="color:#ff7a1a">Open MarkBeen5's Twitch clips ↗</a></article>`;
  }

  function fixMainHighlightPreviews(){
    document.querySelectorAll('#highlightGrid .highlight-thumb.no-thumb').forEach(thumb=>{
      if(thumb.querySelector('.mb5-twitch-preview'))return;
      thumb.innerHTML='<div class="mb5-twitch-preview"><div class="play">▶</div><strong>TWITCH HIGHLIGHT</strong><span>CLICK TO PLAY ON TWITCH ↗</span></div>';
    });
  }

  const mainGrid=document.getElementById('highlightGrid');
  if(mainGrid){
    const observer=new MutationObserver(fixMainHighlightPreviews);
    observer.observe(mainGrid,{childList:true,subtree:true});
    setTimeout(fixMainHighlightPreviews,0);
    setTimeout(fixMainHighlightPreviews,800);
    setTimeout(fixMainHighlightPreviews,1800);
  }

  async function loadHalloweenClips(){
    const cfg=window.MARKBEEN5_CONFIG||{};
    if(window.supabase?.createClient&&cfg.SUPABASE_URL&&cfg.SUPABASE_PUBLISHABLE_KEY){
      try{
        const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
        const {data,error}=await db.from('clips').select('id,game,category,platform,title,url,thumbnail_url,description,featured,enabled,sort_order,created_at').eq('enabled',true).order('sort_order',{ascending:true});
        if(error)throw error;
        window.mb5Clips=data||[];
        paintHalloweenClips(window.mb5Clips);
        return;
      }catch(err){console.warn('Halloween clips database load failed:',err);}
    }
    if(Array.isArray(window.mb5Clips)){
      paintHalloweenClips(window.mb5Clips);
      return;
    }
    const grid=document.getElementById('halloweenClipGrid');
    if(grid)grid.innerHTML='<article class="halloween-empty">Halloween highlights are temporarily unavailable. <a href="https://www.twitch.tv/markbeen5/clips" target="_blank" rel="noopener" style="color:#ff7a1a">Open Twitch clips ↗</a></article>';
  }

  loadHalloweenClips();
})();
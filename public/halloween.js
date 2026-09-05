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
    <div id="halloweenClipGrid" class="halloween-clip-grid"><article class="halloween-empty">Loading Halloween clips…</article></div>`;

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
    .halloween-clip-card img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#111}
    .halloween-clip-body{padding:12px}.halloween-clip-body small{color:#ff7a1a;font-weight:900;letter-spacing:.08em}.halloween-clip-body b{display:block;margin-top:5px;font-size:13px;line-height:1.3}.halloween-clip-body p{margin:6px 0 0;color:#bdb4ab;font-size:11px;line-height:1.35}
    .halloween-empty{grid-column:1/-1;padding:14px;border:1px dashed #5b2a12;border-radius:14px;color:#bdb4ab;background:#06080b99;font-size:12px}
    @media(max-width:700px){.halloween-media-head,.halloween-stream-card{align-items:flex-start;flex-direction:column}.halloween-clip-grid{grid-template-columns:1fr}.halloween-available strong{font-size:clamp(28px,10vw,42px)}}`;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  function renderHalloweenClips(){
    const grid=document.getElementById('halloweenClipGrid');
    if(!grid)return false;
    if(!Array.isArray(window.mb5Clips))return false;
    const clips=window.mb5Clips.filter(x=>x&&x.enabled!==false).filter(x=>{
      const hay=[x.game,x.title,x.description,x.category].filter(Boolean).join(' ').toLowerCase();
      return hay.includes('halloween');
    }).slice(0,4);
    grid.innerHTML=clips.length?clips.map(x=>`<a class="halloween-clip-card" href="${esc(x.url||'https://www.twitch.tv/markbeen5/clips')}" target="_blank" rel="noopener">${x.thumbnail_url?`<img src="${esc(x.thumbnail_url)}" alt="${esc(x.title||'Halloween clip')}" loading="lazy" decoding="async">`:''}<div class="halloween-clip-body"><small>${esc((x.platform||'CLIP').toUpperCase())}</small><b>${esc(x.title||'Halloween: The Game highlight')}</b><p>${esc(x.description||'Watch this MB5 Halloween highlight.')}</p></div></a>`).join(''):`<article class="halloween-empty">No Halloween clips are posted in the MB5 highlight feed yet. <a href="https://www.twitch.tv/markbeen5/clips" target="_blank" rel="noopener" style="color:#ff7a1a">Open MarkBeen5's Twitch clips ↗</a></article>`;
    return true;
  }

  if(!renderHalloweenClips()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(renderHalloweenClips()||tries>=20)clearInterval(timer)},750);
  }
})();
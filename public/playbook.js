(()=>{
  const data=window.MB5_PLAYBOOK||{plays:[]};
  const grid=document.querySelector('#playbookGrid');
  const empty=document.querySelector('#playbookEmpty');
  const search=document.querySelector('#playSearch');
  const count=document.querySelector('#playCount');
  const filters=document.querySelector('#playFilters');
  let active='all';

  const notes={
    'mesh-rail':'Layer the mesh underneath with the rail as the explosive answer. Great when defenders chase across the field.',
    'mesh-rail-shuffle':'Use the motion to stress leverage, then work the mesh and rail combination.',
    'shuffle-verts-smash':'Motion plus vertical pressure creates a high-low read with a shot opportunity.',
    'texas-shutter-wheel':'Attack man leverage with the inside break, then alert the wheel if the defender overplays underneath.',
    'flood':'Stretch one side of the zone with short, intermediate and deep levels.',
    'drive':'Create a horizontal stretch with a shallow route underneath an intermediate dig.',
    'pa-shot-portland':'Play-action shot concept designed to hold underneath defenders and attack deep space.',
    'mesh':'Crossing routes create natural traffic against man and easy sit-down windows against zone.',
    'pa-crossers':'Use play action to pull defenders forward, then hit crossing routes behind them.',
    'pa-dagger':'Play-action vertical clear-out paired with an intermediate dig window.',
    'strong-flood':'Flood the strong side and read the outside zone defender from low to high.',
    'four-verticals':'Push every deep zone and attack seams, leverage and one-on-one matchups.',
    'mtn-crossers':'Motion helps identify coverage before attacking the field with layered crossers.',
    'split-close-mesh':'Compressed alignment creates traffic and quick separation on mesh routes.',
    'beat-man-slants':'Quick slants are a fast man-coverage answer when leverage is favorable.',
    'beat-zone-mesh':'Let mesh routes settle into soft spots instead of running through open zone windows.',
    'quick-pass-zigs':'Zig routes create sharp separation and give the QB a fast pressure answer.',
    'deep-shot-go-vertical':'Use go routes to punish pressed corners, isolated safeties or aggressive underneath defense.',
    'sideline-outs':'Attack the boundary with timing outs when underneath leverage is inside.',
    'move-chains-comebacks':'Comebacks are reliable chain-movers when corners protect against the deep ball.',
    'smart-routes':'Adjust route depth to the sticks and coverage shell for situational downs.',
    'double-moves':'Sell the underneath break first, then attack over the top when defenders jump routes.',
    'red-zone-slants-compressed':'Compressed slants create fast inside windows when the field gets tight near the goal line.',
    'pressure-answer':'Use quick mesh and immediate outlets to get the ball out before pressure arrives.'
  };

  function esc(v=''){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
  function titleTag(t){return t.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}

  function diagram(i,tags=[]){
    const variants=[
      [[18,82,86,22,''],[22,62,70,-28,'blue'],[58,83,65,-48,'red']],
      [[15,80,78,-36,''],[23,62,72,28,'blue'],[63,80,58,-62,'red']],
      [[14,82,80,0,''],[20,60,65,-54,'blue'],[55,82,72,42,'red']],
      [[15,82,58,-25,''],[34,82,62,-58,'blue'],[61,82,66,-82,'red']]
    ];
    const v=variants[i%variants.length];
    const routes=v.map(([l,t,w,r,c])=>`<span class="route ${c}" style="left:${l}%;top:${t}%;width:${w}px;transform:rotate(${r}deg)"></span>`).join('');
    const dots=[17,30,43,56,69].map(x=>`<span class="player-dot" style="left:${x}%"></span>`).join('');
    return `<div class="play-diagram" aria-hidden="true">${dots}${routes}</div>`;
  }

  function matches(p,q){
    const hay=[p.name,p.category,...(p.tags||[]),notes[p.id]||''].join(' ').toLowerCase();
    return hay.includes(q);
  }

  function render(){
    const q=(search?.value||'').trim().toLowerCase();
    const list=(data.plays||[]).filter(p=>{
      const tagMatch=active==='all'||(p.tags||[]).includes(active)||String(p.category||'').toLowerCase().replace(/\s+/g,'-')===active;
      return tagMatch&&(!q||matches(p,q));
    });
    count.textContent=list.length;
    grid.innerHTML=list.map((p,i)=>`<article class="play-card">
      <div class="play-card-head"><div class="play-index">PLAY ${String(i+1).padStart(2,'0')}</div><h2>${esc(p.name)}</h2><div class="play-type">${esc(p.category)}</div></div>
      ${diagram(i,p.tags)}
      <div class="play-card-body"><p class="play-note">${esc(notes[p.id]||'MB5 offensive concept.')}</p><div class="play-tag-list">${(p.tags||[]).map(t=>`<span class="play-tag">${esc(titleTag(t))}</span>`).join('')}</div></div>
    </article>`).join('');
    empty.hidden=list.length!==0;
  }

  filters?.addEventListener('click',e=>{
    const b=e.target.closest('[data-filter]');
    if(!b)return;
    active=b.dataset.filter;
    filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));
    render();
  });
  search?.addEventListener('input',render);
  render();
})();

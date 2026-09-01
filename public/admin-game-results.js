(()=>{
  const cfg=window.MARKBEEN5_CONFIG||{};
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_PUBLISHABLE_KEY||!window.supabase)return;
  const db=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
  const $=id=>document.getElementById(id);
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  function notify(msg,bad=false){if(typeof window.toast==='function')return window.toast(msg,bad);const el=document.createElement('div');el.textContent=msg;el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999;background:#0c1b28;color:#fff;border:1px solid '+(bad?'#7a2834':'#245072')+';padding:12px 16px;border-radius:10px';document.body.appendChild(el);setTimeout(()=>el.remove(),2500)}

  function installUI(){
    const tabs=$('tabs'),statsPanel=$('stats');
    if(!tabs||!statsPanel||$('results'))return;
    const tab=document.createElement('button');tab.dataset.tab='results';tab.textContent='RESULTS';tabs.insertBefore(tab,tabs.querySelector('[data-tab="plays"]'));
    const panel=document.createElement('div');panel.id='results';panel.className='panel';
    panel.innerHTML=`<div class="box"><h2>GAME RESULT TRACKER <span class="count" id="resultsCount">0</span></h2><p class="hint">Your existing record is kept as the historical baseline. Every result added here automatically updates the public wins and losses.</p><div class="grid3"><div class="field"><label>Result</label><select id="grResult"><option value="W">WIN</option><option value="L">LOSS</option></select></div><div class="field"><label>Opponent</label><input id="grOpponent" placeholder="Opponent / gamertag"></div><div class="field"><label>Date</label><input id="grDate" type="datetime-local"></div></div><div class="grid3"><div class="field"><label>Your score</label><input id="grPF" type="number" min="0"></div><div class="field"><label>Opponent score</label><input id="grPA" type="number" min="0"></div><div class="field"><label>Mode</label><input id="grMode" value="Online H2H"></div></div><div class="grid"><div class="field"><label>Game</label><input id="grGame" value="Madden 27"></div><div class="field"><label>Team</label><input id="grTeam" value="Detroit Lions"></div></div><div class="field"><label>Notes</label><textarea id="grNotes" placeholder="Key plays, adjustments, comeback, etc."></textarea></div><div class="form-actions"><button class="btn" id="grAdd">ADD RESULT</button><button class="ghost" id="grRefresh">REFRESH</button></div><div class="status-grid" style="margin-top:14px"><div class="status"><b>HISTORICAL</b><strong id="grBase">—</strong></div><div class="status"><b>TRACKED</b><strong id="grTracked">—</strong></div><div class="status"><b>TOTAL RECORD</b><strong id="grTotal">—</strong></div><div class="status"><b>WIN RATE</b><strong id="grPct">—</strong></div></div><div id="grList" class="list"></div></div>`;
    statsPanel.after(panel);

    if(!$('grDate').value){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('grDate').value=d.toISOString().slice(0,16)}
    $('grAdd').addEventListener('click',addResult);
    $('grRefresh').addEventListener('click',loadResults);

    const saveStatsBtn=statsPanel.querySelector('button.btn');
    if(saveStatsBtn){
      const wins=$('wins'),losses=$('losses');
      if(wins)wins.readOnly=true;if(losses)losses.readOnly=true;
      saveStatsBtn.textContent='SAVE STREAK';
      saveStatsBtn.onclick=saveStreakOnly;
      const h=document.createElement('p');h.className='hint';h.textContent='Wins and losses are calculated automatically from your historical baseline plus the Game Result Tracker.';saveStatsBtn.before(h);
    }

    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-tab="results"]');if(b)setTimeout(loadResults,0)});
    loadResults();
  }

  async function saveStreakOnly(){
    const {data,error}=await db.from('stats').select('id').limit(1).maybeSingle();
    if(error||!data)return notify(error?.message||'Stats record not found',true);
    const r=await db.from('stats').update({streak:($('streak')?.value||'').trim()||'W0'}).eq('id',data.id);
    if(r.error)return notify(r.error.message,true);notify('Streak saved');
  }

  async function addResult(){
    const result=$('grResult').value;
    const pf=$('grPF').value===''?null:Number($('grPF').value),pa=$('grPA').value===''?null:Number($('grPA').value);
    const played=$('grDate').value?new Date($('grDate').value).toISOString():new Date().toISOString();
    const row={result,opponent:$('grOpponent').value.trim()||null,played_at:played,points_for:pf,points_against:pa,mode:$('grMode').value.trim()||'Online H2H',game:$('grGame').value.trim()||'Madden 27',team:$('grTeam').value.trim()||'Detroit Lions',notes:$('grNotes').value.trim()||null};
    const {error}=await db.from('game_results').insert(row);
    if(error)return notify(error.message,true);
    $('grOpponent').value='';$('grPF').value='';$('grPA').value='';$('grNotes').value='';notify(result==='W'?'Win added — stats updated':'Loss added — stats updated');await loadResults();await refreshStatsFields();
  }

  async function removeResult(id){
    if(!confirm('Delete this game result? Your totals will update automatically.'))return;
    const {error}=await db.from('game_results').delete().eq('id',id);if(error)return notify(error.message,true);notify('Result deleted — stats updated');await loadResults();await refreshStatsFields();
  }

  async function refreshStatsFields(){
    const {data}=await db.from('stats').select('wins,losses,streak').limit(1).maybeSingle();
    if(data){if($('wins'))$('wins').value=data.wins??0;if($('losses'))$('losses').value=data.losses??0;if($('streak'))$('streak').value=data.streak||''}
  }

  async function loadResults(){
    const [baseRes,gamesRes,statsRes]=await Promise.all([
      db.from('game_result_baseline').select('wins,losses').eq('id',true).maybeSingle(),
      db.from('game_results').select('*').order('played_at',{ascending:false}).limit(100),
      db.from('stats').select('wins,losses').limit(1).maybeSingle()
    ]);
    if(baseRes.error||gamesRes.error||statsRes.error)return notify((baseRes.error||gamesRes.error||statsRes.error).message,true);
    const base=baseRes.data||{wins:0,losses:0},games=gamesRes.data||[],stats=statsRes.data||{wins:0,losses:0};
    const tw=games.filter(x=>x.result==='W').length,tl=games.filter(x=>x.result==='L').length,total=Number(stats.wins||0)+Number(stats.losses||0),pct=total?((Number(stats.wins||0)/total)*100).toFixed(1):'0.0';
    if($('resultsCount'))$('resultsCount').textContent=games.length;
    if($('grBase'))$('grBase').textContent=`${base.wins}-${base.losses}`;
    if($('grTracked'))$('grTracked').textContent=`${tw}-${tl}`;
    if($('grTotal'))$('grTotal').textContent=`${stats.wins}-${stats.losses}`;
    if($('grPct'))$('grPct').textContent=`${pct}%`;
    if($('grList'))$('grList').innerHTML=games.length?games.map(g=>`<div class="item"><div><div class="item-title">${g.result==='W'?'✅ WIN':'❌ LOSS'}${g.opponent?` vs ${esc(g.opponent)}`:''}${g.points_for!=null&&g.points_against!=null?` • ${g.points_for}-${g.points_against}`:''}</div><div class="item-sub">${esc(g.game||'Madden 27')} • ${esc(g.team||'Detroit Lions')} • ${esc(g.mode||'Online H2H')} • ${new Date(g.played_at).toLocaleString()}${g.notes?`<br>${esc(g.notes)}`:''}</div></div><div class="item-actions"><button class="danger" data-delete-result="${g.id}">DELETE</button></div></div>`).join(''):'<div class="hint">No tracked games yet. Your historical record remains counted.</div>';
    document.querySelectorAll('[data-delete-result]').forEach(b=>b.onclick=()=>removeResult(b.dataset.deleteResult));
    await refreshStatsFields();
  }

  const start=()=>{installUI();const obs=new MutationObserver(()=>installUI());obs.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

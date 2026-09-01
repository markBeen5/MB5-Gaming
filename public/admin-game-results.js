(()=>{
  const cfg=window.MARKBEEN5_CONFIG||{};
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_PUBLISHABLE_KEY||!window.supabase)return;
  const db=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY),$=id=>document.getElementById(id);
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  let editingId=null,saving=false,scanPreviewUrl=null;

  function notify(msg,bad=false){if(typeof window.toast==='function')return window.toast(msg,bad);const el=document.createElement('div');el.textContent=msg;el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999;background:#0c1b28;color:#fff;border:1px solid '+(bad?'#7a2834':'#245072')+';padding:12px 16px;border-radius:10px';document.body.appendChild(el);setTimeout(()=>el.remove(),2500)}
  function localDateValue(value=new Date()){const date=new Date(value);date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,16)}
  function resetForm(){editingId=null;$('grOpponent').value='';$('grPF').value='';$('grPA').value='';$('grNotes').value='';$('grDate').value=localDateValue();$('grAdd').textContent='ADD RESULT';$('grCancel').classList.add('hidden');clearScan()}

  function installUI(){
    const tabs=$('tabs'),statsPanel=$('stats');if(!tabs||!statsPanel||$('results'))return;
    const tab=document.createElement('button');tab.dataset.tab='results';tab.textContent='RESULTS';tabs.insertBefore(tab,tabs.querySelector('[data-tab="plays"]'));
    const panel=document.createElement('div');panel.id='results';panel.className='panel';panel.innerHTML=`<div class="box"><h2>GAME RESULT TRACKER <span class="count" id="resultsCount">0</span></h2><p class="hint">Add each completed game once. Wins, losses, win rate and streak update automatically.</p><div class="result-scan"><div><h3>SCAN RESULT SCREENSHOT <span>BETA</span></h3><p>Upload the final score screen. MB5 will prefill the opponent and score for you to review.</p></div><div class="result-scan-actions"><label class="btn result-scan-button" for="grScanFile">CHOOSE SCREENSHOT</label><input class="hidden" id="grScanFile" type="file" accept="image/*"><button class="ghost hidden" id="grScanClear" type="button">CLEAR SCAN</button></div><div class="result-scan-output hidden" id="grScanOutput"><img id="grScanPreview" alt="Selected result screenshot"><div><strong id="grScanStatus" aria-live="polite">Ready to scan</strong><label class="hidden" id="grScanChoicesWrap" for="grScanChoices">Possible opponent tags<select id="grScanChoices"></select></label><small>Nothing is saved until you tap ADD RESULT.</small></div></div></div><div class="grid3"><div class="field"><label for="grResult">Result</label><select id="grResult"><option value="W">WIN</option><option value="L">LOSS</option></select></div><div class="field"><label for="grOpponent">Opponent *</label><input id="grOpponent" required autocomplete="off" placeholder="Opponent / gamertag"></div><div class="field"><label for="grDate">Date</label><input id="grDate" type="datetime-local"></div></div><div class="grid3"><div class="field"><label for="grPF">Your score</label><input id="grPF" type="number" min="0" inputmode="numeric"></div><div class="field"><label for="grPA">Opponent score</label><input id="grPA" type="number" min="0" inputmode="numeric"></div><div class="field"><label for="grMode">Mode</label><input id="grMode" value="Online H2H"></div></div><div class="grid"><div class="field"><label for="grGame">Game</label><input id="grGame" value="Madden 27"></div><div class="field"><label for="grTeam">Team</label><input id="grTeam" value="Detroit Lions"></div></div><div class="field"><label for="grNotes">Notes</label><textarea id="grNotes" placeholder="Key plays, adjustments, comeback, etc."></textarea></div><div class="form-actions"><button class="btn" id="grAdd">ADD RESULT</button><button class="ghost hidden" id="grCancel">CANCEL EDIT</button><button class="ghost" id="grRefresh">REFRESH</button></div><div class="status-grid" style="margin-top:14px"><div class="status"><b>HISTORICAL</b><strong id="grBase">—</strong></div><div class="status"><b>TRACKED</b><strong id="grTracked">—</strong></div><div class="status"><b>TOTAL RECORD</b><strong id="grTotal">—</strong></div><div class="status"><b>CURRENT STREAK</b><strong id="grStreak">—</strong></div><div class="status"><b>WIN RATE</b><strong id="grPct">—</strong></div></div><div id="grList" class="list"></div></div>`;
    statsPanel.after(panel);$('grDate').value=localDateValue();$('grAdd').addEventListener('click',saveResult);$('grCancel').addEventListener('click',resetForm);$('grRefresh').addEventListener('click',loadResults);$('grScanFile').addEventListener('change',scanScreenshot);$('grScanClear').addEventListener('click',clearScan);$('grScanChoices').addEventListener('change',event=>{$('grOpponent').value=event.target.value});
    ['wins','losses','streak'].forEach(id=>{if($(id))$(id).readOnly=true});const saveStatsBtn=statsPanel.querySelector('button.btn');if(saveStatsBtn){saveStatsBtn.classList.add('hidden');const hint=document.createElement('p');hint.className='hint';hint.textContent='Record and streak are controlled by the Game Result Tracker.';saveStatsBtn.before(hint)}
    tabs.addEventListener('click',event=>{if(event.target.closest('[data-tab="results"]'))setTimeout(loadResults,0)});loadResults();
  }

  function clearScan(){
    if(scanPreviewUrl){URL.revokeObjectURL(scanPreviewUrl);scanPreviewUrl=null}
    $('grScanFile').value='';$('grScanPreview').removeAttribute('src');$('grScanOutput').classList.add('hidden');$('grScanClear').classList.add('hidden');$('grScanChoicesWrap').classList.add('hidden');$('grScanChoices').innerHTML='';
  }

  async function scanScreenshot(event){
    const file=event.target.files&&event.target.files[0];if(!file)return;if(!window.MB5ResultScanner)return notify('Screenshot reader did not load. Refresh and try again.',true);
    clearScan();if(!editingId){$('grOpponent').value='';$('grPF').value='';$('grPA').value=''}scanPreviewUrl=URL.createObjectURL(file);$('grScanPreview').src=scanPreviewUrl;$('grScanOutput').classList.remove('hidden');$('grScanClear').classList.remove('hidden');$('grScanStatus').textContent='Preparing screenshot…';$('grScanFile').disabled=true;
    try{
      const scan=await window.MB5ResultScanner.scanFile(file,progress=>{$('grScanStatus').textContent=`Reading screenshot… ${progress}%`});
      if(scan.opponent)$('grOpponent').value=scan.opponent;
      if(scan.pointsFor!==null&&scan.pointsAgainst!==null){$('grPF').value=scan.pointsFor;$('grPA').value=scan.pointsAgainst;if(scan.result)$('grResult').value=scan.result}
      if(scan.overtime&&!$('grNotes').value.trim())$('grNotes').value='Overtime';
      if(scan.opponentCandidates.length>1){$('grScanChoices').innerHTML=scan.opponentCandidates.map(tag=>`<option value="${esc(tag)}">${esc(tag)}</option>`).join('');$('grScanChoicesWrap').classList.remove('hidden')}
      const found=[];if(scan.opponent)found.push(`opponent ${scan.opponent}`);if(scan.pointsFor!==null)found.push(`score ${scan.pointsFor}-${scan.pointsAgainst}`);
      $('grScanStatus').textContent=scan.opponent?`Found ${found.join(' • ')}. Check it, then add the result.`:found.length?`Found ${found.join(' • ')}, but the opponent tag is too blurry. Try the original screenshot.`:'I could not read this image. Try the original landscape screenshot.';
      notify(scan.opponent?'Screenshot scanned — review before saving':'Opponent tag needs a clearer screenshot',!scan.opponent);
    }catch(error){$('grScanStatus').textContent=error.message||'Screenshot scan failed';notify(error.message||'Screenshot scan failed',true)}finally{$('grScanFile').disabled=false}
  }

  function formRow(){
    const result=$('grResult').value,opponent=$('grOpponent').value.trim(),pf=$('grPF').value===''?null:Number($('grPF').value),pa=$('grPA').value===''?null:Number($('grPA').value);
    if(!opponent)throw new Error('Opponent is required');if((pf===null)!==(pa===null))throw new Error('Enter both scores or leave both blank');if(pf!==null&&result==='W'&&pf<=pa)throw new Error('A win needs your score to be higher');if(pf!==null&&result==='L'&&pf>=pa)throw new Error('A loss needs your score to be lower');
    return{result,opponent,played_at:$('grDate').value?new Date($('grDate').value).toISOString():new Date().toISOString(),points_for:pf,points_against:pa,mode:$('grMode').value.trim()||'Online H2H',game:$('grGame').value.trim()||'Madden 27',team:$('grTeam').value.trim()||'Detroit Lions',notes:$('grNotes').value.trim()||null};
  }

  async function saveResult(){
    if(saving)return;let row;try{row=formRow()}catch(error){return notify(error.message,true)}saving=true;$('grAdd').disabled=true;$('grAdd').textContent=editingId?'SAVING…':'ADDING…';
    const response=editingId?await db.from('game_results').update(row).eq('id',editingId):await db.from('game_results').insert(row);saving=false;$('grAdd').disabled=false;
    if(response.error){$('grAdd').textContent=editingId?'SAVE RESULT':'ADD RESULT';return notify(response.error.code==='23505'?'That result is already saved':response.error.message,true)}
    notify(editingId?'Result updated — stats synchronized':row.result==='W'?'Win added — stats synchronized':'Loss added — stats synchronized');resetForm();await loadResults();
  }

  function editResult(game){editingId=game.id;$('grResult').value=game.result;$('grOpponent').value=game.opponent||'';$('grDate').value=localDateValue(game.played_at);$('grPF').value=game.points_for??'';$('grPA').value=game.points_against??'';$('grMode').value=game.mode||'Online H2H';$('grGame').value=game.game||'Madden 27';$('grTeam').value=game.team||'Detroit Lions';$('grNotes').value=game.notes||'';$('grAdd').textContent='SAVE RESULT';$('grCancel').classList.remove('hidden');$('grOpponent').focus();$('results').scrollIntoView({behavior:'smooth',block:'start'})}
  async function removeResult(id){if(!confirm('Delete this game result? Your record and streak will update automatically.'))return;const{error}=await db.from('game_results').delete().eq('id',id);if(error)return notify(error.message,true);if(editingId===id)resetForm();notify('Result deleted — stats synchronized');await loadResults()}
  async function refreshStatsFields(){const{data}=await db.from('stats').select('wins,losses,streak').limit(1).maybeSingle();if(data){if($('wins'))$('wins').value=data.wins??0;if($('losses'))$('losses').value=data.losses??0;if($('streak'))$('streak').value=data.streak||'W0'}return data||{wins:0,losses:0,streak:'W0'}}

  async function loadResults(){
    const[baseRes,gamesRes,statsRes]=await Promise.all([db.from('game_result_baseline').select('wins,losses,streak').eq('id',true).maybeSingle(),db.from('game_results').select('*').order('played_at',{ascending:false}).order('created_at',{ascending:false}).limit(100),db.from('stats').select('wins,losses,streak').limit(1).maybeSingle()]);if(baseRes.error||gamesRes.error||statsRes.error)return notify((baseRes.error||gamesRes.error||statsRes.error).message,true);
    const base=baseRes.data||{wins:0,losses:0,streak:'W0'},games=gamesRes.data||[],stats=statsRes.data||{wins:0,losses:0,streak:'W0'},trackedWins=games.filter(game=>game.result==='W').length,trackedLosses=games.filter(game=>game.result==='L').length,total=Number(stats.wins||0)+Number(stats.losses||0),pct=total?((Number(stats.wins||0)/total)*100).toFixed(1):'0.0';
    $('resultsCount').textContent=games.length;$('grBase').textContent=`${base.wins}-${base.losses}`;$('grTracked').textContent=`${trackedWins}-${trackedLosses}`;$('grTotal').textContent=`${stats.wins}-${stats.losses}`;$('grStreak').textContent=stats.streak||'W0';$('grPct').textContent=`${pct}%`;
    $('grList').innerHTML=games.length?games.map(game=>`<div class="item"><div><div class="item-title">${game.result==='W'?'✅ WIN':'❌ LOSS'} vs ${esc(game.opponent)}${game.points_for!=null&&game.points_against!=null?` • ${game.points_for}-${game.points_against}`:''}</div><div class="item-sub">${esc(game.game||'Madden 27')} • ${esc(game.team||'Detroit Lions')} • ${esc(game.mode||'Online H2H')} • ${new Date(game.played_at).toLocaleString()}${game.notes?`<br>${esc(game.notes)}`:''}</div></div><div class="item-actions"><button class="ghost" data-edit-result="${game.id}">EDIT</button><button class="danger" data-delete-result="${game.id}">DELETE</button></div></div>`).join(''):'<div class="hint">No tracked games yet. Your historical record remains counted.</div>';
    document.querySelectorAll('[data-edit-result]').forEach(button=>button.onclick=()=>editResult(games.find(game=>game.id===button.dataset.editResult)));document.querySelectorAll('[data-delete-result]').forEach(button=>button.onclick=()=>removeResult(button.dataset.deleteResult));await refreshStatsFields();
  }

  const start=()=>{installUI();const observer=new MutationObserver(()=>installUI());observer.observe(document.body,{childList:true,subtree:true})};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

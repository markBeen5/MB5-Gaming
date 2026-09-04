(()=>{
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    if(!/madden-results\.html$/i.test(location.pathname))return;
    const install=()=>{
      const card=document.getElementById('shareCard');
      const panel=card?.closest('.share-panel');
      if(!card||!panel||document.getElementById('downloadSharePng'))return false;
      const actions=document.createElement('div');
      actions.className='share-export-actions';
      actions.innerHTML='<button id="downloadSharePng" class="primary" type="button">DOWNLOAD PNG</button><button id="shareSharePng" type="button">SHARE IMAGE</button>';
      const note=document.createElement('p');
      note.className='share-export-note';
      note.textContent='Exports a 1080×1080 MB5-branded image from the currently selected Share Center card.';
      const status=document.getElementById('shareStatus');
      (status||panel.lastElementChild)?.insertAdjacentElement('beforebegin',actions);
      actions.insertAdjacentElement('afterend',note);

      const getText=(selector)=>card.querySelector(selector)?.textContent?.trim()||'';
      const wrap=(ctx,text,maxWidth)=>{
        const words=String(text).split(/\s+/);const lines=[];let line='';
        for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}
        if(line)lines.push(line);return lines;
      };
      const rounded=(ctx,x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke()};
      const makeCanvas=()=>{
        const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const ctx=canvas.getContext('2d');
        const win=card.querySelector('.share-main')?.classList.contains('win');
        const loss=card.querySelector('.share-main')?.classList.contains('loss');
        const grad=ctx.createLinearGradient(0,0,1080,1080);grad.addColorStop(0,'#06111d');grad.addColorStop(1,'#123653');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1080);
        ctx.fillStyle='rgba(80,185,255,.10)';ctx.beginPath();ctx.arc(930,140,260,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#0a1926';ctx.strokeStyle='#2b6f9b';ctx.lineWidth=3;rounded(ctx,70,70,940,940,42);
        ctx.fillStyle='#ffffff';ctx.font='900 92px Arial, sans-serif';ctx.fillText('MB',115,190);ctx.fillStyle='#46b8ff';ctx.fillText('5',275,190);
        ctx.fillStyle='#7fcfff';ctx.font='900 28px Arial, sans-serif';ctx.fillText(getText('.share-kicker')||'MADDEN 27 • DETROIT LIONS',115,280);
        ctx.fillStyle=win?'#64e99c':loss?'#ff7180':'#ffffff';ctx.font='900 118px Arial, sans-serif';
        const main=getText('.share-main')||'MB5 RESULTS HQ';wrap(ctx,main,820).slice(0,2).forEach((line,i)=>ctx.fillText(line,115,440+i*125));
        ctx.fillStyle='#d7e9f6';ctx.font='700 38px Arial, sans-serif';wrap(ctx,getText('.share-sub'),820).slice(0,3).forEach((line,i)=>ctx.fillText(line,115,700+i*54));
        ctx.strokeStyle='#2a526c';ctx.beginPath();ctx.moveTo(115,865);ctx.lineTo(965,865);ctx.stroke();
        ctx.fillStyle='#91a9ba';ctx.font='700 26px Arial, sans-serif';wrap(ctx,getText('.share-meta'),820).slice(0,2).forEach((line,i)=>ctx.fillText(line,115,920+i*38));
        ctx.fillStyle='#5ebdf8';ctx.font='900 22px Arial, sans-serif';ctx.fillText('MARKBEEN5.COM  •  MADDEN 27 RESULTS HQ',115,982);
        return canvas;
      };
      const blobFromCanvas=canvas=>new Promise(resolve=>canvas.toBlob(resolve,'image/png',1));
      document.getElementById('downloadSharePng').onclick=async()=>{
        const blob=await blobFromCanvas(makeCanvas());if(!blob)return;
        const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mb5-madden-share-card.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
        if(status)status.textContent='PNG created and downloaded.';
      };
      document.getElementById('shareSharePng').onclick=async()=>{
        const blob=await blobFromCanvas(makeCanvas());if(!blob)return;
        const file=new File([blob],'mb5-madden-share-card.png',{type:'image/png'});
        if(navigator.canShare?.({files:[file]})&&navigator.share){
          try{await navigator.share({files:[file],title:'MB5 Madden 27 Results HQ',text:'MB5 Madden 27 Results HQ • markbeen5.com'});if(status)status.textContent='Image share sheet opened.'}catch(e){if(e?.name!=='AbortError'&&status)status.textContent='Image sharing is not available right now.'}
        }else{
          const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mb5-madden-share-card.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);if(status)status.textContent='Direct image sharing is unavailable here, so the PNG was downloaded instead.';
        }
      };
      return true;
    };
    if(install())return;
    const observer=new MutationObserver(()=>{if(install())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),10000);
  });
})();
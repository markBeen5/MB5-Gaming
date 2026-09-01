((root)=>{
  const OWN_TAGS=new Set(['markbeen5','mb5']);
  const STOP_WORDS=new Set([
    'all','away','back','comp','created','date','defense','det','detroit','downs','drive','ea','easports','final','first','game','home','lions','madden','maye','nfl','offense','online','opponent','overtime','pass','patriots','plays','player','points','quarter','rush','score','select','stats','team','time','total','touchdown','yards'
  ]);

  function cleanToken(value=''){
    return value.replace(/^[^a-z0-9]+|[^a-z0-9_.-]+$/gi,'').replace(/[.]{2,}/g,'.');
  }

  function tagScore(tag){
    const lower=tag.toLowerCase(),hasLetter=/[a-z]/i.test(tag),hasDigit=/\d/.test(tag),mixedCase=/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(tag);
    if(!hasLetter||tag.length<3||tag.length>25||OWN_TAGS.has(lower)||STOP_WORDS.has(lower))return -100;
    if(/^\d/.test(tag)||/^https?$/i.test(tag)||/\.(com|net|org)$/i.test(tag))return -100;
    let score=tag.length;
    if(hasDigit)score+=20;
    if(mixedCase)score+=7;
    if(/[_-]/.test(tag))score+=4;
    if(tag===tag.toUpperCase()&&!hasDigit)score-=18;
    return score;
  }

  function opponentCandidates(text=''){
    const tokens=String(text).match(/[A-Za-z][A-Za-z0-9_.-]{2,24}/g)||[],seen=new Set();
    return tokens.map(cleanToken).filter(tag=>{
      const key=tag.toLowerCase();
      if(seen.has(key)||tagScore(tag)<20)return false;
      seen.add(key);return true;
    }).sort((a,b)=>tagScore(b)-tagScore(a)).slice(0,6);
  }

  function scorePair(text=''){
    const value=String(text).replace(/[|]/g,'1');
    const explicit=[...value.matchAll(/\b(\d{1,3})\s*(?:<|>|«|‹|-|–|—)\s*(\d{1,3})\b/g)]
      .map(match=>[Number(match[1]),Number(match[2])])
      .filter(pair=>pair.every(score=>score>=0&&score<=99));
    if(explicit.length)return explicit[0];
    const final=value.match(/\b(?:FINAL|SCORE)\D{0,18}(\d{1,2})\D{1,12}(\d{1,2})\b/i);
    if(final)return[Number(final[1]),Number(final[2])];
    return null;
  }

  function parseText(text=''){
    const candidates=opponentCandidates(text),scores=scorePair(text),overtime=/\b(?:OT|OVERTIME)\b/i.test(text);
    return{
      opponent:candidates[0]||'',
      opponentCandidates:candidates,
      pointsFor:scores?scores[0]:null,
      pointsAgainst:scores?scores[1]:null,
      result:scores?(scores[0]>scores[1]?'W':scores[0]<scores[1]?'L':''): '',
      overtime,
      rawText:String(text)
    };
  }

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const current=document.querySelector(`script[src="${src}"]`);
      if(current){if(root.Tesseract)return resolve();current.addEventListener('load',resolve,{once:true});current.addEventListener('error',reject,{once:true});return}
      const script=document.createElement('script');script.src=src;script.async=true;script.onload=resolve;script.onerror=()=>reject(new Error('Could not load the screenshot reader'));document.head.appendChild(script);
    });
  }

  async function imageCanvas(file){
    const url=URL.createObjectURL(file);
    try{
      const image=await new Promise((resolve,reject)=>{const item=new Image();item.onload=()=>resolve(item);item.onerror=()=>reject(new Error('That image could not be opened'));item.src=url});
      const maxSide=2200,scale=Math.min(2,maxSide/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const context=canvas.getContext('2d',{willReadFrequently:true});context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,canvas.width,canvas.height);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
      for(let index=0;index<data.length;index+=4){const gray=.299*data[index]+.587*data[index+1]+.114*data[index+2],boost=Math.max(0,Math.min(255,(gray-128)*1.35+128));data[index]=data[index+1]=data[index+2]=boost}
      context.putImageData(pixels,0,0);return canvas;
    }finally{URL.revokeObjectURL(url)}
  }

  async function scanFile(file,onProgress=()=>{}){
    if(!file||!file.type.startsWith('image/'))throw new Error('Choose a screenshot or photo');
    const source='https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
    if(!root.Tesseract)await loadScript(source);
    const canvas=await imageCanvas(file),worker=await root.Tesseract.createWorker('eng',1,{logger:event=>{if(event.status==='recognizing text')onProgress(Math.round((event.progress||0)*100))}});
    try{
      await worker.setParameters({tessedit_pageseg_mode:'11',preserve_interword_spaces:'1'});
      const response=await worker.recognize(canvas);return parseText(response.data.text||'');
    }finally{await worker.terminate()}
  }

  const api={parseText,opponentCandidates,scorePair,scanFile};
  root.MB5ResultScanner=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

(() => {
  'use strict';

  // GitHub Pages uyumlu: model kullanıcının tarayıcısında çalışır, API anahtarı gerekmez.
  const MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct';
  const copy = {
    tr:{title:'NextDNS AI Asistan',sub:'Tarayıcıda çalışan yapay zekâ',placeholder:'Bir şey sor...',send:'Gönder',welcome:'Merhaba! NextDNS, DNS gizliliği, panel özellikleri ve bağlantı sorunları hakkında yardımcı olabilirim.',busy:'Yapay zekâ hazırlanıyor… İlk açılışta model indirilebilir.',error:'Model başlatılamadı. WebGPU desteğini ve internet bağlantını kontrol edip tekrar dene.',clear:'Sohbeti temizle',disclaimer:'Yanıtlar yapay zekâ tarafından oluşturulur; hata içerebilir.',loading:'AI modeli yükleniyor…'},
    en:{title:'NextDNS AI Assistant',sub:'AI running in your browser',placeholder:'Ask something...',send:'Send',welcome:'Hi! I can help with NextDNS, DNS privacy, dashboard features and connection issues.',busy:'Preparing AI… The model may download on first use.',error:'Could not start the model. Check WebGPU support and your internet connection, then try again.',clear:'Clear chat',disclaimer:'AI-generated answers may contain mistakes.',loading:'Loading AI model…'},
    es:{title:'Asistente IA de NextDNS',sub:'IA ejecutada en tu navegador',placeholder:'Escribe tu pregunta...',send:'Enviar',welcome:'¡Hola! Puedo ayudarte con NextDNS, privacidad DNS, funciones del panel y problemas de conexión.',busy:'Preparando IA… El modelo puede descargarse la primera vez.',error:'No se pudo iniciar el modelo. Comprueba WebGPU y tu conexión.',clear:'Borrar chat',disclaimer:'Las respuestas de IA pueden contener errores.',loading:'Cargando modelo de IA…'},
    zh:{title:'NextDNS AI 助手',sub:'在浏览器中运行的 AI',placeholder:'输入问题…',send:'发送',welcome:'你好！我可以帮助你了解 NextDNS、DNS 隐私、控制面板功能和连接问题。',busy:'正在准备 AI… 首次使用时可能需要下载模型。',error:'模型无法启动。请检查 WebGPU 支持和网络连接。',clear:'清除聊天',disclaimer:'AI 回答可能包含错误。',loading:'正在加载 AI 模型…'},
    de:{title:'NextDNS KI-Assistent',sub:'KI läuft im Browser',placeholder:'Frage eingeben…',send:'Senden',welcome:'Hallo! Ich helfe bei NextDNS, DNS-Datenschutz, Dashboard-Funktionen und Verbindungsproblemen.',busy:'KI wird vorbereitet… Beim ersten Start wird möglicherweise das Modell geladen.',error:'Das Modell konnte nicht gestartet werden. Prüfe WebGPU und deine Internetverbindung.',clear:'Chat löschen',disclaimer:'KI-Antworten können Fehler enthalten.',loading:'KI-Modell wird geladen…'}
  };
  const getLang=()=>copy[window.currentLang || localStorage.getItem('nextdns_lang') || 'tr'] || copy.tr;
  let history=[];
  let generatorPromise=null;

  async function loadModel(onProgress){
    if(!generatorPromise){
      generatorPromise=(async()=>{
        const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2');
        lib.env.allowLocalModels=false;
        lib.env.useBrowserCache=true;
        const preferred=navigator.gpu?'webgpu':'wasm';
        try{
          return await lib.pipeline('text-generation',MODEL,{device:preferred,dtype:'q4',progress_callback:onProgress});
        }catch(firstError){
          if(preferred==='wasm') throw firstError;
          onProgress({status:'fallback'});
          return await lib.pipeline('text-generation',MODEL,{device:'wasm',dtype:'q4',progress_callback:onProgress});
        }
      })().catch(err=>{generatorPromise=null;throw err;});
    }
    return generatorPromise;
  }

  function init(){
    if(document.getElementById('nd-ai-launcher'))return;
    const launcher=document.createElement('button');
    launcher.id='nd-ai-launcher';launcher.type='button';launcher.setAttribute('aria-label','Open AI assistant');
    launcher.textContent='✦ AI';
    Object.assign(launcher.style,{position:'fixed',right:'22px',bottom:'22px',zIndex:9998,border:'1px solid #3b82f6',background:'#1d4ed8',color:'#fff',borderRadius:'999px',padding:'12px 18px',fontWeight:'700',boxShadow:'0 8px 30px #0008',cursor:'pointer'});
    const panel=document.createElement('section');panel.id='nd-ai-panel';panel.hidden=true;
    Object.assign(panel.style,{position:'fixed',right:'20px',bottom:'82px',zIndex:9999,width:'min(390px,calc(100vw - 28px))',height:'min(560px,calc(100vh - 115px))',background:'#09090b',border:'1px solid #27272a',borderRadius:'18px',boxShadow:'0 18px 60px #000b',color:'#f4f4f5',display:'flex',flexDirection:'column',overflow:'hidden'});
    panel.innerHTML='<header style="padding:15px 16px;border-bottom:1px solid #27272a;display:flex;align-items:center;justify-content:space-between"><div><strong id="nd-ai-title"></strong><div id="nd-ai-sub" style="font-size:11px;color:#a1a1aa;margin-top:3px"></div></div><button id="nd-ai-close" aria-label="Close" style="background:transparent;color:#a1a1aa;font-size:22px;cursor:pointer">×</button></header><div id="nd-ai-messages" role="log" aria-live="polite" style="padding:14px;flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px"></div><form id="nd-ai-form" style="padding:12px;border-top:1px solid #27272a;display:flex;gap:8px"><input id="nd-ai-input" maxlength="1200" autocomplete="off" style="min-width:0;flex:1;background:#18181b;border:1px solid #3f3f46;border-radius:10px;padding:10px;color:#fff;font-size:13px"><button id="nd-ai-send" type="submit" style="background:#2563eb;color:white;border-radius:10px;padding:0 13px;font-size:12px;font-weight:700"></button></form><div style="padding:0 13px 10px;display:flex;justify-content:space-between;gap:8px;align-items:center"><small id="nd-ai-disclaimer" style="color:#71717a"></small><button id="nd-ai-clear" type="button" style="color:#a1a1aa;font-size:11px;white-space:nowrap"></button></div>';
    document.body.append(launcher,panel);
    const messages=panel.querySelector('#nd-ai-messages');
    const send=panel.querySelector('#nd-ai-send');
    const input=panel.querySelector('#nd-ai-input');
    function bubble(value,who){
      const div=document.createElement('div');div.textContent=value;
      Object.assign(div.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere',alignSelf:who==='user'?'flex-end':'flex-start',maxWidth:'90%',background:who==='user'?'#1d4ed8':'#27272a',padding:'10px 12px',borderRadius:'12px',fontSize:'13px',lineHeight:'1.5'});
      messages.appendChild(div);messages.scrollTop=messages.scrollHeight;return div;
    }
    function paint(){
      const t=getLang();
      panel.querySelector('#nd-ai-title').textContent=t.title;
      panel.querySelector('#nd-ai-sub').textContent=t.sub;
      input.placeholder=t.placeholder;send.textContent=t.send;
      panel.querySelector('#nd-ai-clear').textContent=t.clear;
      panel.querySelector('#nd-ai-disclaimer').textContent=t.disclaimer;
      if(!messages.children.length)bubble(t.welcome,'assistant');
    }
    launcher.addEventListener('click',()=>{panel.hidden=!panel.hidden;if(!panel.hidden)input.focus();});
    panel.querySelector('#nd-ai-close').addEventListener('click',()=>panel.hidden=true);
    panel.querySelector('#nd-ai-clear').addEventListener('click',()=>{history=[];messages.replaceChildren();paint();});
    panel.querySelector('#nd-ai-form').addEventListener('submit',async e=>{
      e.preventDefault();const prompt=input.value.trim();if(!prompt||send.disabled)return;
      input.value='';bubble(prompt,'user');history.push({role:'user',content:prompt});
      const t=getLang();const waiting=bubble(t.busy,'assistant');send.disabled=true;
      try{
        waiting.textContent=t.loading;
        const response=await fetch('https://workerforaiextension.batuhan-gulsen15.workers.dev/chat',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({messages:history.slice(-12),language:window.currentLang||localStorage.getItem('nextdns_lang')||'tr'})
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||'AI service request failed ('+response.status+')');
        const answer=String(data.reply||'').trim();
        if(!answer)throw new Error('Empty AI response');
        waiting.textContent=answer;history.push({role:'assistant',content:answer});
      }catch(err){
        console.error('NextDNS Worker AI:',err);
        waiting.textContent='AI bağlantısı kurulamadı: '+(err.message||t.error);
        history.pop();
      }      }finally{send.disabled=false;input.focus();}
    });
    paint();
    document.querySelectorAll('#lang-select,#lang-select-login').forEach(el=>el.addEventListener('change',paint));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
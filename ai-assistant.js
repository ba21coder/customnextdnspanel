(() => {
  'use strict';
  const ENDPOINT = window.NEXTDNS_AI_ENDPOINT || 'https://YOUR-AI-WORKER.workers.dev/chat';
  const copy = {
    tr:{title:'NextDNS AI Asistan',sub:'DNS ve panel yardımcısı',placeholder:'Bir şey sor...',send:'Gönder',welcome:'Merhaba! NextDNS, DNS gizliliği, panel özellikleri ve bağlantı sorunları hakkında yardımcı olabilirim.',busy:'Yanıt hazırlanıyor…',error:'AI servisine ulaşılamadı. Biraz sonra tekrar dene.',config:'AI servisi henüz yapılandırılmamış. Yönetici Cloudflare Worker adresini ayarlamalı.',clear:'Sohbeti temizle'},
    en:{title:'NextDNS AI Assistant',sub:'Your DNS and dashboard helper',placeholder:'Ask something...',send:'Send',welcome:'Hi! I can help with NextDNS, DNS privacy, dashboard features and connection issues.',busy:'Thinking…',error:'Could not reach the AI service. Please try again.',config:'The AI service is not configured yet. The administrator must set the Cloudflare Worker URL.',clear:'Clear chat'},
    es:{title:'Asistente IA de NextDNS',sub:'Ayuda para DNS y el panel',placeholder:'Escribe tu pregunta...',send:'Enviar',welcome:'¡Hola! Puedo ayudarte con NextDNS, privacidad DNS, funciones del panel y problemas de conexión.',busy:'Preparando respuesta…',error:'No se pudo conectar con el servicio de IA.',config:'El servicio de IA aún no está configurado.',clear:'Borrar chat'},
    zh:{title:'NextDNS AI 助手',sub:'DNS 与控制面板助手',placeholder:'输入问题…',send:'发送',welcome:'你好！我可以帮助你了解 NextDNS、DNS 隐私、面板功能和连接问题。',busy:'正在思考…',error:'无法连接 AI 服务。',config:'AI 服务尚未配置。',clear:'清除聊天'},
    de:{title:'NextDNS KI-Assistent',sub:'Hilfe für DNS und Dashboard',placeholder:'Frage eingeben…',send:'Senden',welcome:'Hallo! Ich helfe bei NextDNS, DNS-Datenschutz, Dashboard-Funktionen und Verbindungsproblemen.',busy:'Antwort wird erstellt…',error:'Der KI-Dienst ist nicht erreichbar.',config:'Der KI-Dienst ist noch nicht konfiguriert.',clear:'Chat löschen'}
  };
  const lang=()=>copy[window.currentLang || localStorage.getItem('nextdns_lang') || 'tr'] || copy.tr;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let history=[];
  function init(){
    if(document.getElementById('nd-ai-launcher'))return;
    const launcher=document.createElement('button');
    launcher.id='nd-ai-launcher';launcher.type='button';launcher.setAttribute('aria-label','Open AI assistant');
    launcher.textContent='✦ AI';
    Object.assign(launcher.style,{position:'fixed',right:'22px',bottom:'22px',zIndex:9998,border:'1px solid #3b82f6',background:'#1d4ed8',color:'#fff',borderRadius:'999px',padding:'12px 18px',fontWeight:'700',boxShadow:'0 8px 30px #0008',cursor:'pointer'});
    const panel=document.createElement('section');panel.id='nd-ai-panel';panel.hidden=true;
    Object.assign(panel.style,{position:'fixed',right:'20px',bottom:'82px',zIndex:9999,width:'min(390px,calc(100vw - 28px))',height:'min(560px,calc(100vh - 115px))',background:'#09090b',border:'1px solid #27272a',borderRadius:'18px',boxShadow:'0 18px 60px #000b',color:'#f4f4f5',display:'flex',flexDirection:'column',overflow:'hidden'});
    panel.innerHTML='<header style="padding:15px 16px;border-bottom:1px solid #27272a;display:flex;align-items:center;justify-content:space-between"><div><strong id="nd-ai-title"></strong><div id="nd-ai-sub" style="font-size:11px;color:#a1a1aa;margin-top:3px"></div></div><button id="nd-ai-close" aria-label="Close" style="background:transparent;color:#a1a1aa;font-size:22px;cursor:pointer">×</button></header><div id="nd-ai-messages" role="log" aria-live="polite" style="padding:14px;flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px"></div><form id="nd-ai-form" style="padding:12px;border-top:1px solid #27272a;display:flex;gap:8px"><input id="nd-ai-input" maxlength="2000" autocomplete="off" style="min-width:0;flex:1;background:#18181b;border:1px solid #3f3f46;border-radius:10px;padding:10px;color:#fff;font-size:13px"><button id="nd-ai-send" type="submit" style="background:#2563eb;color:white;border-radius:10px;padding:0 13px;font-size:12px;font-weight:700"></button></form><div style="padding:0 13px 10px;display:flex;justify-content:space-between;gap:8px"><small style="color:#71717a">AI yanıtları hata içerebilir.</small><button id="nd-ai-clear" type="button" style="color:#a1a1aa;font-size:11px"></button></div>';
    document.body.append(launcher,panel);
    const messages=panel.querySelector('#nd-ai-messages');
    function bubble(text,who){const div=document.createElement('div');div.textContent=text;Object.assign(div.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere',alignSelf:who==='user'?'flex-end':'flex-start',maxWidth:'90%',background:who==='user'?'#1d4ed8':'#27272a',padding:'10px 12px',borderRadius:'12px',fontSize:'13px',lineHeight:'1.5'});messages.appendChild(div);messages.scrollTop=messages.scrollHeight;return div;}
    function paint(){const t=lang();panel.querySelector('#nd-ai-title').textContent=t.title;panel.querySelector('#nd-ai-sub').textContent=t.sub;panel.querySelector('#nd-ai-input').placeholder=t.placeholder;panel.querySelector('#nd-ai-send').textContent=t.send;panel.querySelector('#nd-ai-clear').textContent=t.clear;if(!messages.children.length)bubble(t.welcome,'assistant');}
    launcher.addEventListener('click',()=>{panel.hidden=!panel.hidden;if(!panel.hidden)panel.querySelector('#nd-ai-input').focus();});
    panel.querySelector('#nd-ai-close').addEventListener('click',()=>panel.hidden=true);
    panel.querySelector('#nd-ai-clear').addEventListener('click',()=>{history=[];messages.replaceChildren();paint();});
    panel.querySelector('#nd-ai-form').addEventListener('submit',async e=>{
      e.preventDefault();const input=panel.querySelector('#nd-ai-input');const prompt=input.value.trim();if(!prompt)return;
      input.value='';bubble(prompt,'user');history.push({role:'user',content:prompt});
      const t=lang();if(ENDPOINT.includes('YOUR-AI-WORKER')){bubble(t.config,'assistant');return;}
      const waiting=bubble(t.busy,'assistant');panel.querySelector('#nd-ai-send').disabled=true;
      try{
        const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-12),language:localStorage.getItem('nextdns_lang')||'tr'})});
        const data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');
        const answer=String(data.reply||'').slice(0,7000);waiting.textContent=answer||t.error;history.push({role:'assistant',content:answer});
      }catch(err){waiting.textContent=t.error;history.pop();}
      finally{panel.querySelector('#nd-ai-send').disabled=false;input.focus();}
    });
    paint();
    document.querySelectorAll('#lang-select,#lang-select-login').forEach(el=>el.addEventListener('change',()=>{paint();}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
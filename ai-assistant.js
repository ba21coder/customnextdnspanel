
(() => {
  'use strict';

  // API anahtarı ve AI Worker gerekmez.
  // Model doğrudan kullanıcının tarayıcısında çalışır.
  const MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct';
  const LIBRARY_URL =
    'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';

  const copy = {
    tr: {
      title: 'NextDNS AI Asistan',
      sub: 'Yapay zekâ tarayıcında çalışır',
      placeholder: 'Bir şey sor...',
      send: 'Gönder',
      welcome: 'Merhaba! NextDNS, DNS gizliliği, panel özellikleri ve bağlantı sorunları hakkında yardımcı olabilirim.',
      loading: 'AI modeli hazırlanıyor… İlk kullanımda model indirilecek.',
      downloading: 'Model indiriliyor…',
      thinking: 'Yanıt hazırlanıyor…',
      error: 'Model başlatılamadı. İnternet bağlantını ve tarayıcı desteğini kontrol et.',
      clear: 'Sohbeti temizle',
      disclaimer: 'Yanıtlar cihazında oluşturulur; hata içerebilir.',
      ready: 'Model hazır',
      fallback: 'WebGPU kullanılamadı; WASM deneniyor…'
    },
    en: {
      title: 'NextDNS AI Assistant',
      sub: 'AI runs in your browser',
      placeholder: 'Ask something...',
      send: 'Send',
      welcome: 'Hi! I can help with NextDNS, DNS privacy, dashboard features and connection issues.',
      loading: 'Preparing AI model… The model downloads on first use.',
      downloading: 'Downloading model…',
      thinking: 'Generating response…',
      error: 'Could not start the model. Check your internet connection and browser support.',
      clear: 'Clear chat',
      disclaimer: 'Answers are generated on your device and may contain mistakes.',
      ready: 'Model ready',
      fallback: 'WebGPU unavailable; trying WASM…'
    },
    es: {
      title: 'Asistente IA de NextDNS',
      sub: 'La IA funciona en tu navegador',
      placeholder: 'Escribe tu pregunta...',
      send: 'Enviar',
      welcome: '¡Hola! Puedo ayudarte con NextDNS, privacidad DNS, funciones del panel y problemas de conexión.',
      loading: 'Preparando el modelo… Se descargará la primera vez.',
      downloading: 'Descargando el modelo…',
      thinking: 'Preparando respuesta…',
      error: 'No se pudo iniciar el modelo. Comprueba tu conexión y el navegador.',
      clear: 'Borrar chat',
      disclaimer: 'Las respuestas se generan en tu dispositivo y pueden contener errores.',
      ready: 'Modelo listo',
      fallback: 'WebGPU no disponible; probando WASM…'
    },
    zh: {
      title: 'NextDNS AI 助手',
      sub: 'AI 在浏览器中运行',
      placeholder: '输入问题…',
      send: '发送',
      welcome: '你好！我可以帮助你了解 NextDNS、DNS 隐私、控制面板功能和连接问题。',
      loading: '正在准备 AI 模型…首次使用时会下载模型。',
      downloading: '正在下载模型…',
      thinking: '正在生成回答…',
      error: '无法启动模型。请检查网络连接和浏览器支持。',
      clear: '清除聊天',
      disclaimer: '回答在你的设备上生成，可能包含错误。',
      ready: '模型已就绪',
      fallback: 'WebGPU 不可用；正在尝试 WASM…'
    },
    de: {
      title: 'NextDNS KI-Assistent',
      sub: 'KI läuft in deinem Browser',
      placeholder: 'Frage eingeben…',
      send: 'Senden',
      welcome: 'Hallo! Ich helfe bei NextDNS, DNS-Datenschutz, Dashboard-Funktionen und Verbindungsproblemen.',
      loading: 'KI-Modell wird vorbereitet… Beim ersten Start wird es heruntergeladen.',
      downloading: 'Modell wird heruntergeladen…',
      thinking: 'Antwort wird erstellt…',
      error: 'Das Modell konnte nicht gestartet werden. Prüfe Internetverbindung und Browser.',
      clear: 'Chat löschen',
      disclaimer: 'Antworten werden auf deinem Gerät erstellt und können Fehler enthalten.',
      ready: 'Modell bereit',
      fallback: 'WebGPU nicht verfügbar; WASM wird versucht…'
    }
  };

  const getLangCode = () => {
    const lang =
      window.currentLang ||
      localStorage.getItem('nextdns_lang') ||
      'tr';

    return copy[lang] ? lang : 'tr';
  };

  const getLang = () => copy[getLangCode()];

  let history = [];
  let generatorPromise = null;
  let modelStatus = null;

  function setStatus(message) {
    if (modelStatus) {
      modelStatus.textContent = message || '';
    }
  }

  async function loadModel() {
    if (!generatorPromise) {
      generatorPromise = (async () => {
        setStatus(getLang().loading);

        const lib = await import(LIBRARY_URL);

        lib.env.allowLocalModels = false;
        lib.env.useBrowserCache = true;

        const onProgress = (info) => {
          if (!info) return;

          if (
            info.status === 'progress' &&
            Number.isFinite(info.progress)
          ) {
            setStatus(
              getLang().downloading +
              ' ' +
              Math.round(info.progress) +
              '%'
            );
          } else if (
            info.status === 'initiate' ||
            info.status === 'download'
          ) {
            setStatus(getLang().downloading);
          } else if (info.status === 'ready') {
            setStatus(getLang().ready);
          }
        };

        const preferred = navigator.gpu
          ? 'webgpu'
          : 'wasm';

        try {
          const pipe = await lib.pipeline(
            'text-generation',
            MODEL,
            {
              device: preferred,
              dtype: 'q4',
              progress_callback: onProgress
            }
          );

          setStatus(getLang().ready);
          return pipe;

        } catch (firstError) {
          if (preferred !== 'webgpu') {
            throw firstError;
          }

          setStatus(getLang().fallback);

          const pipe = await lib.pipeline(
            'text-generation',
            MODEL,
            {
              device: 'wasm',
              dtype: 'q4',
              progress_callback: onProgress
            }
          );

          setStatus(getLang().ready);
          return pipe;
        }

      })().catch((error) => {
        generatorPromise = null;
        throw error;
      });
    }

    return generatorPromise;
  }

  function getAssistantText(result) {
    const generated =
      result &&
      result[0] &&
      result[0].generated_text;

    if (Array.isArray(generated)) {
      const last = generated[generated.length - 1];

      return String(
        last && last.content
          ? last.content
          : ''
      ).trim();
    }

    if (typeof generated === 'string') {
      return generated.trim();
    }

    return '';
  }

  function init() {
    if (document.getElementById('nd-ai-launcher')) {
      return;
    }

    const launcher = document.createElement('button');

    launcher.id = 'nd-ai-launcher';
    launcher.type = 'button';
    launcher.setAttribute(
      'aria-label',
      'Open AI assistant'
    );
    launcher.textContent = '✦ AI';

    Object.assign(launcher.style, {
      position: 'fixed',
      right: '22px',
      bottom: '22px',
      zIndex: 9998,
      border: '1px solid #3b82f6',
      background: '#1d4ed8',
      color: '#fff',
      borderRadius: '999px',
      padding: '12px 18px',
      fontWeight: '700',
      boxShadow: '0 8px 30px #0008',
      cursor: 'pointer'
    });

    const panel = document.createElement('section');

    panel.id = 'nd-ai-panel';
    panel.hidden = true;

    Object.assign(panel.style, {
      position: 'fixed',
      right: '20px',
      bottom: '82px',
      zIndex: 9999,
      width: 'min(390px,calc(100vw - 28px))',
      height: 'min(560px,calc(100vh - 115px))',
      background: '#09090b',
      border: '1px solid #27272a',
      borderRadius: '18px',
      boxShadow: '0 18px 60px #000b',
      color: '#f4f4f5',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    });

    panel.innerHTML = [
      '<header style="padding:15px 16px;border-bottom:1px solid #27272a;display:flex;align-items:center;justify-content:space-between">',
      '<div><strong id="nd-ai-title"></strong><div id="nd-ai-sub" style="font-size:11px;color:#a1a1aa;margin-top:3px"></div></div>',
      '<button id="nd-ai-close" type="button" aria-label="Close" style="background:transparent;color:#a1a1aa;font-size:22px;cursor:pointer">×</button></header>',

      '<div id="nd-ai-status" role="status" style="padding:7px 14px;color:#93c5fd;font-size:11px;border-bottom:1px solid #27272a"></div>',

      '<div id="nd-ai-messages" role="log" aria-live="polite" style="padding:14px;flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px"></div>',

      '<form id="nd-ai-form" style="padding:12px;border-top:1px solid #27272a;display:flex;gap:8px">',

      '<input id="nd-ai-input" maxlength="1200" autocomplete="off" style="min-width:0;flex:1;background:#18181b;border:1px solid #3f3f46;border-radius:10px;padding:10px;color:#fff;font-size:13px">',

      '<button id="nd-ai-send" type="submit" style="background:#2563eb;color:white;border-radius:10px;padding:0 13px;font-size:12px;font-weight:700"></button></form>',

      '<div style="padding:0 13px 10px;display:flex;justify-content:space-between;gap:8px;align-items:center">',

      '<small id="nd-ai-disclaimer" style="color:#71717a"></small>',

      '<button id="nd-ai-clear" type="button" style="color:#a1a1aa;font-size:11px;white-space:nowrap"></button></div>'

    ].join('');

    document.body.append(launcher, panel);

    const messages =
      panel.querySelector('#nd-ai-messages');

    const send =
      panel.querySelector('#nd-ai-send');

    const input =
      panel.querySelector('#nd-ai-input');

    modelStatus =
      panel.querySelector('#nd-ai-status');

    function bubble(value, who) {
      const div = document.createElement('div');

      div.textContent = value;

      Object.assign(div.style, {
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        alignSelf:
          who === 'user'
            ? 'flex-end'
            : 'flex-start',
        maxWidth: '90%',
        background:
          who === 'user'
            ? '#1d4ed8'
            : '#27272a',
        padding: '10px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        lineHeight: '1.5'
      });

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;

      return div;
    }

    function paint() {
      const t = getLang();

      panel.querySelector('#nd-ai-title').textContent =
        t.title;

      panel.querySelector('#nd-ai-sub').textContent =
        t.sub;

      input.placeholder = t.placeholder;
      send.textContent = t.send;

      panel.querySelector('#nd-ai-clear').textContent =
        t.clear;

      panel.querySelector('#nd-ai-disclaimer').textContent =
        t.disclaimer;

      if (!messages.children.length) {
        bubble(t.welcome, 'assistant');
      }
    }

    launcher.addEventListener('click', () => {
      panel.hidden = !panel.hidden;

      if (!panel.hidden) {
        input.focus();
      }
    });

    panel.querySelector('#nd-ai-close')
      .addEventListener('click', () => {
        panel.hidden = true;
      });

    panel.querySelector('#nd-ai-clear')
      .addEventListener('click', () => {
        history = [];
        messages.replaceChildren();
        paint();
      });

    panel.querySelector('#nd-ai-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        const prompt = input.value.trim();

        if (!prompt || send.disabled) {
          return;
        }

        input.value = '';

        bubble(prompt, 'user');

        history.push({
          role: 'user',
          content: prompt
        });

        const t = getLang();

        const waiting = bubble(
          t.loading,
          'assistant'
        );

        send.disabled = true;
        input.disabled = true;

        try {
          const generator = await loadModel();

          waiting.textContent = getLang().thinking;

          const systemPrompt =
            getLangCode() === 'tr'
              ? 'Sen NextDNS Pro panelinin yardımcı asistanısın. NextDNS, DNS, gizlilik, ağ güvenliği ve bu panelin özellikleri hakkında kısa, açık ve doğru yanıtlar ver. Bilmediğin güncel hesap verilerini gördüğünü iddia etme. Kullanıcıya Türkçe yanıt ver.'
              : 'You are the helpful assistant for the NextDNS Pro dashboard. Give clear and accurate answers about NextDNS, DNS, privacy, network security, and dashboard features. Never claim to see live account data you were not given. Reply in the user language.';

          const messagesForModel = [
            {
              role: 'system',
              content: systemPrompt
            },
            ...history.slice(-8)
          ];

          const result = await generator(
            messagesForModel,
            {
              max_new_tokens: 180,
              do_sample: false,
              repetition_penalty: 1.08
            }
          );

          const answer = getAssistantText(result);

          if (!answer) {
            throw new Error('Model boş yanıt verdi.');
          }

          waiting.textContent = answer;

          history.push({
            role: 'assistant',
            content: answer
          });

          setStatus(getLang().ready);

        } catch (error) {
          console.error('NextDNS local AI:', error);

          waiting.textContent =
            getLang().error +
            ' (' +
            (error.message || 'Unknown error') +
            ')';

          history.pop();

        } finally {
          send.disabled = false;
          input.disabled = false;
          input.focus();
        }
      });

    paint();

    document
      .querySelectorAll(
        '#lang-select,#lang-select-login'
      )
      .forEach((element) => {
        element.addEventListener('change', paint);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init
    );
  } else {
    init();
  }

})();

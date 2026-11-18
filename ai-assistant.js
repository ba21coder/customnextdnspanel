
(() => {
  'use strict';

  // API anahtarı ve AI Worker gerekmez.
  // Model doğrudan kullanıcının tarayıcısında çalışır.
  const MODEL = 'onnx-community/SmolLM2-135M-Instruct-ONNX-MHA';
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

        // 2–4 GB RAM'li cihazlarda WASM'i tek iş parçacığıyla çalıştır.
        // Daha güçlü cihazlarda WebGPU tercih edilebilir.
        const lowMemory = Number(navigator.deviceMemory || 0) > 0 && Number(navigator.deviceMemory) <= 4;
        try {
          lib.env.backends.onnx.wasm.numThreads = 1;
          // Eski işlemciler/tarayıcılar SIMD desteklemeyebilir.
          // SIMD kapalı WASM ikilisini zorla; aksi halde backend açılamaz.
          lib.env.backends.onnx.wasm.simd = false;
        } catch (configError) {
          console.warn('WASM uyumluluk ayarı uygulanamadı:', configError);
        }

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

        const preferred = navigator.gpu && !lowMemory
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
      display: 'none',
      flexDirection: 'column',
      overflow: 'hidden'
    });

    panel.innerHTML = [
      '<header style="padding:15px 16px;border-bottom:1px solid #27272a;display:flex;align-items:center;justify-content:space-between">',
      '<div><strong id="nd-ai-title"></strong><div id="nd-ai-sub" style="font-size:11px;color:#a1a1aa;margin-top:3px"></div></div>',
      '<button id="nd-ai-close" type="button" aria-label="Close" style="background:transparent;color:#a1a1aa;font-size:22px;cursor:pointer">×</button></header>',

      '<div id="nd-ai-status" role="status" style="padding:7px 14px;color:#93c5fd;font-size:11px;border-bottom:1px solid #27272a"></div>',

      '<div id="nd-ai-messages" role="log" aria-live="polite" style="padding:14px;flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px"></div>',

      '<div id="nd-ai-faq" role="listbox" aria-label="Sık sorulan sorular" hidden style="margin:0 12px 8px;max-height:220px;overflow-y:auto;border:1px solid #3f3f46;border-radius:12px;background:#18181b;box-shadow:0 10px 28px #0008"></div>',

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

    const faqPanel = panel.querySelector('#nd-ai-faq');
    const faqQuestions = [
      {
            "q": "NextDNS nedir ve ne işe yarar?",
            "a": "NextDNS, DNS isteklerini filtreleyerek reklamları, izleyicileri ve zararlı alan adlarını engellemeye yardımcı olan bir DNS hizmetidir."
      },
      {
            "q": "NextDNS hesabı nasıl oluşturulur?",
            "a": "NextDNS’in resmî sitesine girip kayıt ol bölümünden e-posta adresinle hesap oluşturabilirsin."
      },
      {
            "q": "NextDNS yapılandırma kimliğimi nereden bulurum?",
            "a": "NextDNS kontrol panelinde Kurulum (Setup) bölümünü aç. Yapılandırma kimliğin burada gösterilir."
      },
      {
            "q": "Bir cihazı NextDNS’e nasıl bağlarım?",
            "a": "Kontrol panelindeki Kurulum bölümünden cihazının işletim sistemini seç ve ekrandaki yönergeleri uygula."
      },
      {
            "q": "Windows’ta NextDNS nasıl kurulur?",
            "a": "Kurulum sayfasında Windows seçeneğini aç. Uygulama veya DNS-over-HTTPS yönergelerini izleyip yapılandırma kimliğini kullan."
      },
      {
            "q": "Android telefonda Özel DNS nasıl açılır?",
            "a": "Ayarlar > Ağ ve internet > Özel DNS bölümüne gir. NextDNS Kurulum sayfasındaki TLS ana bilgisayar adını buraya yaz."
      },
      {
            "q": "iPhone ve iPad’de NextDNS nasıl kullanılır?",
            "a": "NextDNS Kurulum sayfasında iOS seçeneğini aç. Sağlanan yapılandırma profilini indirip Ayarlar’dan yükle."
      },
      {
            "q": "Mac bilgisayarda NextDNS nasıl kurulur?",
            "a": "NextDNS Kurulum sayfasında macOS seçeneğini seç ve sunulan uygulama ya da profil yönergelerini uygula."
      },
      {
            "q": "Linux’ta NextDNS nasıl ayarlanır?",
            "a": "NextDNS Kurulum sayfasındaki Linux yönergelerini izle. Kullanılan dağıtıma ve DNS yöneticisine göre adımlar değişebilir."
      },
      {
            "q": "Tarayıcıda NextDNS kullanabilir miyim?",
            "a": "Evet. Tarayıcının güvenli DNS (DNS-over-HTTPS) ayarına NextDNS adresini girerek kullanabilirsin."
      },
      {
            "q": "NextDNS profili ile cihaz profili arasındaki fark nedir?",
            "a": "Yapılandırma profili DNS filtreleme ayarlarını belirler. Cihaz etiketi veya cihaz profili ise sorguları cihaz bazında ayırmana yardımcı olur."
      },
      {
            "q": "Birden fazla cihazı aynı hesaba bağlayabilir miyim?",
            "a": "Evet. Aynı yapılandırma kimliğini birden fazla cihazda kullanabilirsin. İstersen cihazları ayrı ayrı tanımlayabilirsin."
      },
      {
            "q": "Cihazımın NextDNS’e bağlı olup olmadığını nasıl anlarım?",
            "a": "NextDNS kontrol panelindeki Kurulum veya Test sayfasını aç. 'This device is using NextDNS' benzeri doğrulama mesajını kontrol et."
      },
      {
            "q": "Sorgu günlüklerini nereden görüntülerim?",
            "a": "Kontrol panelindeki Günlükler (Logs) bölümünü aç. Günlük kaydı etkinse DNS sorgularını burada görebilirsin."
      },
      {
            "q": "DNS sorgusu ne demektir?",
            "a": "Bir uygulama veya cihaz alan adının IP adresini öğrenmek için DNS sunucusuna istek gönderir. Bu isteğe DNS sorgusu denir."
      },
      {
            "q": "Engellenen alan adlarını nasıl görürüm?",
            "a": "Günlükler bölümünde engellenen sorguları filtreleyebilir ve engelleme nedenini inceleyebilirsin."
      },
      {
            "q": "Bir alan adının neden engellendiğini nasıl anlarım?",
            "a": "Günlüklerde alan adını seç. Engelleme nedeni veya eşleşen liste bilgisi görünüyorsa hangi kuralın etkili olduğunu gösterir."
      },
      {
            "q": "Bir alan adını izin listesine nasıl eklerim?",
            "a": "İzin Listesi (Allowlist) bölümüne alan adını ekle ve kaydet. Bu alan adı engelleme listelerinden muaf tutulur."
      },
      {
            "q": "Bir alan adını engelleme listesine nasıl eklerim?",
            "a": "Engelleme Listesi (Denylist) bölümüne alan adını ekle ve değişikliği kaydet."
      },
      {
            "q": "Özel izin listesi ve engelleme listesi nasıl çalışır?",
            "a": "İzin listesi belirli alan adlarının engellenmesini önler; engelleme listesi ise belirttiğin alan adlarını engeller."
      },
      {
            "q": "Reklam engelleme nasıl etkinleştirilir?",
            "a": "Gizlilik (Privacy) bölümünde uygun reklam engelleme listelerini etkinleştir. Değişiklikleri kaydet."
      },
      {
            "q": "İzleyici engelleme ne işe yarar?",
            "a": "İzleyici engelleme listeleri, uygulama ve sitelerin bilinen takip alan adlarına yaptığı DNS isteklerini durdurmaya yardımcı olur."
      },
      {
            "q": "Kimlik avı koruması nedir?",
            "a": "Kimlik avı koruması, kullanıcıları sahte giriş sayfaları ve kimlik bilgilerini çalmaya çalışan bilinen alan adlarından korumaya yardımcı olur."
      },
      {
            "q": "Kötü amaçlı yazılım koruması nasıl çalışır?",
            "a": "Etkinleştirilen güvenlik listeleri bilinen zararlı alan adlarına yapılan DNS isteklerini engellemeye yardımcı olur."
      },
      {
            "q": "Ebeveyn denetimleri nasıl ayarlanır?",
            "a": "Ebeveyn Denetimleri bölümünden uygun içerik kategorilerini seçebilir ve istersen belirli siteleri ayrıca engelleyebilirsin."
      },
      {
            "q": "Belirli kategorileri nasıl engellerim?",
            "a": "Ebeveyn Denetimleri veya Güvenlik bölümünde kategori listesini aç, engellemek istediklerini etkinleştir ve kaydet."
      },
      {
            "q": "Sosyal medya sitelerini nasıl kısıtlarım?",
            "a": "Ebeveyn Denetimleri bölümünde sosyal ağ kategorisini etkinleştir. Gerekirse belirli alan adlarını engelleme listesine ekle."
      },
      {
            "q": "Oyun sitelerini engellemek mümkün mü?",
            "a": "Evet. Uygun oyun kategorisini ebeveyn denetimlerinden engelleyebilir veya belirli oyun alan adlarını engelleme listesine ekleyebilirsin."
      },
      {
            "q": "Güvenli arama nasıl etkinleştirilir?",
            "a": "Ebeveyn Denetimleri bölümündeki Güvenli Arama (Safe Search) seçeneğini etkinleştir."
      },
      {
            "q": "YouTube Kısıtlı Mod nasıl açılır?",
            "a": "Ebeveyn Denetimleri bölümünde YouTube Kısıtlı Mod seçeneği varsa etkinleştir. Sonuçların uygulanması cihaz ve uygulamaya göre değişebilir."
      },
      {
            "q": "DNS-over-HTTPS (DoH) nedir?",
            "a": "DoH, DNS sorgularını HTTPS bağlantısı içinde şifreleyerek ileten DNS protokolüdür."
      },
      {
            "q": "DNS-over-TLS (DoT) nedir?",
            "a": "DoT, DNS sorgularını TLS ile şifreleyerek DNS sunucusuna iletir. Android Özel DNS bu yöntemi destekler."
      },
      {
            "q": "DNS-over-QUIC (DoQ) nedir?",
            "a": "DoQ, DNS sorgularını QUIC protokolü üzerinden şifreli biçimde taşır."
      },
      {
            "q": "DoH ile DoT arasındaki fark nedir?",
            "a": "İkisi de DNS trafiğini şifreler. DoH HTTPS üzerinden, DoT ise ayrı bir TLS bağlantısı üzerinden çalışır."
      },
      {
            "q": "NextDNS VPN midir?",
            "a": "Hayır. NextDNS bir VPN değildir; DNS sorgularını filtreler. Cihazının tüm internet trafiğini VPN gibi tünellemez."
      },
      {
            "q": "NextDNS ile VPN aynı anda kullanılabilir mi?",
            "a": "Çoğu durumda evet; ancak VPN uygulaması kendi DNS ayarlarını kullanıyorsa NextDNS devre dışı kalabilir. VPN’in DNS seçeneklerini kontrol et."
      },
      {
            "q": "WireGuard ile NextDNS birlikte çalışır mı?",
            "a": "Evet, yapılandırmaya bağlı olarak birlikte çalışabilir. WireGuard tünelinin DNS ayarında NextDNS sunucusunu belirtmen gerekir."
      },
      {
            "q": "NextDNS bağlantısı neden çalışmıyor?",
            "a": "İnternet bağlantını, yapılandırma kimliğini, cihazın DNS ayarını ve VPN/özel DNS çakışmalarını kontrol et. Ardından NextDNS test sayfasını dene."
      },
      {
            "q": "DNS önbelleğini nasıl temizlerim?",
            "a": "DNS önbelleği temizleme yöntemi işletim sistemine göre değişir. Windows, macOS ve Linux için kendi sisteminin DNS önbelleği komutunu kullan."
      },
      {
            "q": "Ayar değişiklikleri ne kadar sürede uygulanır?",
            "a": "Çoğu NextDNS ayarı kaydedildikten kısa süre sonra uygulanır. Cihazın veya uygulamanın DNS önbelleği eski sonucu bir süre tutabilir."
      },
      {
            "q": "İstatistikler neden güncellenmiyor?",
            "a": "Cihazın gerçekten NextDNS kullandığını, doğru yapılandırma kimliğini ve günlük/istatistik ayarlarını kontrol et. Veriler anında görünmeyebilir."
      },
      {
            "q": "Sorgu sayımı ve aylık kullanım nasıl takip edilir?",
            "a": "NextDNS kontrol panelindeki Analitik veya İstatistikler bölümünde sorgu sayısını ve kullanım dönemini kontrol edebilirsin."
      },
      {
            "q": "Aylık sorgu sınırına ulaşırsam ne olur?",
            "a": "Ücretsiz planın aylık sorgu kotası dolduğunda hizmetin filtreleme ve sorgu işleme koşulları planın güncel kurallarına göre değişebilir. Hesap panelindeki kullanım uyarısını kontrol et."
      },
      {
            "q": "NextDNS ücretsiz planında neler var?",
            "a": "Ücretsiz plan temel DNS filtreleme ve kontrol paneli özelliklerini belirli bir aylık sorgu kotasıyla sunar. Güncel sınırlar NextDNS’in planlar sayfasında yer alır."
      },
      {
            "q": "NextDNS Pro ile ücretsiz planın farkı nedir?",
            "a": "Ücretli planlar daha yüksek veya sınırsız sorgu kullanımı gibi ek haklar sunabilir. Güncel özellik ve fiyat karşılaştırması için NextDNS’in resmî planlar sayfasına bak."
      },
      {
            "q": "Bir yapılandırmayı başka cihaza nasıl taşırım?",
            "a": "Yeni cihazda NextDNS Kurulum sayfasını açıp aynı yapılandırma kimliğini kullan. İstersen cihazı ayrıca adlandır."
      },
      {
            "q": "Yedek DNS sunucusu eklemeli miyim?",
            "a": "Filtrelemeyi korumak istiyorsan rastgele bir DNS sunucusunu yedek olarak ekleme; cihaz başarısızlıkta ona geçerse NextDNS filtrelemesi atlanabilir."
      },
      {
            "q": "IPv6 ile NextDNS kullanabilir miyim?",
            "a": "Evet. NextDNS, Kurulum sayfasında IPv6 için desteklenen adresleri ve gerekli ayarları gösterir."
      },
      {
            "q": "NextDNS gizliliğimi nasıl korur?",
            "a": "DNS trafiğini şifreli protokollerle iletmene ve günlüklerin nasıl tutulacağını ayarlamana yardımcı olur. Gizlilik ayarlarını kontrol panelinden inceleyebilirsin."
      },
      {
            "q": "NextDNS bağlantısını nasıl test ederim?",
            "a": "Tarayıcıdan test.nextdns.io adresini aç. Sonuçta NextDNS kullanımı ve bağlantı protokolüyle ilgili durum bilgisi gösterilir."
      }
];

    function renderFaq(filter = '') {
      const query = filter.trim().toLocaleLowerCase('tr');
      const matches = faqQuestions.filter(entry =>
        entry.q.toLocaleLowerCase('tr').includes(query)
      );
      faqPanel.replaceChildren();

      if (!matches.length) {
        const empty = document.createElement('div');
        empty.textContent = 'Eşleşen soru bulunamadı.';
        empty.style.cssText = 'padding:12px;color:#a1a1aa;font-size:12px';
        faqPanel.appendChild(empty);
        return;
      }

      matches.forEach((entry) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.setAttribute('role', 'option');
        item.textContent = entry.q;
        item.style.cssText = 'display:block;width:100%;padding:10px 12px;text-align:left;background:transparent;color:#e4e4e7;font-size:12px;line-height:1.4;border:0;border-bottom:1px solid #27272a;cursor:pointer';
        item.addEventListener('mouseenter', () => item.style.background = '#27272a');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
        item.addEventListener('click', () => {
          faqPanel.hidden = true;
          input.value = '';
          bubble(entry.q, 'user');
          bubble(entry.a, 'assistant');
          setStatus(getLang().ready);
        });
        faqPanel.appendChild(item);
      });
    }

    function openFaq() {
      renderFaq(input.value);
      faqPanel.hidden = false;
    }

    input.addEventListener('focus', openFaq);
    input.addEventListener('click', openFaq);
    input.addEventListener('input', () => {
      if (!faqPanel.hidden) renderFaq(input.value);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') faqPanel.hidden = true;
    });
    document.addEventListener('pointerdown', (event) => {
      if (!faqPanel.contains(event.target) && event.target !== input) {
        faqPanel.hidden = true;
      }
    });

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
      panel.style.display = panel.hidden ? 'none' : 'flex';

      if (!panel.hidden) {
        input.focus();
      }
    });

    panel.querySelector('#nd-ai-close')
      .addEventListener('click', () => {
        panel.hidden = true;
        panel.style.display = 'none';
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
        faqPanel.hidden = true;

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
            ...history.slice(-4)
          ];

          const result = await generator(
            messagesForModel,
            {
              max_new_tokens: 96,
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

          const errorMessage = String(error && error.message || 'Unknown error');
          waiting.textContent = /Array buffer allocation failed|memory|allocate/i.test(errorMessage)
            ? (getLangCode() === 'tr'
                ? 'Bu cihazda model için yeterli boş bellek ayrılamadı. Diğer sekmeleri kapatıp tekrar deneyebilirsin.'
                : 'There is not enough free memory to load the model. Close other tabs and try again.')
            : getLang().error + ' (' + errorMessage + ')';

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

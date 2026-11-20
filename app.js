const PROXY_URL = 'https://nextdns-proxy.batuhan-gulsen15.workers.dev';

// API keys are kept only for the current browser session; profile labels are non-secret metadata.
let apiKey = sessionStorage.getItem('nextdns_api_key') || '';
let apiProfiles = JSON.parse(localStorage.getItem('nextdns_profiles') || '[]');
let activeApiProfileId = sessionStorage.getItem('nextdns_active_profile') || '';
let selectedLoginAvatar = 'icon:globe';
let rememberedLoginTimer = null;
// Migrate the old persistent key once, then remove it from localStorage.
const legacyApiKey = localStorage.getItem('nextdns_api_key');
if (!apiKey && legacyApiKey) {
    apiKey = legacyApiKey;
    sessionStorage.setItem('nextdns_api_key', legacyApiKey);
}
if (legacyApiKey) localStorage.removeItem('nextdns_api_key');
let currentProfileId = '';
let readOnlyStatsMode = false;
let readOnlyProfileId = '';
let cachedLogs = [];
let currentLang = localStorage.getItem('nextdns_lang') || 'tr';

const translations = {
    tr: {
        loginSub: "Gelişmiş Ağ & DNS Yönetim Merkezi",
        apiKeyLabel: "NextDNS API Anahtarı",
        connectBtn: "Panele Bağlan",
        logoutBtn: "Çıkış",
        tabOverview: "Genel Bakış",
        tabLogs: "Canlı Cihaz Trafiği",
        tabLists: "Kara & Beyaz Liste",
        tabParental: "Ebeveyn Kontrolü",
        tabPrivacy: "Gizlilik & Filtreler",
        tabSetup: "Kurulum",
        statTotalQueries: "Toplam DNS Sorgusu",
        statBlockedQueries: "Engellenen Sorgular",
        statBlockRatio: "Engelleme Oranı",
        connectedDevices: "Bağlı Cihazlar (Clients)",
        topBlockedDomains: "En Çok Engellenen Alan Adları",
        searchPlaceholder: "Cihaz adı veya alan adı ara...",
        filterAll: "Tüm Trafik",
        filterBlocked: "Sadece Engellenenler",
        filterAllowed: "Sadece İzin Verilenler",
        refreshBtn: "Yenile",
        thTime: "Saat",
        thDomain: "Ziyaret Edilen / Talep Edilen Adres",
        thDevice: "Bağlı Cihaz",
        thStatus: "Trafik Durumu",
        thProtocol: "Protokol",
        thAction: "Hızlı İşlem",
        denylistTitle: "Kara Liste (Denylist)",
        allowlistTitle: "Beyaz Liste (Allowlist)",
        btnBlock: "Engelle",
        btnAllow: "İzin Ver",
        parentalHeader: "Uygulama & Oyun Engelleme (GAMAF / Servisler)",
        parentalSub: "Tek tıkla popüler sosyal medya, oyun ve platformların DNS erişimini kesin.",
        privacyHeader: "Aktif Reklam & İzleyici Engelleyici Listeler",
        privacySub: "Profilinizde aktif olan DNS filtre listeleri.",
        setupHeader: "Cihaz Kurulum Bilgileri",
        setupSub: "Seçili profili cihazlarınıza bağlamak için aşağıdaki uç noktaları kullanın.",
        desktopHeader: "Masaüstü & TV Uygulama İndirme Merkezi",
        desktopSub: "Windows (.msi), macOS ve Android TV cihazlarınız için resmi NextDNS uygulamaları.",
        winDesc: "Windows sistem tepsisi tabanlı resmi NextDNS masaüstü istemcisi.",
        macDesc: "Mac bilgisayarlar için menü çubuğu entegreli yerel NextDNS uygulaması.",
        downloadWinBtn: "Windows İndir",
        downloadMacBtn: "macOS İndir",
        apkManagerDesc: "Android TV ve Google TV cihazlar için açık kaynaklı NextDNS yöneticisi.",
        downloadApkBtn: "APK İndir",
        tvAdbTitle: "TV ADB Komutu",
        tvAdbDesc: "TV'de uygulama kurmadan DNS açmak için:",
        allowedBadge: "İzin Verildi",
        blockedBadge: "Engellendi",
        allowBtn: "İzin Ver",
        blockBtn: "Engelle",
        active: "Aktif",
        blocked: "Engelli",
        open: "Açık"
    },
    en: {
        loginSub: "Advanced Network & DNS Management Center",
        apiKeyLabel: "NextDNS API Key",
        connectBtn: "Connect to Panel",
        logoutBtn: "Logout",
        tabOverview: "Overview",
        tabLogs: "Live Device Traffic",
        tabLists: "Denylist & Allowlist",
        tabParental: "Parental Control",
        tabPrivacy: "Privacy & Filters",
        tabSetup: "Setup",
        statTotalQueries: "Total DNS Queries",
        statBlockedQueries: "Blocked Queries",
        statBlockRatio: "Block Ratio",
        connectedDevices: "Connected Devices (Clients)",
        topBlockedDomains: "Top Blocked Domains",
        searchPlaceholder: "Search device name or domain...",
        filterAll: "All Traffic",
        filterBlocked: "Blocked Only",
        filterAllowed: "Allowed Only",
        refreshBtn: "Refresh",
        thTime: "Time",
        thDomain: "Visited / Requested Domain",
        thDevice: "Connected Device",
        thStatus: "Traffic Status",
        thProtocol: "Protocol",
        thAction: "Quick Action",
        denylistTitle: "Denylist",
        allowlistTitle: "Allowlist",
        btnBlock: "Block",
        btnAllow: "Allow",
        parentalHeader: "App & Game Blocking (GAMAF / Services)",
        parentalSub: "Cut off DNS access to popular social media, games and platforms with one click.",
        privacyHeader: "Active Ad & Tracker Blocker Lists",
        privacySub: "DNS filter lists active in your profile.",
        setupHeader: "Device Setup Information",
        setupSub: "Use the endpoints below to connect the selected profile to your devices.",
        desktopHeader: "Desktop & TV App Download Center",
        desktopSub: "Official NextDNS apps for Windows (.msi), macOS and Android TV.",
        winDesc: "Official NextDNS desktop client for Windows system tray.",
        macDesc: "Native NextDNS app for Mac menu bar.",
        downloadWinBtn: "Download Windows",
        downloadMacBtn: "Download macOS",
        apkManagerDesc: "Open-source NextDNS manager for Android TV and Google TV.",
        downloadApkBtn: "Download APK",
        tvAdbTitle: "TV ADB Command",
        tvAdbDesc: "To enable DNS on TV without apps:",
        allowedBadge: "Allowed",
        blockedBadge: "Blocked",
        allowBtn: "Allow",
        blockBtn: "Block",
        active: "Active",
        blocked: "Blocked",
        open: "Open"
    },
    es: {
        loginSub: "Centro de Gestión Avanzada de Red y DNS",
        apiKeyLabel: "Clave API de NextDNS",
        connectBtn: "Conectar al Panel",
        logoutBtn: "Cerrar Sesión",
        tabOverview: "Resumen",
        tabLogs: "Tráfico de Dispositivos en Vivo",
        tabLists: "Lista Negra y Blanca",
        tabParental: "Control Parental",
        tabPrivacy: "Privacidad y Filtros",
        tabSetup: "Configuración",
        statTotalQueries: "Consultas DNS Totales",
        statBlockedQueries: "Consultas Bloqueadas",
        statBlockRatio: "Tasa de Bloqueo",
        connectedDevices: "Dispositivos Conectados (Clientes)",
        topBlockedDomains: "Dominios Más Bloqueados",
        searchPlaceholder: "Buscar nombre de dispositivo o dominio...",
        filterAll: "Todo el Tráfico",
        filterBlocked: "Solo Bloqueadas",
        filterAllowed: "Solo Permitidas",
        refreshBtn: "Actualizar",
        thTime: "Hora",
        thDomain: "Dominio Visitado / Solicitado",
        thDevice: "Dispositivo Conectado",
        thStatus: "Estado del Tráfico",
        thProtocol: "Protocolo",
        thAction: "Acción Rápida",
        denylistTitle: "Lista Negra (Denylist)",
        allowlistTitle: "Lista Blanca (Allowlist)",
        btnBlock: "Bloquear",
        btnAllow: "Permitir",
        parentalHeader: "Bloqueo de Apps y Juegos (GAMAF)",
        parentalSub: "Corta el acceso DNS a redes sociales, juegos y plataformas con un solo clic.",
        privacyHeader: "Listas de Bloqueo de Anuncios y Rastreadores",
        privacySub: "Listas de filtros DNS activas en tu perfil.",
        setupHeader: "Información de Configuración",
        setupSub: "Usa los siguientes puntos finales para conectar tu perfil.",
        desktopHeader: "Centro de Descargas de Escritorio y TV",
        desktopSub: "Aplicaciones oficiales de NextDNS para Windows, macOS y Android TV.",
        winDesc: "Cliente de escritorio oficial de NextDNS para Windows.",
        macDesc: "Aplicación nativa de NextDNS para la barra de menús de Mac.",
        downloadWinBtn: "Descargar Windows",
        downloadMacBtn: "Descargar macOS",
        apkManagerDesc: "Administrador de NextDNS de código abierto para Android TV.",
        downloadApkBtn: "Descargar APK",
        tvAdbTitle: "Comando ADB para TV",
        tvAdbDesc: "Para activar DNS en la TV sin aplicaciones:",
        allowedBadge: "Permitido",
        blockedBadge: "Bloqueado",
        allowBtn: "Permitir",
        blockBtn: "Bloquear",
        active: "Activo",
        blocked: "Bloqueado",
        open: "Abierto"
    },
    zh: {
        loginSub: "高级网络与 DNS 管理中心",
        apiKeyLabel: "NextDNS API 密钥",
        connectBtn: "连接到面板",
        logoutBtn: "登出",
        tabOverview: "概览",
        tabLogs: "实时设备流量",
        tabLists: "黑白名单",
        tabParental: "家长控制",
        tabPrivacy: "隐私与过滤",
        tabSetup: "设置",
        statTotalQueries: "DNS 查询总数",
        statBlockedQueries: "已拦截查询",
        statBlockRatio: "拦截率",
        connectedDevices: "已连接设备 (客户端)",
        topBlockedDomains: "最常拦截的域",
        searchPlaceholder: "搜索设备名称或域...",
        filterAll: "所有流量",
        filterBlocked: "仅已拦截",
        filterAllowed: "仅允许",
        refreshBtn: "刷新",
        thTime: "时间",
        thDomain: "访问 / 请求的域",
        thDevice: "连接的设备",
        thStatus: "流量状态",
        thProtocol: "协议",
        thAction: "快捷操作",
        denylistTitle: "黑名单 (Denylist)",
        allowlistTitle: "白名单 (Allowlist)",
        btnBlock: "拦截",
        btnAllow: "允许",
        parentalHeader: "应用与游戏拦截 (GAMAF / 服务)",
        parentalSub: "一键切断对热门社交媒体、游戏和平台的 DNS 访问。",
        privacyHeader: "广告与跟踪器拦截列表",
        privacySub: "当前配置文件中激活的 DNS 过滤列表。",
        setupHeader: "设备安装信息",
        setupSub: "使用以下终端将选定的配置文件连接到您的设备。",
        desktopHeader: "桌面与电视应用下载中心",
        desktopSub: "适用于 Windows、macOS 和 Android TV 的官方 NextDNS 应用程序。",
        winDesc: "Windows 系统托盘官方 NextDNS 桌面客户端。",
        macDesc: "Mac 菜单栏本地 NextDNS 应用程序。",
        downloadWinBtn: "下载 Windows",
        downloadMacBtn: "下载 macOS",
        apkManagerDesc: "适用于 Android TV 的开源 NextDNS 管理器。",
        downloadApkBtn: "下载 APK",
        tvAdbTitle: "电视 ADB 命令",
        tvAdbDesc: "无需应用即可在电视上启用 DNS：",
        allowedBadge: "允许",
        blockedBadge: "已拦截",
        allowBtn: "允许",
        blockBtn: "拦截",
        active: "活跃",
        blocked: "已拦截",
        open: "开启"
    },
    de: {
        loginSub: "Erweitertes Netzwerk- und DNS-Verwaltungszentrum",
        apiKeyLabel: "NextDNS API-Schlüssel",
        connectBtn: "Mit Panel verbinden",
        logoutBtn: "Abmelden",
        tabOverview: "Übersicht",
        tabLogs: "Live-Geräteverkehr",
        tabLists: "Blacklist & Whitelist",
        tabParental: "Kindersicherung",
        tabPrivacy: "Datenschutz & Filter",
        tabSetup: "Einrichtung",
        statTotalQueries: "DNS-Gesamtabfragen",
        statBlockedQueries: "Blockierte Abfragen",
        statBlockRatio: "Blockierrate",
        connectedDevices: "Verbundene Geräte (Clients)",
        topBlockedDomains: "Meistblockierte Domains",
        searchPlaceholder: "Gerätename oder Domain suchen...",
        filterAll: "Gesamter Datenverkehr",
        filterBlocked: "Nur Blockierte",
        filterAllowed: "Nur Erlaubte",
        refreshBtn: "Aktualisieren",
        thTime: "Uhrzeit",
        thDomain: "Besuchte / Angefragte Domain",
        thDevice: "Verbundenes Gerät",
        thStatus: "Status",
        thProtocol: "Protokoll",
        thAction: "Aktion",
        denylistTitle: "Blacklist (Denylist)",
        allowlistTitle: "Whitelist (Allowlist)",
        btnBlock: "Blockieren",
        btnAllow: "Erlauben",
        parentalHeader: "App- & Spielesperre (GAMAF / Dienste)",
        parentalSub: "Sperren Sie mit einem Klick den DNS-Zugriff auf soziale Medien und Spiele.",
        privacyHeader: "Werbe- & Tracker-Blocker-Listen",
        privacySub: "In Ihrem Profil aktive DNS-Filterlisten.",
        setupHeader: "Geräteeinrichtung",
        setupSub: "Verwenden Sie die Endpunkte unten, um Ihr Profil zu verbinden.",
        desktopHeader: "Desktop- & TV-App-Download-Center",
        desktopSub: "Offizielle NextDNS-Apps für Windows, macOS und Android TV.",
        winDesc: "Offizieller NextDNS-Desktop-Client für die Windows-Taskleiste.",
        macDesc: "Native NextDNS-App für die Mac-Menüleiste.",
        downloadWinBtn: "Windows herunterladen",
        downloadMacBtn: "macOS herunterladen",
        apkManagerDesc: "Open-Source NextDNS-Manager für Android TV.",
        downloadApkBtn: "APK herunterladen",
        tvAdbTitle: "TV ADB-Befehl",
        tvAdbDesc: "Um DNS auf dem TV ohne Apps zu aktivieren:",
        allowedBadge: "Erlaubt",
        blockedBadge: "Blockiert",
        allowBtn: "Erlauben",
        blockBtn: "Blockieren",
        active: "Aktiv",
        blocked: "Blockiert",
        open: "Offen"
    }
};

const POPULAR_SERVICES = [
    { id: 'tiktok', name: 'TikTok' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'roblox', name: 'Roblox' },
    { id: 'minecraft', name: 'Minecraft' },
    { id: 'discord', name: 'Discord' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'twitter', name: 'X (Twitter)' },
    { id: 'snapchat', name: 'Snapchat' },
    { id: 'netflix', name: 'Netflix' },
    { id: 'twitch', name: 'Twitch' },
    { id: 'steam', name: 'Steam' }
];

// Android TV Kumanda Navigasyon Sistemi
let focusableElements = [];
let currentFocusIndex = 0;

function initTvNavigation() {
    focusableElements = Array.from(document.querySelectorAll('button, input, select, a')).filter(el => {
        return !el.closest('.hidden') && el.offsetParent !== null;
    });
    if (focusableElements.length > 0) {
        currentFocusIndex = 0;
        updateFocusStyles();
    }
}

function updateFocusStyles() {
    focusableElements.forEach((el, index) => {
        if (index === currentFocusIndex) {
            el.classList.add('tv-focused');
            el.focus();
        } else {
            el.classList.remove('tv-focused');
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
        focusableElements = Array.from(document.querySelectorAll('button, input, select, a')).filter(el => {
            return !el.closest('.hidden') && el.offsetParent !== null;
        });

        if (focusableElements.length === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            currentFocusIndex = (currentFocusIndex + 1) % focusableElements.length;
            updateFocusStyles();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            currentFocusIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
            updateFocusStyles();
        } else if (e.key === 'Enter') {
            if (focusableElements[currentFocusIndex]) {
                focusableElements[currentFocusIndex].click();
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    document.getElementById('lang-select').value = currentLang;
    document.getElementById('lang-select-login').value = currentLang;
    updateLanguageTexts(currentLang);

    document.getElementById('lang-select').addEventListener('change', (e) => changeLanguage(e.target.value));
    document.getElementById('lang-select-login').addEventListener('change', (e) => changeLanguage(e.target.value));

    if (apiKey || activeApiProfileId) {
        const rememberedAccount = activeApiProfileId;
        const rememberedKey = rememberedAccount
            ? (sessionStorage.getItem('nd_api_key_' + rememberedAccount) || apiKey)
            : apiKey;
        if (rememberedKey) {
            document.getElementById('api-key-input').value = rememberedKey;
            // Keep the login screen visible; reconnect to the most recently used profile after 5 minutes.
            rememberedLoginTimer = setTimeout(() => {
                const loginScreen = document.getElementById('login-screen');
                if (!loginScreen || loginScreen.classList.contains('hidden')) return;
                const latestId = sessionStorage.getItem('nextdns_active_profile') || activeApiProfileId;
                const latestKey = (latestId && sessionStorage.getItem('nd_api_key_' + latestId)) || rememberedKey;
                if (latestId) activeApiProfileId = latestId;
                document.getElementById('api-key-input').value = latestKey;
                checkLogin(latestKey, { skipAccountSave: Boolean(latestId) });
            }, 5 * 60 * 1000);
        }
    }

    renderLoginSavedProfiles();
    document.getElementById('login-avatar-presets')?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-avatar-preset]');
        if (!button) return;
        selectedLoginAvatar = 'icon:' + button.dataset.avatarPreset;
        document.querySelectorAll('#login-avatar-presets [data-avatar-preset]').forEach(item => {
            item.classList.toggle('ring-2', item === button);
            item.classList.toggle('ring-blue-400', item === button);
            item.classList.toggle('border-blue-400', item === button);
        });
        document.getElementById('login-avatar-status').textContent = 'Hazır ikon seçildi.';
    });
    document.getElementById('login-avatar-upload')?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showError('Lütfen bir resim dosyası seçin.');
            event.target.value = '';
            return;
        }
        if (file.size > 1024 * 1024) {
            showError('Profil resmi en fazla 1 MB olabilir.');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            selectedLoginAvatar = String(reader.result || '');
            document.querySelectorAll('#login-avatar-presets [data-avatar-preset]').forEach(item => {
                item.classList.remove('ring-2', 'ring-blue-400', 'border-blue-400');
            });
            document.getElementById('login-avatar-status').textContent = 'Kendi resmin seçildi.';
        };
        reader.onerror = () => showError('Resim okunamadı. Tekrar deneyin.');
        reader.readAsDataURL(file);
    });
    document.getElementById('login-btn').addEventListener('click', () => {
        if (rememberedLoginTimer) { clearTimeout(rememberedLoginTimer); rememberedLoginTimer = null; }
        const key = document.getElementById('api-key-input').value.trim();
        const profileName = document.getElementById('login-profile-name').value.trim();
        if (!key) return showError('Lütfen geçerli bir API anahtarı girin.');
        checkLogin(key, { profileName });
    });

    document.getElementById('login-manage-profiles-btn')?.addEventListener('click', openApiProfiles);
    document.getElementById('manage-api-profiles-btn')?.addEventListener('click', openApiProfiles);
    document.getElementById('close-api-profiles-btn')?.addEventListener('click', closeApiProfiles);
    document.getElementById('add-api-profile-btn')?.addEventListener('click', addApiProfile);
    document.getElementById('api-profiles-list')?.addEventListener('click', async (event) => {
        const switchButton = event.target.closest('[data-switch-api]');
        const removeButton = event.target.closest('[data-remove-api]');
        if (switchButton) await switchApiProfile(switchButton.dataset.switchApi);
        if (removeButton) removeApiProfile(removeButton.dataset.removeApi);
    });
    document.getElementById('login-saved-profiles')?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-login-profile]');
        if (!button) return;
        if (rememberedLoginTimer) { clearTimeout(rememberedLoginTimer); rememberedLoginTimer = null; }
        const id = button.dataset.loginProfile;
        const key = sessionStorage.getItem('nd_api_key_' + id);
        if (!key) {
            showError('Bu profilin API anahtarı bu tarayıcı oturumunda bulunmuyor. API anahtarını yeniden girip aynı profil adıyla kaydedebilirsin.');
            document.getElementById('api-key-input').focus();
            return;
        }
        activeApiProfileId = id;
        sessionStorage.setItem('nextdns_active_profile', id);
        sessionStorage.setItem('nextdns_api_key', key);
        document.getElementById('api-key-input').value = key;
        await checkLogin(key, { skipAccountSave: true });
    });

    document.getElementById('readonly-stats-btn').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value.trim();
        const profileId = document.getElementById('readonly-profile-id').value.trim();
        if (!key) return showError('İstatistikleri görüntülemek için API anahtarını girin.');
        if (!/^[a-zA-Z0-9_-]{3,64}$/.test(profileId)) {
            return showError('Geçerli bir NextDNS Profil ID girin.');
        }
        checkReadonlyStats(key, profileId);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('nextdns_api_key');
        apiKey = '';
        currentProfileId = '';
        readOnlyStatsMode = false;
        readOnlyProfileId = '';
        setReadOnlyDashboardUI(false);
        document.getElementById('dashboard-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        setTimeout(initTvNavigation, 300);
    });

    document.getElementById('profile-select').addEventListener('change', (e) => {
        currentProfileId = e.target.value;
        loadAllProfileData(currentProfileId);
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
        if (currentProfileId) loadAllProfileData(currentProfileId);
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'border-blue-500', 'text-blue-400');
                b.classList.add('border-transparent', 'text-zinc-400');
            });
            btn.classList.add('active', 'border-blue-500', 'text-blue-400');
            btn.classList.remove('border-transparent', 'text-zinc-400');

            const target = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${target}`).classList.remove('hidden');
            setTimeout(initTvNavigation, 200);
        });
    });

    document.getElementById('log-search').addEventListener('input', filterAndRenderLogs);
    document.getElementById('log-filter').addEventListener('change', filterAndRenderLogs);
    document.getElementById('reload-logs-btn').addEventListener('click', () => fetchLogs(currentProfileId));

    setTimeout(initTvNavigation, 500);
});

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('nextdns_lang', lang);
    document.getElementById('lang-select').value = lang;
    document.getElementById('lang-select-login').value = lang;
    updateLanguageTexts(lang);
    if (currentProfileId) loadAllProfileData(currentProfileId);
}

function updateLanguageTexts(lang) {
    const t = translations[lang] || translations.tr;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
}

async function apiFetch(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    if (readOnlyStatsMode && method !== 'GET') {
        throw new Error('Salt okunur modda değişiklik yapılamaz.');
    }
    const res = await fetch(`${PROXY_URL}${endpoint}`, {
        ...options,
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
    if (res.status === 204) return null;
    return res.json();
}

async function checkLogin(key, options = {}) {
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');
    readOnlyStatsMode = false;
    readOnlyProfileId = '';
    setReadOnlyDashboardUI(false);
    apiKey = key;

    try {
        const data = await apiFetch('/profiles');
        if (!data.data || data.data.length === 0) throw new Error('Profil bulunamadı.');

        sessionStorage.setItem('nextdns_api_key', apiKey);
        if (!options.skipAccountSave) {
            const existing = apiProfiles.find(item => item.id === activeApiProfileId);
            if (existing) {
                existing.name = options.profileName || existing.name || 'NextDNS hesabım';
                existing.avatar = selectedLoginAvatar;
            } else {
                activeApiProfileId = 'api-' + Date.now().toString(36);
                apiProfiles.push({ id: activeApiProfileId, name: options.profileName || ('NextDNS hesabı ' + (apiProfiles.length + 1)), avatar: selectedLoginAvatar });
            }
            sessionStorage.setItem('nd_api_key_' + activeApiProfileId, apiKey);
            sessionStorage.setItem('nextdns_active_profile', activeApiProfileId);
            localStorage.setItem('nextdns_profiles', JSON.stringify(apiProfiles));
        }
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');

        const select = document.getElementById('profile-select');
        select.innerHTML = '';
        data.data.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name || p.fingerprint || p.id} (${p.id})`;
            select.appendChild(opt);
        });

        const rememberedProfile = activeApiProfileId && sessionStorage.getItem('nextdns_selected_profile_' + activeApiProfileId);
        currentProfileId = data.data.some(p => p.id === rememberedProfile) ? rememberedProfile : data.data[0].id;
        select.value = currentProfileId;
        if (activeApiProfileId) sessionStorage.setItem('nextdns_selected_profile_' + activeApiProfileId, currentProfileId);
        renderApiProfiles();
        loadAllProfileData(currentProfileId);
        setTimeout(initTvNavigation, 300);
    } catch (err) {
        errorEl.textContent = 'Giriş başarısız: API anahtarını kontrol edin.';
        errorEl.classList.remove('hidden');
    }
}


function setReadOnlyDashboardUI(enabled) {
    const nav = document.querySelector('nav');
    const profileSelect = document.getElementById('profile-select');
    const accountButton = document.getElementById('manage-api-profiles-btn');
    const profileLabel = document.getElementById('readonly-profile-label');

    nav?.classList.toggle('hidden', enabled);
    profileSelect?.classList.toggle('hidden', enabled);
    accountButton?.classList.toggle('hidden', enabled);
    if (profileLabel) {
        profileLabel.classList.toggle('hidden', !enabled);
        profileLabel.textContent = enabled ? `Salt okunur · ${readOnlyProfileId}` : '';
    }

    // Always return to the overview tab when changing access modes.
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.toggle('hidden', tab.id !== 'tab-overview');
    });
}

async function checkReadonlyStats(key, profileId) {
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');
    apiKey = key;

    try {
        // Validate access with a read-only analytics endpoint.
        const result = await apiFetch(`/profiles/${encodeURIComponent(profileId)}/analytics/status`);
        if (!Array.isArray(result.data)) throw new Error('İstatistik verisi alınamadı.');

        readOnlyStatsMode = true;
        readOnlyProfileId = profileId;
        currentProfileId = profileId;
        sessionStorage.setItem('nextdns_api_key', apiKey);

        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        setReadOnlyDashboardUI(true);
        await fetchOverviewStats(profileId);
        setTimeout(initTvNavigation, 300);
    } catch (err) {
        apiKey = '';
        errorEl.textContent = 'Bağlantı kurulamadı. API anahtarını ve Profil ID bilgisini kontrol edin.';
        errorEl.classList.remove('hidden');
    }
}

/* Multi-account / API profile manager */
function saveApiProfiles() {
    localStorage.setItem('nextdns_profiles', JSON.stringify(apiProfiles));
    renderApiProfiles();
}

function openApiProfiles() {
    const modal = document.getElementById('api-profiles-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    renderApiProfiles();
    setTimeout(initTvNavigation, 100);
}

function closeApiProfiles() {
    document.getElementById('api-profiles-modal')?.classList.add('hidden');
    setTimeout(initTvNavigation, 100);
}

function renderLoginSavedProfiles() {
    const container = document.getElementById('login-saved-profiles');
    const section = document.getElementById('login-saved-profiles-section');
    if (!container || !section) return;
    section.classList.toggle('hidden', !apiProfiles.length);
    container.innerHTML = apiProfiles.map((profile, index) => {
        const ready = Boolean(sessionStorage.getItem('nd_api_key_' + profile.id));
        const initials = escapeHtml((profile.name || 'ND').trim().slice(0, 2).toUpperCase());
        const avatar = typeof profile.avatar === 'string' && profile.avatar.startsWith('data:image/')
            ? '<img src="' + profile.avatar + '" alt="" class="w-full h-full rounded-full object-cover">'
            : (typeof profile.avatar === 'string' && profile.avatar.startsWith('icon:')
                ? '<i data-lucide="' + escapeHtml(profile.avatar.slice(5)) + '" class="w-5 h-5"></i>'
                : '<span>' + escapeHtml(profile.avatar || initials) + '</span>');
        const selected = profile.id === activeApiProfileId;
        return `<button type="button" data-login-profile="${escapeHtml(profile.id)}" title="${escapeHtml(profile.name)}" class="w-14 flex flex-col items-center gap-1.5 group">
            <span class="w-12 h-12 overflow-hidden rounded-full flex items-center justify-center border text-xl font-bold transition ${selected ? 'border-blue-400 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/30' : 'border-zinc-700 bg-zinc-900 text-zinc-200 group-hover:border-blue-500'}">${avatar}</span>
            <span class="w-full text-[10px] text-center text-zinc-400 truncate">${escapeHtml(profile.name)}</span>
            <span class="text-[9px] ${ready ? 'text-emerald-400' : 'text-amber-400'}">${ready ? 'Hazır' : 'Anahtar gerekli'}</span>
        </button>`;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

function renderApiProfiles() {
    const container = document.getElementById('api-profiles-list');
    if (!container) return;
    if (!apiProfiles.length) {
        container.innerHTML = '<p class="text-xs text-zinc-500 py-3">Henüz kayıtlı hesap yok. API anahtarı ekleyerek başlayın.</p>';
        return;
    }
    container.innerHTML = apiProfiles.map(profile => {
        const active = profile.id === activeApiProfileId;
        const hasSessionKey = Boolean(sessionStorage.getItem('nd_api_key_' + profile.id));
        return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl border ${active ? 'border-blue-500/50 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950'}">
                <div class="min-w-0">
                    <p class="text-sm font-medium text-zinc-100 truncate">${escapeHtml(profile.name)}</p>
                    <p class="text-[10px] text-zinc-500">${active ? 'Aktif hesap' : (hasSessionKey ? 'Bu oturumda hazır' : 'Tekrar API anahtarı gerekli')}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    ${active ? '<span class="text-[10px] text-emerald-400">Aktif</span>' : `<button data-switch-api="${escapeHtml(profile.id)}" class="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px]">Geçiş</button>`}
                    <button data-remove-api="${escapeHtml(profile.id)}" class="px-2 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-[11px]" aria-label="Hesabı kaldır">Sil</button>
                </div>
            </div>`;
    }).join('');
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

async function addApiProfile() {
    const nameInput = document.getElementById('api-profile-name');
    const keyInput = document.getElementById('api-profile-key');
    const error = document.getElementById('api-profile-error');
    const name = nameInput.value.trim() || 'NextDNS hesabı ' + (apiProfiles.length + 1);
    const key = keyInput.value.trim();
    error.textContent = '';
    if (!key) { error.textContent = 'Önce API anahtarını girin.'; return; }

    const previousKey = apiKey;
    apiKey = key;
    try {
        const response = await apiFetch('/profiles');
        if (!Array.isArray(response.data) || !response.data.length) throw new Error('Bu anahtarla profil bulunamadı.');
        const id = 'api-' + Date.now().toString(36);
        apiProfiles.push({ id, name });
        sessionStorage.setItem('nd_api_key_' + id, key);
        sessionStorage.setItem('nd_api_profiles_' + id, JSON.stringify(response.data.map(p => ({ id: p.id, name: p.name || p.fingerprint || p.id }))));
        activeApiProfileId = id;
        sessionStorage.setItem('nextdns_active_profile', id);
        sessionStorage.setItem('nextdns_api_key', key);
        localStorage.setItem('nextdns_profiles', JSON.stringify(apiProfiles));
        keyInput.value = '';
        nameInput.value = '';
        closeApiProfiles();
        await checkLogin(key, { skipAccountSave: true });
    } catch (err) {
        apiKey = previousKey;
        error.textContent = 'Bağlantı kurulamadı. API anahtarını kontrol edin.';
    }
}

async function switchApiProfile(id) {
    const key = sessionStorage.getItem('nd_api_key_' + id);
    if (!key) {
        const error = document.getElementById('api-profile-error');
        error.textContent = 'Bu hesap anahtarı güvenlik nedeniyle oturum sonunda temizlendi. Yeniden ekleyin.';
        return;
    }
    activeApiProfileId = id;
    sessionStorage.setItem('nextdns_active_profile', id);
    sessionStorage.setItem('nextdns_api_key', key);
    closeApiProfiles();
    await checkLogin(key, { skipAccountSave: true });
}

function removeApiProfile(id) {
    apiProfiles = apiProfiles.filter(profile => profile.id !== id);
    sessionStorage.removeItem('nd_api_key_' + id);
    sessionStorage.removeItem('nd_api_profiles_' + id);
    sessionStorage.removeItem('nextdns_selected_profile_' + id);
    if (activeApiProfileId === id) {
        activeApiProfileId = '';
        apiKey = '';
        sessionStorage.removeItem('nextdns_active_profile');
        sessionStorage.removeItem('nextdns_api_key');
        document.getElementById('dashboard-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }
    saveApiProfiles();
}

async function loadAllProfileData(profileId) {
    // Read-only profile-ID mode performs only GET analytics requests.
    if (readOnlyStatsMode) {
        fetchOverviewStats(profileId);
        return;
    }
    fetchOverviewStats(profileId);
    fetchLogs(profileId);
    fetchLists(profileId);
    fetchParentalServices(profileId);
    fetchPrivacyAndSetup(profileId);
}

async function fetchOverviewStats(profileId) {
    try {
        const statusRes = await apiFetch(`/profiles/${profileId}/analytics/status`);
        const stats = statusRes.data || [];
        let total = 0, blocked = 0;
        stats.forEach(item => {
            total += item.queries || 0;
            if (item.status === 'blocked') blocked += item.queries || 0;
        });
        const ratio = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0;

        document.getElementById('stat-total').textContent = total.toLocaleString();
        const wifiDnsQueries = document.getElementById('wifi-dns-queries');
        if (wifiDnsQueries) wifiDnsQueries.textContent = total.toLocaleString();
        document.getElementById('stat-blocked').textContent = blocked.toLocaleString();
        document.getElementById('stat-ratio').textContent = `${ratio}%`;

        const devRes = await apiFetch(`/profiles/${profileId}/analytics/devices?from=-30d&limit=500`);
        const devContainer = document.getElementById('devices-list');
        const profileOptions = Array.from(document.getElementById('profile-select')?.options || [])
            .map(option => ({ id: option.value, name: option.textContent.split(' (')[0] }));
        const allProfiles = readOnlyStatsMode ? [{ id: profileId, name: profileId }] : profileOptions;

        // Compare device IDs across every profile in the currently connected NextDNS account.
        const devicesByProfile = await Promise.all(allProfiles.map(async profile => {
            try {
                const response = profile.id === profileId
                    ? devRes
                    : await apiFetch(`/profiles/${encodeURIComponent(profile.id)}/analytics/devices?from=-30d&limit=500`);
                return { profile, devices: response.data || [] };
            } catch (error) {
                console.warn('Profil cihazları alınamadı:', profile.id, error);
                return { profile, devices: [] };
            }
        }));

        if (devRes.data && devRes.data.length > 0) {
            const rankedDevices = [...devRes.data].sort((a, b) =>
                Number(b.queries || 0) - Number(a.queries || 0)
            );
            devContainer.innerHTML = rankedDevices.map((d, index) => {
                const matches = devicesByProfile.filter(entry => entry.devices.some(other =>
                    (d.id && other.id === d.id) ||
                    (d.name && other.name && other.name.toLowerCase() === d.name.toLowerCase() &&
                     (!d.localIp || !other.localIp || d.localIp === other.localIp))
                ));
                const uniqueProfiles = [...new Map(matches.map(entry => [entry.profile.id, entry.profile])).values()];
                const profileText = readOnlyStatsMode
                    ? 'Yalnızca açık profil kontrol edilebildi'
                    : uniqueProfiles.length > 1
                        ? 'Bu hesapta birden fazla profilde kullanılıyor: ' + uniqueProfiles.map(p => escapeHtml(p.name)).join(', ')
                        : uniqueProfiles.length === 1
                            ? (uniqueProfiles[0].id === profileId ? 'Seçili profili kullanıyor' : 'Başka profilde kullanıyor: ' + escapeHtml(uniqueProfiles[0].name))
                            : 'Diğer profillerde eşleşme bulunamadı';
                return `
                    <div class="p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg space-y-1.5">
                        <div class="flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="text-[10px] text-zinc-500 font-mono w-5">${index + 1}.</span>
                                <span class="font-medium text-zinc-200 truncate">${escapeHtml(d.name || d.id || 'Bilinmeyen Cihaz')}</span>
                            </div>
                            <span class="font-mono text-blue-400 whitespace-nowrap">${Number(d.queries || 0).toLocaleString()} sorgu</span>
                        </div>
                        <p class="text-[10px] text-zinc-400 pl-7">${profileText}</p>
                    </div>
                `;
            }).join('');
        } else {
            devContainer.innerHTML = '<p class="text-zinc-500">--</p>';
        }

        // The API exposes analytics, not NextDNS's exact deduplicated account quota counter.
        // Use current-calendar-month analytics as an estimate and label it accordingly.
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthFrom = encodeURIComponent(monthStart.toISOString());
        const monthlyResults = await Promise.all(allProfiles.map(async profile => {
            try {
                const response = await apiFetch(`/profiles/${encodeURIComponent(profile.id)}/analytics/status?from=${monthFrom}&to=now`);
                return (response.data || []).reduce((sum, item) => sum + Number(item.queries || 0), 0);
            } catch (error) {
                console.warn('Aylık sorgu verisi alınamadı:', profile.id, error);
                return null;
            }
        }));
        const monthlyCard = document.getElementById('monthly-query-card');
        const monthlyValue = document.getElementById('monthly-query-count');
        const monthlyMessage = document.getElementById('monthly-query-message');
        if (monthlyCard && monthlyValue && monthlyMessage) {
            const validMonthlyResults = monthlyResults.filter(value => value !== null);
            if (validMonthlyResults.length === allProfiles.length && validMonthlyResults.length > 0) {
                const monthlyTotal = validMonthlyResults.reduce((sum, value) => sum + value, 0);
                monthlyValue.textContent = monthlyTotal.toLocaleString('tr-TR') + ' / 300.000';
                monthlyCard.classList.remove('border-emerald-500/40', 'border-amber-500/40', 'border-red-500/50');
                monthlyValue.classList.remove('text-emerald-400', 'text-amber-400', 'text-red-400');
                if (monthlyTotal > 300000) {
                    monthlyCard.classList.add('border-red-500/50');
                    monthlyValue.classList.add('text-red-400');
                    monthlyMessage.textContent = '300.000 sınırı aşılmış olabilir. Ücretsiz planda filtreleme ve günlükler devre dışı kalır; temel DNS çözümlemesi normalde sürer.';
                    monthlyMessage.className = 'text-xs text-red-400';
                } else if (monthlyTotal >= 250000) {
                    monthlyCard.classList.add('border-amber-500/40');
                    monthlyValue.classList.add('text-amber-400');
                    monthlyMessage.textContent = '250.000 sorgu aşıldı. 300.000 aylık sınıra yaklaşıyorsun.';
                    monthlyMessage.className = 'text-xs text-amber-400';
                } else {
                    monthlyCard.classList.add('border-emerald-500/40');
                    monthlyValue.classList.add('text-emerald-400');
                    monthlyMessage.textContent = 'Kullanım 250.000 sorgunun altında.';
                    monthlyMessage.className = 'text-xs text-emerald-400';
                }
            } else {
                monthlyValue.textContent = 'Veri alınamadı';
                monthlyMessage.textContent = 'Aylık kullanım tüm profillerden okunamadı.';
                monthlyMessage.className = 'text-xs text-zinc-400';
            }
        }

        const topRes = await apiFetch(`/profiles/${profileId}/analytics/domains?status=blocked&limit=6`);
        const topContainer = document.getElementById('top-blocked-list');
        if (topRes.data && topRes.data.length > 0) {
            topContainer.innerHTML = topRes.data.map(d => `
                <div class="flex items-center justify-between p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg">
                    <span class="font-mono text-zinc-300 truncate max-w-[220px]">${d.domain || d.name}</span>
                    <span class="font-mono text-red-400">${(d.queries || 0).toLocaleString()}</span>
                </div>
            `).join('');
        } else {
            topContainer.innerHTML = '<p class="text-zinc-500">--</p>';
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchLogs(profileId) {
    const tbody = document.getElementById('logs-table-body');
    try {
        const res = await apiFetch(`/profiles/${profileId}/logs?limit=100`);
        cachedLogs = res.data || [];
        filterAndRenderLogs();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-400">Loglar yüklenemedi.</td></tr>`;
    }
}

function filterAndRenderLogs() {
    const query = document.getElementById('log-search').value.toLowerCase();
    const filter = document.getElementById('log-filter').value;
    const tbody = document.getElementById('logs-table-body');
    const t = translations[currentLang] || translations.tr;

    const filtered = cachedLogs.filter(log => {
        const domain = (log.domain || log.name || '').toLowerCase();
        const deviceName = (log.device?.name || log.client || '').toLowerCase();
        
        const matchesQuery = domain.includes(query) || deviceName.includes(query);
        const matchesFilter = filter === 'all' || log.status === filter;
        
        return matchesQuery && matchesFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-zinc-500">Eşleşen cihaz aktivitesi bulunamadı.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(log => {
        const domain = log.domain || log.name || 'Bilinmiyor';
        const deviceName = log.device?.name || log.client || 'Bilinmeyen Cihaz';
        const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--';
        const isBlocked = log.status === 'blocked';
        const reason = log.reasons && log.reasons.length > 0 ? log.reasons[0].name : '';

        const statusBadge = isBlocked
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">${t.blockedBadge} ${reason ? `(${reason})` : ''}</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${t.allowedBadge}</span>`;

        const quickAction = isBlocked
            ? `<button onclick="quickRule('allowlist', '${domain}')" class="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded text-[11px]">${t.allowBtn}</button>`
            : `<button onclick="quickRule('denylist', '${domain}')" class="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-[11px]">${t.blockBtn}</button>`;

        return `
            <tr class="hover:bg-zinc-900/50 transition">
                <td class="px-5 py-3 text-zinc-400 whitespace-nowrap">${timeStr}</td>
                <td class="px-5 py-3 font-mono text-zinc-100 font-medium">${domain}</td>
                <td class="px-5 py-3 text-zinc-200 font-medium">${deviceName}</td>
                <td class="px-5 py-3">${statusBadge}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">${log.protocol || 'DNS'}</span></td>
                <td class="px-5 py-3 text-right">${quickAction}</td>
            </tr>
        `;
    }).join('');
    setTimeout(initTvNavigation, 100);
}

async function fetchLists(profileId) {
    try {
        const [denyRes, allowRes] = await Promise.all([
            apiFetch(`/profiles/${profileId}/denylist`),
            apiFetch(`/profiles/${profileId}/allowlist`)
        ]);
        renderRuleList('denylist', denyRes.data || []);
        renderRuleList('allowlist', allowRes.data || []);
    } catch (err) { console.error(err); }
}

function renderRuleList(type, items) {
    const container = document.getElementById(`${type}-items`);
    if (items.length === 0) {
        container.innerHTML = `<p class="text-zinc-500 py-2">--</p>`;
        return;
    }
    container.innerHTML = items.map(item => `
        <div class="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-lg">
            <span class="font-mono text-zinc-200">${item.id}</span>
            <button onclick="removeDomainRule('${type}', '${item.id}')" class="text-zinc-500 hover:text-red-400 transition">Sil</button>
        </div>
    `).join('');
    setTimeout(initTvNavigation, 100);
}

async function addDomainRule(type) {
    const input = document.getElementById(type === 'denylist' ? 'deny-input' : 'allow-input');
    const domain = input.value.trim();
    if (!domain) return;
    await quickRule(type, domain);
    input.value = '';
}

async function quickRule(type, domain) {
    try {
        await apiFetch(`/profiles/${currentProfileId}/${type}`, {
            method: 'POST',
            body: JSON.stringify({ id: domain, active: true })
        });
        fetchLists(currentProfileId);
    } catch (err) { alert('Error'); }
}

async function removeDomainRule(type, domain) {
    try {
        await apiFetch(`/profiles/${currentProfileId}/${type}/${domain}`, { method: 'DELETE' });
        fetchLists(currentProfileId);
    } catch (err) { alert('Error'); }
}

async function fetchParentalServices(profileId) {
    const grid = document.getElementById('parental-services-grid');
    const t = translations[currentLang] || translations.tr;
    try {
        const res = await apiFetch(`/profiles/${profileId}/parentalControl`);
        const activeServices = (res.data?.services || []).map(s => s.id);

        grid.innerHTML = POPULAR_SERVICES.map(srv => {
            const isBlocked = activeServices.includes(srv.id);
            return `
                <div class="flex items-center justify-between p-3.5 bg-zinc-950 border ${isBlocked ? 'border-red-500/40 bg-red-500/5' : 'border-zinc-800'} rounded-xl">
                    <span class="text-xs font-medium ${isBlocked ? 'text-red-300' : 'text-zinc-200'}">${srv.name}</span>
                    <button onclick="toggleService('${srv.id}', ${isBlocked})" class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${isBlocked ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}">
                        ${isBlocked ? t.blocked : t.open}
                    </button>
                </div>
            `;
        }).join('');
        setTimeout(initTvNavigation, 100);
    } catch (err) { grid.innerHTML = '<p class="text-xs text-zinc-500">--</p>'; }
}

async function toggleService(serviceId, currentlyBlocked) {
    try {
        if (currentlyBlocked) {
            await apiFetch(`/profiles/${currentProfileId}/parentalControl/services/${serviceId}`, { method: 'DELETE' });
        } else {
            await apiFetch(`/profiles/${currentProfileId}/parentalControl/services`, {
                method: 'POST',
                body: JSON.stringify({ id: serviceId, active: true })
            });
        }
        fetchParentalServices(currentProfileId);
    } catch (err) { alert('Error'); }
}

async function fetchPrivacyAndSetup(profileId) {
    try {
        const profileRes = await apiFetch(`/profiles/${profileId}`);
        const p = profileRes.data || {};
        const t = translations[currentLang] || translations.tr;

        const blocklists = p.privacy?.blocklists || [];
        const privContainer = document.getElementById('privacy-lists');
        privContainer.innerHTML = blocklists.length > 0 ? blocklists.map(b => `
            <div class="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span class="font-mono text-zinc-200">${b.id}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${t.active}</span>
            </div>
        `).join('') : '<p class="text-zinc-500">--</p>';

        document.getElementById('setup-doh').textContent = `https://dns.nextdns.io/${profileId}`;
        document.getElementById('setup-dot').textContent = `${profileId}.dns.nextdns.io`;
        document.getElementById('setup-ipv6').innerHTML = (p.setup?.ipv6 || ['2a07:a8c0::']).map(ip => `<div>${ip}</div>`).join('');
        document.getElementById('setup-linked-ip').textContent = `IPv4: ${p.setup?.linkedIp?.ip || 'N/A'}`;
        document.getElementById('setup-tv-adb').textContent = `${profileId}.dns.nextdns.io`;
    } catch (err) { console.error(err); }
}

function showError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
}

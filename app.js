const PROXY_URL = 'https://nextdns-proxy.batuhan-gulsen15.workers.dev';

let apiKey = localStorage.getItem('nextdns_api_key') || '';
let currentProfileId = '';
let cachedLogs = [];

// Engellenebilir Popüler Servisler (GAMAF & Sosyal Medya)
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

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    if (apiKey) {
        document.getElementById('api-key-input').value = apiKey;
        checkLogin(apiKey);
    }

    // Giriş / Çıkış
    document.getElementById('login-btn').addEventListener('click', () => {
        const key = document.getElementById('api-key-input').value.trim();
        if (!key) return showError('Lütfen geçerli bir API anahtarı girin.');
        checkLogin(key);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('nextdns_api_key');
        apiKey = '';
        document.getElementById('dashboard-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    });

    // Profil ve Yenileme
    document.getElementById('profile-select').addEventListener('change', (e) => {
        currentProfileId = e.target.value;
        loadAllProfileData(currentProfileId);
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
        if (currentProfileId) loadAllProfileData(currentProfileId);
    });

    // Sekme Geçişleri
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
        });
    });

    // Log Filtreleme & Arama
    document.getElementById('log-search').addEventListener('input', filterAndRenderLogs);
    document.getElementById('log-filter').addEventListener('change', filterAndRenderLogs);
    document.getElementById('reload-logs-btn').addEventListener('click', () => fetchLogs(currentProfileId));
});

async function apiFetch(endpoint, options = {}) {
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

async function checkLogin(key) {
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');
    apiKey = key;

    try {
        const data = await apiFetch('/profiles');
        if (!data.data || data.data.length === 0) throw new Error('Profil bulunamadı.');

        localStorage.setItem('nextdns_api_key', apiKey);
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

        currentProfileId = data.data[0].id;
        loadAllProfileData(currentProfileId);
    } catch (err) {
        errorEl.textContent = 'Giriş başarısız: API anahtarını kontrol edin.';
        errorEl.classList.remove('hidden');
    }
}

async function loadAllProfileData(profileId) {
    fetchOverviewStats(profileId);
    fetchLogs(profileId);
    fetchLists(profileId);
    fetchParentalServices(profileId);
    fetchPrivacyAndSetup(profileId);
}

// 1. GENEL BAKIŞ & CİHAZLAR
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
        document.getElementById('stat-blocked').textContent = blocked.toLocaleString();
        document.getElementById('stat-ratio').textContent = `${ratio}%`;

        // Cihazlar (Devices)
        const devRes = await apiFetch(`/profiles/${profileId}/analytics/devices`);
        const devContainer = document.getElementById('devices-list');
        if (devRes.data && devRes.data.length > 0) {
            devContainer.innerHTML = devRes.data.map(d => `
                <div class="flex items-center justify-between p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg">
                    <span class="font-medium text-zinc-200">${d.name || d.id || 'Bilinmeyen Cihaz'}</span>
                    <span class="font-mono text-blue-400">${(d.queries || 0).toLocaleString()} sorgu</span>
                </div>
            `).join('');
        } else {
            devContainer.innerHTML = '<p class="text-zinc-500">Kayıtlı cihaz verisi bulunamadı.</p>';
        }

        // En çok engellenenler
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
            topContainer.innerHTML = '<p class="text-zinc-500">Henüz engellenen alan adı yok.</p>';
        }
    } catch (err) {
        console.error('İstatistik hatası:', err);
    }
}

// 2. CANLI SORGULAR (LOGS)
async function fetchLogs(profileId) {
    const tbody = document.getElementById('logs-table-body');
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-zinc-500">Canlı veriler çekiliyor...</td></tr>`;
    try {
        const res = await apiFetch(`/profiles/${profileId}/logs?limit=50`);
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

    const filtered = cachedLogs.filter(log => {
        const domain = (log.domain || log.name || '').toLowerCase();
        const device = (log.device?.name || log.client || '').toLowerCase();
        const matchesSearch = domain.includes(query) || device.includes(query);
        const matchesStatus = filter === 'all' || log.status === filter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-zinc-500">Eşleşen kayıt bulunamadı.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(log => {
        const domain = log.domain || log.name || 'Bilinmiyor';
        const deviceName = log.device?.name || log.clientIp || log.client || 'Tanımsız Aygıt';
        const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString('tr-TR') : '--:--';
        const isBlocked = log.status === 'blocked';
        const reason = log.reasons && log.reasons.length > 0 ? log.reasons[0].name : '';

        const statusBadge = isBlocked
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">Engellendi ${reason ? `(${reason})` : ''}</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">İzin Verildi</span>`;

        const quickAction = isBlocked
            ? `<button onclick="quickRule('allowlist', '${domain}')" class="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded text-[11px]">İzin Ver</button>`
            : `<button onclick="quickRule('denylist', '${domain}')" class="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-[11px]">Engelle</button>`;

        return `
            <tr class="hover:bg-zinc-900/50 transition">
                <td class="px-5 py-3 text-zinc-400 whitespace-nowrap">${timeStr}</td>
                <td class="px-5 py-3 font-mono text-zinc-100 font-medium">${domain}</td>
                <td class="px-5 py-3 text-zinc-400">${deviceName}</td>
                <td class="px-5 py-3">${statusBadge}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">${log.protocol || 'DNS'}</span></td>
                <td class="px-5 py-3 text-right">${quickAction}</td>
            </tr>
        `;
    }).join('');
}

// 3. KARA LİSTE & BEYAZ LİSTE
async function fetchLists(profileId) {
    try {
        const [denyRes, allowRes] = await Promise.all([
            apiFetch(`/profiles/${profileId}/denylist`),
            apiFetch(`/profiles/${profileId}/allowlist`)
        ]);

        renderRuleList('denylist', denyRes.data || []);
        renderRuleList('allowlist', allowRes.data || []);
    } catch (err) {
        console.error('Liste yükleme hatası:', err);
    }
}

function renderRuleList(type, items) {
    const container = document.getElementById(`${type}-items`);
    if (items.length === 0) {
        container.innerHTML = `<p class="text-zinc-500 py-4 text-center">Liste şu an boş.</p>`;
        return;
    }
    container.innerHTML = items.map(item => `
        <div class="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-lg">
            <span class="font-mono text-zinc-200">${item.id}</span>
            <button onclick="removeDomainRule('${type}', '${item.id}')" class="text-zinc-500 hover:text-red-400 transition">Sil</button>
        </div>
    `).join('');
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
        alert(`${domain} başarıyla ${type === 'denylist' ? 'Kara Listeye' : 'Beyaz Listeye'} eklendi!`);
    } catch (err) {
        alert('İşlem başarısız oldu.');
    }
}

async function removeDomainRule(type, domain) {
    try {
        await apiFetch(`/profiles/${currentProfileId}/${type}/${domain}`, { method: 'DELETE' });
        fetchLists(currentProfileId);
    } catch (err) {
        alert('Silme işlemi başarısız.');
    }
}

// 4. EBEVEYN KONTROLÜ (GAMAF / SERVİSLER)
async function fetchParentalServices(profileId) {
    const grid = document.getElementById('parental-services-grid');
    try {
        const res = await apiFetch(`/profiles/${profileId}/parentalControl`);
        const activeServices = (res.data?.services || []).map(s => s.id);

        grid.innerHTML = POPULAR_SERVICES.map(srv => {
            const isBlocked = activeServices.includes(srv.id);
            return `
                <div class="flex items-center justify-between p-3.5 bg-zinc-950 border ${isBlocked ? 'border-red-500/40 bg-red-500/5' : 'border-zinc-800'} rounded-xl">
                    <span class="text-xs font-medium ${isBlocked ? 'text-red-300' : 'text-zinc-200'}">${srv.name}</span>
                    <button onclick="toggleService('${srv.id}', ${isBlocked})" class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${isBlocked ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}">
                        ${isBlocked ? 'Engelli' : 'Açık'}
                    </button>
                </div>
            `;
        }).join('');
    } catch (err) {
        grid.innerHTML = '<p class="text-xs text-zinc-500">Ebeveyn kontrolü verileri alınamadı.</p>';
    }
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
    } catch (err) {
        alert('Servis durumu güncellenemedi.');
    }
}

// 5. GİZLİLİK & KURULUM (SETUP)
async function fetchPrivacyAndSetup(profileId) {
    try {
        const profileRes = await apiFetch(`/profiles/${profileId}`);
        const p = profileRes.data || {};

        // Gizlilik Listeleri
        const blocklists = p.privacy?.blocklists || [];
        const privContainer = document.getElementById('privacy-lists');
        if (blocklists.length > 0) {
            privContainer.innerHTML = blocklists.map(b => `
                <div class="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span class="font-mono text-zinc-200">${b.id}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aktif</span>
                </div>
            `).join('');
        } else {
            privContainer.innerHTML = '<p class="text-zinc-500">Aktif gizlilik listesi bulunamadı.</p>';
        }

        // Kurulum (Setup) Bilgileri
        document.getElementById('setup-doh').textContent = `https://dns.nextdns.io/${profileId}`;
        document.getElementById('setup-dot').textContent = `${profileId}.dns.nextdns.io`;
        
        const ipv6 = p.setup?.ipv6 || ['2a07:a8c0::', '2a07:a8c1::'];
        document.getElementById('setup-ipv6').innerHTML = ipv6.map(ip => `<div>${ip}</div>`).join('');

        const linkedIp = p.setup?.linkedIp?.ip || 'Tanımlanmamış';
        document.getElementById('setup-linked-ip').textContent = `Kayıtlı IPv4: ${linkedIp}`;
    } catch (err) {
        console.error('Kurulum bilgisi hatası:', err);
    }
}

function showError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
}

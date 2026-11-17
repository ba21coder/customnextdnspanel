// Cloudflare Worker adresin (Hazır ekli durumda)
const PROXY_URL = 'https://nextdns-proxy.batuhan-gulsen15.workers.dev';

let apiKey = localStorage.getItem('nextdns_api_key') || '';
let currentProfileId = '';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    if (apiKey) {
        document.getElementById('api-key-input').value = apiKey;
        checkLogin(apiKey);
    }

    // Giriş Butonu
    document.getElementById('login-btn').addEventListener('click', () => {
        const inputKey = document.getElementById('api-key-input').value.trim();
        if (!inputKey) {
            showError('Lütfen geçerli bir API anahtarı girin.');
            return;
        }
        checkLogin(inputKey);
    });

    // Çıkış Butonu
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('nextdns_api_key');
        apiKey = '';
        document.getElementById('dashboard-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    });

    // Profil Değişimi
    document.getElementById('profile-select').addEventListener('change', (e) => {
        currentProfileId = e.target.value;
        loadProfileData(currentProfileId);
    });

    // Yenile Butonu
    document.getElementById('refresh-btn').addEventListener('click', () => {
        if (currentProfileId) loadProfileData(currentProfileId);
    });
});

async function checkLogin(key) {
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');

    try {
        const res = await fetch(`${PROXY_URL}/profiles`, {
            headers: { 'X-Api-Key': key }
        });

        if (!res.ok) throw new Error('API anahtarı geçersiz veya yetkisiz.');

        const data = await res.json();
        if (!data.data || data.data.length === 0) throw new Error('Bu hesapta kayıtlı profil bulunamadı.');

        apiKey = key;
        localStorage.setItem('nextdns_api_key', apiKey);

        // Giriş başarılı, ekranı değiştir
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');

        populateProfiles(data.data);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    }
}

function populateProfiles(profiles) {
    const select = document.getElementById('profile-select');
    select.innerHTML = '';
    profiles.forEach(profile => {
        const opt = document.createElement('option');
        opt.value = profile.id;
        opt.textContent = `${profile.fingerprint || profile.id} (${profile.id})`;
        select.appendChild(opt);
    });

    currentProfileId = profiles[0].id;
    loadProfileData(currentProfileId);
}

async function loadProfileData(profileId) {
    document.getElementById('stat-total').textContent = 'Yükleniyor...';
    document.getElementById('stat-blocked').textContent = 'Yükleniyor...';
    document.getElementById('stat-ratio').textContent = '--%';

    try {
        // Analitik verilerini çekiyoruz
        const res = await fetch(`${PROXY_URL}/profiles/${profileId}/analytics/status`, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (res.ok) {
            const json = await res.json();
            const stats = json.data;
            if (stats) {
                const total = stats.queries || 0;
                const blocked = stats.blocked || 0;
                const ratio = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0;

                document.getElementById('stat-total').textContent = total.toLocaleString();
                document.getElementById('stat-blocked').textContent = blocked.toLocaleString();
                document.getElementById('stat-ratio').textContent = `${ratio}%`;
            }
        } else {
            document.getElementById('stat-total').textContent = 'Hata';
            document.getElementById('stat-blocked').textContent = 'Hata';
        }

        // Canlı sorguları (Logs) çekiyoruz
        const logsRes = await fetch(`${PROXY_URL}/profiles/${profileId}/logs?limit=10`, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (logsRes.ok) {
            const logsJson = await logsRes.json();
            renderLogs(logsJson.data);
        }
    } catch (err) {
        console.error('Veri çekme hatası:', err);
    }
}

function renderLogs(logs) {
    const tbody = document.getElementById('logs-table-body');
    tbody.innerHTML = '';

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-zinc-500 text-xs">Henüz sorgu kaydı yok.</td></tr>`;
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-zinc-900/40 transition';

        const isBlocked = log.status === 'blocked';
        const statusBadge = isBlocked 
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Engellendi</span>`
            : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">İzin Verildi</span>`;

        tr.innerHTML = `
            <td class="px-6 py-4 font-mono text-xs text-zinc-200">${log.name || 'Bilinmiyor'}</td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="toggleDomain('${log.name}')" class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium transition text-zinc-300">
                    Kural Ekle
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleDomain(domain) {
    alert(`${domain} alan adı için hızlı kural ekleme özelliği sonraki adımda aktif olacak!`);
}

function showError(msg) {
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
}

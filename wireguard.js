/* WireGuard config importer — local-only; no config or private key is uploaded or persisted. */
(() => {
  'use strict';
  const devices = [];
  const $ = (id) => document.getElementById(id);
  const message = (text, error = false) => {
    const el = $('wg-message');
    if (!el) return;
    el.textContent = text;
    el.className = error ? 'text-xs text-red-400' : 'text-xs text-zinc-400';
  };
  const parseConfig = (source) => {
    const text = String(source || '').replace(/^\uFEFF/, '');
    const interfaceMatch = text.match(/^\s*\[Interface\]\s*$([\s\S]*?)(?=^\s*\[|\s*$)/im);
    const peerMatch = text.match(/^\s*\[Peer\]\s*$([\s\S]*?)(?=^\s*\[|\s*$)/im);
    const get = (block, key) => {
      const match = block && block.match(new RegExp('^\\s*' + key + '\\s*=\\s*(.+?)\\s*$', 'im'));
      return match ? match[1].trim() : '';
    };
    if (!interfaceMatch || !peerMatch) throw new Error('Dosyada [Interface] ve [Peer] bölümleri bulunamadı.');
    const privateKey = get(interfaceMatch[1], 'PrivateKey');
    const address = get(interfaceMatch[1], 'Address');
    const publicKey = get(peerMatch[1], 'PublicKey');
    const endpoint = get(peerMatch[1], 'Endpoint');
    if (!privateKey || !address || !publicKey || !endpoint) {
      throw new Error('Gerekli alanlar eksik: PrivateKey, Address, PublicKey veya Endpoint.');
    }
    return { address, endpoint, source: text };
  };
  const render = () => {
    const list = $('wg-device-list');
    const count = $('wg-device-count');
    if (!list || !count) return;
    count.textContent = devices.length + ' cihaz';
    if (!devices.length) {
      list.textContent = 'Henüz yapılandırma eklenmedi.';
      return;
    }
    list.innerHTML = devices.map((device, index) => {
      const safeName = device.name.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const safeAddress = device.address.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const safeEndpoint = device.endpoint.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      return '<article class="wg-device-card"><div class="wg-device-meta"><strong>' + safeName + '</strong><span>Adres: ' + safeAddress + '</span><span>Sunucu: ' + safeEndpoint + '</span><span>Yapılandırma hazır · VPN durumu uygulamadan kontrol edilir</span></div><div class="wg-device-actions"><button type="button" data-wg-download="' + index + '">.conf dosyasını indir</button><button type="button" data-wg-remove="' + index + '">Kaldır</button></div></article>';
    }).join('');
  };
  const downloadConfig = (device) => {
    const blob = new Blob([device.source], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = device.name.replace(/[^a-z0-9_-]/gi, '_').slice(0, 32) + '.conf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  document.addEventListener('DOMContentLoaded', () => {
    const importButton = $('wg-import-btn');
    if (!importButton) return;
    importButton.addEventListener('click', async () => {
      const file = $('wg-config-file').files[0];
      const name = $('wg-device-name').value.trim();
      if (!name) return message('Önce cihaz için bir ad yaz.', true);
      if (!file) return message('Önce bir .conf dosyası seç.', true);
      if (file.size > 128 * 1024) return message('Dosya çok büyük. 128 KB sınırındaki bir yapılandırma dosyası seç.', true);
      try {
        const parsed = parseConfig(await file.text());
        devices.push({ name, ...parsed });
        $('wg-device-name').value = '';
        $('wg-config-file').value = '';
        message('Yapılandırma bu sekmeye eklendi. Şimdi .conf dosyasını indirip WireGuard uygulamasına içe aktar.');
        render();
      } catch (error) {
        message(error.message || 'Yapılandırma okunamadı.', true);
      }
    });
    $('wg-device-list').addEventListener('click', (event) => {
      const download = event.target.closest('[data-wg-download]');
      const remove = event.target.closest('[data-wg-remove]');
      if (download) {
        const device = devices[Number(download.dataset.wgDownload)];
        if (device) downloadConfig(device);
      }
      if (remove) {
        devices.splice(Number(remove.dataset.wgRemove), 1);
        render();
        message('Cihaz yapılandırması bu sekmeden kaldırıldı.');
      }
    });
    render();
  });
})();

/* NextDNS PRO preferences workspace */
(() => {
  const groups=[["İstatistik Görünümü",["Toplam sorgu kartı","Engellenen sorgu kartı","Engelleme oranı kartı","Cihaz özeti","En çok engellenen alan adları","Günlük sorgu özeti","Engelleme eğilimi görünümü","Cihaz başına sorgu özeti","Alan adı yoğunluğu özeti","İstatistik kartlarını sabitle"]],["Trafik ve Loglar",["Canlı trafik tablosu","Engellenen trafik filtresi","İzin verilen trafik filtresi","Alan adına göre arama kısayolu","Cihaza göre arama kısayolu","Protokol görünümü","Saat bilgisi görünümü","Neden bilgisi görünümü","Log tablosu yoğun görünüm","Log arama geçmişi"]],["Alan Adı Araçları",["Alan adı kopyalama aracı","Alan adı biçim kontrolü","Alt alan adı notları","Kişisel alan adı listesi","Favori alan adları","Alan adı etiketleri","Alan adı açıklama notları","Alan adı karşılaştırma listesi","Alan adı arama şablonları","Alan adı dışa aktarma"]],["Profil ve Bağlantı",["Profil kimliği kopyalama","DoH adresi kopyalama","DoT adresi kopyalama","IPv6 adreslerini göster","Linked IP bilgisini göster","Profil bağlantı notları","Cihaz kurulum kontrol listesi","Kurulum komutu kopyalama","Profil hızlı yenileme","Profil bilgisi dışa aktarma"]],["Gizlilik Tercihleri",["Ekranda alan adlarını maskele","Cihaz adlarını maskele","Gizlilik görünümü","Yerel notları temizleme kısayolu","Oturum bilgisi uyarısı","Gizli metinleri seçilebilir yapma","Paylaşım öncesi veri uyarısı","Kişisel etiketleri gizle","Hassas alanları daralt","Gizlilik kontrol özeti"]],["Arayüz ve Erişilebilirlik",["Kompakt arayüz","Büyük yazı","Yüksek kontrast","Hareketleri azalt","Kartları tek sütun göster","Daha geniş içerik alanı","Klavye kısayolları","Odak çerçevesi","Arayüz yoğunluğu tercihi","Arayüz tercihlerini hatırla"]],["Bildirim ve İzleme",["Yüksek engelleme oranı uyarısı","Çok sorgu uyarısı","Boş log uyarısı","Bağlantı durumu göstergesi","Yenileme hatası uyarısı","Yerel hatırlatıcılar","İstatistik yenileme hatırlatıcısı","Günlük kontrol işareti","Bildirim tercihlerini sakla","Uyarı geçmişi"]],["Yerel Çalışma Alanı",["Kişisel not defteri","Hızlı not ekleme","Notları dışa aktarma","Notları içe aktarma","Favori paneller","Özel panel sıralaması","Kişisel etiket defteri","Görev kontrol listesi","Son kullanılan araçlar","Çalışma alanı yedeği"]],["Veri ve Dışa Aktarma",["İstatistikleri JSON dışa aktar","Görünen logları CSV dışa aktar","Görünen logları JSON dışa aktar","Profil kurulum bilgisi dışa aktar","Tercihleri JSON dışa aktar","Tercihleri içe aktar","Yerel ayar yedeği","Yedekten geri yükleme","Dışa aktarma geçmişi","Veri temizleme aracı"]],["Gelişmiş Kontroller",["Otomatik yenileme tercihi","Yenileme aralığı tercihi","Başlangıç paneli tercihi","Son açık sekmeyi hatırla","Arama filtrelerini hatırla","Tablo sıralama tercihi","Kart görünürlüğü tercihi","Hızlı işlem onayı","Geliştirici bilgi paneli","Özellik merkezi arama"]]];
  const features=[{"id":"f1","group":"İstatistik Görünümü","name":"Toplam sorgu kartı"},{"id":"f2","group":"İstatistik Görünümü","name":"Engellenen sorgu kartı"},{"id":"f3","group":"İstatistik Görünümü","name":"Engelleme oranı kartı"},{"id":"f4","group":"İstatistik Görünümü","name":"Cihaz özeti"},{"id":"f5","group":"İstatistik Görünümü","name":"En çok engellenen alan adları"},{"id":"f6","group":"İstatistik Görünümü","name":"Günlük sorgu özeti"},{"id":"f7","group":"İstatistik Görünümü","name":"Engelleme eğilimi görünümü"},{"id":"f8","group":"İstatistik Görünümü","name":"Cihaz başına sorgu özeti"},{"id":"f9","group":"İstatistik Görünümü","name":"Alan adı yoğunluğu özeti"},{"id":"f10","group":"İstatistik Görünümü","name":"İstatistik kartlarını sabitle"},{"id":"f11","group":"Trafik ve Loglar","name":"Canlı trafik tablosu"},{"id":"f12","group":"Trafik ve Loglar","name":"Engellenen trafik filtresi"},{"id":"f13","group":"Trafik ve Loglar","name":"İzin verilen trafik filtresi"},{"id":"f14","group":"Trafik ve Loglar","name":"Alan adına göre arama kısayolu"},{"id":"f15","group":"Trafik ve Loglar","name":"Cihaza göre arama kısayolu"},{"id":"f16","group":"Trafik ve Loglar","name":"Protokol görünümü"},{"id":"f17","group":"Trafik ve Loglar","name":"Saat bilgisi görünümü"},{"id":"f18","group":"Trafik ve Loglar","name":"Neden bilgisi görünümü"},{"id":"f19","group":"Trafik ve Loglar","name":"Log tablosu yoğun görünüm"},{"id":"f20","group":"Trafik ve Loglar","name":"Log arama geçmişi"},{"id":"f21","group":"Alan Adı Araçları","name":"Alan adı kopyalama aracı"},{"id":"f22","group":"Alan Adı Araçları","name":"Alan adı biçim kontrolü"},{"id":"f23","group":"Alan Adı Araçları","name":"Alt alan adı notları"},{"id":"f24","group":"Alan Adı Araçları","name":"Kişisel alan adı listesi"},{"id":"f25","group":"Alan Adı Araçları","name":"Favori alan adları"},{"id":"f26","group":"Alan Adı Araçları","name":"Alan adı etiketleri"},{"id":"f27","group":"Alan Adı Araçları","name":"Alan adı açıklama notları"},{"id":"f28","group":"Alan Adı Araçları","name":"Alan adı karşılaştırma listesi"},{"id":"f29","group":"Alan Adı Araçları","name":"Alan adı arama şablonları"},{"id":"f30","group":"Alan Adı Araçları","name":"Alan adı dışa aktarma"},{"id":"f31","group":"Profil ve Bağlantı","name":"Profil kimliği kopyalama"},{"id":"f32","group":"Profil ve Bağlantı","name":"DoH adresi kopyalama"},{"id":"f33","group":"Profil ve Bağlantı","name":"DoT adresi kopyalama"},{"id":"f34","group":"Profil ve Bağlantı","name":"IPv6 adreslerini göster"},{"id":"f35","group":"Profil ve Bağlantı","name":"Linked IP bilgisini göster"},{"id":"f36","group":"Profil ve Bağlantı","name":"Profil bağlantı notları"},{"id":"f37","group":"Profil ve Bağlantı","name":"Cihaz kurulum kontrol listesi"},{"id":"f38","group":"Profil ve Bağlantı","name":"Kurulum komutu kopyalama"},{"id":"f39","group":"Profil ve Bağlantı","name":"Profil hızlı yenileme"},{"id":"f40","group":"Profil ve Bağlantı","name":"Profil bilgisi dışa aktarma"},{"id":"f41","group":"Gizlilik Tercihleri","name":"Ekranda alan adlarını maskele"},{"id":"f42","group":"Gizlilik Tercihleri","name":"Cihaz adlarını maskele"},{"id":"f43","group":"Gizlilik Tercihleri","name":"Gizlilik görünümü"},{"id":"f44","group":"Gizlilik Tercihleri","name":"Yerel notları temizleme kısayolu"},{"id":"f45","group":"Gizlilik Tercihleri","name":"Oturum bilgisi uyarısı"},{"id":"f46","group":"Gizlilik Tercihleri","name":"Gizli metinleri seçilebilir yapma"},{"id":"f47","group":"Gizlilik Tercihleri","name":"Paylaşım öncesi veri uyarısı"},{"id":"f48","group":"Gizlilik Tercihleri","name":"Kişisel etiketleri gizle"},{"id":"f49","group":"Gizlilik Tercihleri","name":"Hassas alanları daralt"},{"id":"f50","group":"Gizlilik Tercihleri","name":"Gizlilik kontrol özeti"},{"id":"f51","group":"Arayüz ve Erişilebilirlik","name":"Kompakt arayüz"},{"id":"f52","group":"Arayüz ve Erişilebilirlik","name":"Büyük yazı"},{"id":"f53","group":"Arayüz ve Erişilebilirlik","name":"Yüksek kontrast"},{"id":"f54","group":"Arayüz ve Erişilebilirlik","name":"Hareketleri azalt"},{"id":"f55","group":"Arayüz ve Erişilebilirlik","name":"Kartları tek sütun göster"},{"id":"f56","group":"Arayüz ve Erişilebilirlik","name":"Daha geniş içerik alanı"},{"id":"f57","group":"Arayüz ve Erişilebilirlik","name":"Klavye kısayolları"},{"id":"f58","group":"Arayüz ve Erişilebilirlik","name":"Odak çerçevesi"},{"id":"f59","group":"Arayüz ve Erişilebilirlik","name":"Arayüz yoğunluğu tercihi"},{"id":"f60","group":"Arayüz ve Erişilebilirlik","name":"Arayüz tercihlerini hatırla"},{"id":"f61","group":"Bildirim ve İzleme","name":"Yüksek engelleme oranı uyarısı"},{"id":"f62","group":"Bildirim ve İzleme","name":"Çok sorgu uyarısı"},{"id":"f63","group":"Bildirim ve İzleme","name":"Boş log uyarısı"},{"id":"f64","group":"Bildirim ve İzleme","name":"Bağlantı durumu göstergesi"},{"id":"f65","group":"Bildirim ve İzleme","name":"Yenileme hatası uyarısı"},{"id":"f66","group":"Bildirim ve İzleme","name":"Yerel hatırlatıcılar"},{"id":"f67","group":"Bildirim ve İzleme","name":"İstatistik yenileme hatırlatıcısı"},{"id":"f68","group":"Bildirim ve İzleme","name":"Günlük kontrol işareti"},{"id":"f69","group":"Bildirim ve İzleme","name":"Bildirim tercihlerini sakla"},{"id":"f70","group":"Bildirim ve İzleme","name":"Uyarı geçmişi"},{"id":"f71","group":"Yerel Çalışma Alanı","name":"Kişisel not defteri"},{"id":"f72","group":"Yerel Çalışma Alanı","name":"Hızlı not ekleme"},{"id":"f73","group":"Yerel Çalışma Alanı","name":"Notları dışa aktarma"},{"id":"f74","group":"Yerel Çalışma Alanı","name":"Notları içe aktarma"},{"id":"f75","group":"Yerel Çalışma Alanı","name":"Favori paneller"},{"id":"f76","group":"Yerel Çalışma Alanı","name":"Özel panel sıralaması"},{"id":"f77","group":"Yerel Çalışma Alanı","name":"Kişisel etiket defteri"},{"id":"f78","group":"Yerel Çalışma Alanı","name":"Görev kontrol listesi"},{"id":"f79","group":"Yerel Çalışma Alanı","name":"Son kullanılan araçlar"},{"id":"f80","group":"Yerel Çalışma Alanı","name":"Çalışma alanı yedeği"},{"id":"f81","group":"Veri ve Dışa Aktarma","name":"İstatistikleri JSON dışa aktar"},{"id":"f82","group":"Veri ve Dışa Aktarma","name":"Görünen logları CSV dışa aktar"},{"id":"f83","group":"Veri ve Dışa Aktarma","name":"Görünen logları JSON dışa aktar"},{"id":"f84","group":"Veri ve Dışa Aktarma","name":"Profil kurulum bilgisi dışa aktar"},{"id":"f85","group":"Veri ve Dışa Aktarma","name":"Tercihleri JSON dışa aktar"},{"id":"f86","group":"Veri ve Dışa Aktarma","name":"Tercihleri içe aktar"},{"id":"f87","group":"Veri ve Dışa Aktarma","name":"Yerel ayar yedeği"},{"id":"f88","group":"Veri ve Dışa Aktarma","name":"Yedekten geri yükleme"},{"id":"f89","group":"Veri ve Dışa Aktarma","name":"Dışa aktarma geçmişi"},{"id":"f90","group":"Veri ve Dışa Aktarma","name":"Veri temizleme aracı"},{"id":"f91","group":"Gelişmiş Kontroller","name":"Otomatik yenileme tercihi"},{"id":"f92","group":"Gelişmiş Kontroller","name":"Yenileme aralığı tercihi"},{"id":"f93","group":"Gelişmiş Kontroller","name":"Başlangıç paneli tercihi"},{"id":"f94","group":"Gelişmiş Kontroller","name":"Son açık sekmeyi hatırla"},{"id":"f95","group":"Gelişmiş Kontroller","name":"Arama filtrelerini hatırla"},{"id":"f96","group":"Gelişmiş Kontroller","name":"Tablo sıralama tercihi"},{"id":"f97","group":"Gelişmiş Kontroller","name":"Kart görünürlüğü tercihi"},{"id":"f98","group":"Gelişmiş Kontroller","name":"Hızlı işlem onayı"},{"id":"f99","group":"Gelişmiş Kontroller","name":"Geliştirici bilgi paneli"},{"id":"f100","group":"Gelişmiş Kontroller","name":"Özellik merkezi arama"}];
  const STORE='nextdns_pro_feature_flags_v1';
  let flags={}; try { flags=JSON.parse(localStorage.getItem(STORE)||'{}'); } catch {}
  const save=()=>localStorage.setItem(STORE,JSON.stringify(flags));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const download=(name,data,type='application/json')=>{
    const url=URL.createObjectURL(new Blob([data],{type}));
    const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  };
  function init(){
    const nav=document.getElementById('nav-tabs'),main=document.querySelector('#dashboard-screen main');
    if(!nav||!main||document.getElementById('tab-pro-features'))return;
    const tab=document.createElement('button');
    tab.className='tab-btn';tab.dataset.tab='pro-features';
    tab.innerHTML='<i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i><span>Tercihler</span>';
    nav.appendChild(tab);
    const panel=document.createElement('section');
    panel.id='tab-pro-features';panel.className='tab-content hidden';
    panel.innerHTML=`
      <div class="prefs-heading">
        <div class="prefs-heading-copy">
          <div class="prefs-kicker"><span class="prefs-kicker-dot"></span> ÇALIŞMA ALANI <span class="prefs-kicker-sep">/</span> KİŞİSELLEŞTİRME</div>
          <h1>Panel tercihleri</h1>
          <p>Görünümünü ve çalışma alanını kendi kullanımına göre düzenle.</p>
        </div>
        <div class="prefs-summary"><span class="prefs-summary-label">Seçili tercihler</span><strong id="prefs-active-count">0 <small>/ 100</small></strong><span class="prefs-summary-foot">Bu tarayıcıda saklanır</span></div>
      </div>
      <div class="prefs-toolbar">
        <label class="prefs-search"><i data-lucide="search"></i><input id="prefs-search" type="search" placeholder="Tercihlerde ara..." autocomplete="off"><kbd>⌘ K</kbd></label>
        <div class="prefs-toolbar-actions">
          <button id="prefs-export" class="prefs-button"><i data-lucide="download"></i> Yedeği indir</button>
          <button id="prefs-reset" class="prefs-button prefs-button-quiet">Sıfırla</button>
        </div>
      </div>
      <div class="prefs-layout">
        <aside class="prefs-sidebar">
          <div class="prefs-sidebar-label">KATEGORİLER</div>
          <div id="prefs-categories" class="prefs-category-list"></div>
          <div class="prefs-sidebar-note"><i data-lucide="info"></i><span>Buradaki tercihler yalnızca bu tarayıcıda tutulur. NextDNS profil ayarlarını değiştirmez.</span></div>
        </aside>
        <div class="prefs-content">
          <div class="prefs-content-top"><div><span class="prefs-overline">TERCİH GRUBU</span><h2 id="prefs-group-title">Tüm tercihler</h2></div><span id="prefs-visible-count" class="prefs-visible-count">100 öğe</span></div>
          <div id="prefs-items" class="prefs-items"></div>
          <div id="prefs-empty" class="prefs-empty hidden"><i data-lucide="search-x"></i><strong>Sonuç bulunamadı</strong><span>Başka bir kelime deneyebilirsin.</span></div>
          <div class="prefs-footer"><span id="prefs-status">Değişiklikler otomatik kaydedilir.</span><span>LOCAL SETTINGS <span class="prefs-footer-dot"></span> V1.0</span></div>
        </div>
      </div>`;
    main.appendChild(panel);
    let activeGroup='Tümü',query='';
    const categories=document.getElementById('prefs-categories');
    const items=document.getElementById('prefs-items');
    const render=()=>{
      const chosen=features.filter(f=>flags[f.id]).length;
      document.getElementById('prefs-active-count').innerHTML=chosen+' <small>/ 100</small>';
      categories.innerHTML='<button class="prefs-category '+(activeGroup==='Tümü'?'selected':'')+'" data-group="Tümü"><span class="prefs-category-icon"><i data-lucide="layers"></i></span><span class="prefs-category-name">Tüm tercihler</span><span class="prefs-category-count">100</span></button>'+groups.map(g=>{
        const n=features.filter(f=>f.group===g[0]).length;
        const active=features.filter(f=>f.group===g[0]&&flags[f.id]).length;
        return '<button class="prefs-category '+(activeGroup===g[0]?'selected':'')+'" data-group="'+esc(g[0])+'"><span class="prefs-category-icon"><i data-lucide="'+(['chart-no-axes-combined','activity','globe','network','shield-check','sliders-horizontal','bell','notebook-tabs','database','settings'][groups.findIndex(x=>x[0]===g[0])]||'circle')+'"></i></span><span class="prefs-category-name">'+esc(g[0])+'</span><span class="prefs-category-count">'+active+'/'+n+'</span></button>';
      }).join('');
      const visible=features.filter(f=>(activeGroup==='Tümü'||f.group===activeGroup)&&(!query||(f.name+' '+f.group).toLocaleLowerCase('tr').includes(query)));
      document.getElementById('prefs-group-title').textContent=activeGroup==='Tümü'?'Tüm tercihler':activeGroup;
      document.getElementById('prefs-visible-count').textContent=visible.length+' öğe';
      items.innerHTML=visible.map(f=>'<label class="prefs-item"><span class="prefs-item-copy"><strong>'+esc(f.name)+'</strong><small>'+esc(f.group)+'</small></span><span class="prefs-switch"><input type="checkbox" data-pref="'+f.id+'" '+(flags[f.id]?'checked':'')+'><span class="prefs-switch-track"></span></span></label>').join('');
      document.getElementById('prefs-empty').classList.toggle('hidden',visible.length!==0);
      items.classList.toggle('hidden',visible.length===0);
      if(window.lucide)window.lucide.createIcons();
    };
    categories.addEventListener('click',e=>{const b=e.target.closest('[data-group]');if(!b)return;activeGroup=b.dataset.group;render();});
    items.addEventListener('change',e=>{
      const id=e.target.dataset.pref;if(!id)return;
      flags[id]=e.target.checked;save();render();
      document.getElementById('prefs-status').textContent='Kaydedildi · '+features.find(f=>f.id===id).name;
    });
    document.getElementById('prefs-search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('tr');activeGroup='Tümü';render();});
    document.getElementById('prefs-export').addEventListener('click',()=>download('nextdns-pro-tercihler.json',JSON.stringify({version:1,flags},null,2)));
    document.getElementById('prefs-reset').addEventListener('click',()=>{if(!confirm('Tüm seçili tercihler sıfırlansın mı?'))return;flags={};save();render();document.getElementById('prefs-status').textContent='Tercihler sıfırlandı.';});
    render();if(window.lucide)window.lucide.createIcons();
    document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&!panel.classList.contains('hidden')){e.preventDefault();document.getElementById('prefs-search').focus();}});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    init();
    const dashboard=document.getElementById('dashboard-screen');
    if(dashboard)new MutationObserver(()=>{if(!document.getElementById('tab-pro-features'))init();}).observe(dashboard,{attributes:true,attributeFilter:['class']});
  });
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.tab-btn[data-tab="pro-features"]');if(!btn)return;
    document.querySelectorAll('.tab-btn').forEach(b=>{b.classList.remove('active','border-blue-500','text-blue-400');b.classList.add('border-transparent','text-zinc-400');});
    btn.classList.add('active','border-blue-500','text-blue-400');btn.classList.remove('border-transparent','text-zinc-400');
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.add('hidden'));
    document.getElementById('tab-pro-features')?.classList.remove('hidden');
    if(window.lucide)window.lucide.createIcons();
  });
})();

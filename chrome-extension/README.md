# NextDNS PRO — Chrome eklentisi

## Özellikler
- NextDNS API anahtarıyla bağlantı ve hesap profillerini listeleme
- Profil değiştirme
- Bu ayın toplam ve engellenen DNS sorgularını, engelleme oranını gösterme
- Son 30 günlük reklam/izleyici engelleme nedenlerine ilişkin tahmini sorgu toplamı
- En çok sorgu yapan cihazları listeleme
- Elle yenileme ve hesap bağlantısını kaldırma

## Chrome'a yükleme
1. Bu klasörü bilgisayarına indir veya depoyu ZIP olarak indirip çıkar.
2. Chrome'da chrome://extensions adresini aç.
3. Sağ üstten **Geliştirici modu**nu aç.
4. **Paketlenmemiş öğe yükle** seçeneğine tıkla ve bu klasörü seç.

## Güvenlik ve gizlilik
- API anahtarı GitHub dosyalarına yazılmaz.
- Anahtar chrome.storage.local içinde bu Chrome profilinde tutulur.
- Anahtar yalnızca https://api.nextdns.io adresine X-Api-Key başlığıyla gönderilir.
- Eklenti üçüncü taraf proxy kullanmaz ve DNS trafiğini değiştirmez; yalnızca NextDNS API istatistiklerini görüntüler.
- Chrome profilinin yerel verilerine erişebilen kişiler/uygulamalar anahtara erişebilir. Paylaşılan cihazlarda bağlantıyı kaldır.

## İstatistik notu
Aylık sorgu toplamı, NextDNS API'sinin bu ayın başlangıcından itibaren döndürdüğü analiz verilerinden hesaplanır. Reklam/izleyici sayısı ise son 30 günlük analiz nedenlerinden tahmini olarak toplanır; bu bir filtre listesi ayarının açık/kapalı durumunu doğrudan doğrulamaz.

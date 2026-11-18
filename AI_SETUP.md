# NextDNS Panel – Tarayıcıda çalışan AI

Bu sürüm yalnızca GitHub Pages ile çalışacak şekilde tasarlanmıştır. Cloudflare Worker, sunucu veya API anahtarı gerekmez.

## Nasıl çalışır?

- Sohbet asistanı, Hugging Face Transformers.js kitaplığını CDN üzerinden yükler.
- Qwen2.5-0.5B-Instruct modeli kullanıcının tarayıcısında çalışır.
- Model ilk kullanımda internet üzerinden indirilir ve tarayıcı önbelleğinde saklanabilir.
- WebGPU destekleniyorsa GPU kullanılır; başarısız olursa WASM ile denenir.
- NextDNS API anahtarı sohbet modeline gönderilmez.

## Bilinen sınırlamalar

- Model dosyaları büyük olabilir; ilk açılış ve ilk yanıt zaman alabilir.
- Performans cihazın RAM, işlemci/GPU ve tarayıcı desteğine bağlıdır.
- Bu küçük yerel model, bulut tabanlı büyük modeller kadar güçlü olmayabilir.
- GitHub Pages statik barındırma sunduğundan, API anahtarı gizleyerek OpenAI gibi bulut modellerini doğrudan çağırmak mümkün değildir. Bu nedenle bu sürüm bulut OpenAI API'sini kullanmaz.

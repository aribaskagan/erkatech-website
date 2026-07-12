# ErkaTech Website — Proje Context Dosyası

Bu dosya, bu projeye başka bir AI ajanının (veya insanın) sıfırdan bağlam kaybı olmadan devam edebilmesi için yazıldı. Aşağıdaki her şey önceki oturumda yapılan işin, alınan kararların ve nedenlerinin tam dökümüdür.

## 1. Proje nedir

**ErkaTech**, robotlara insan derisine benzer bir dokunma/basınç duyusu kazandırmayı hedefleyen erken aşama bir robotik startup girişimi (henüz resmi şirketleşme yok). Ürün: Hall-effect tabanlı, esnek ve düşük maliyetli **manyetik dokunsal sensör** teknolojisi.

Çalışma prensibi (görsellerden çıkarıldı):
- Üst katman: küçük mıknatıslardan oluşan bir matris (N/S kutupları dönüşümlü)
- Orta katman: esnek sünger (mıknatıs ile sensör arasındaki mesafeyi basınca göre değiştirir)
- Alt katman: PCB üzerinde Hall-effect sensör dizisi (mesafe değişimini voltaj farkına çevirir → basınç ölçümü)
- Çıktı: gerçek zamanlı 3D basınç haritası (heatmap)

Bu teknoloji gerçek bir 3D-printed robot koluna entegre edilip test edildi (breadboard prototip + laptop üzerinde canlı heatmap görselleştirme).

Bu projenin amacı bu startup için **Apple tarzı, sofistike bir tanıtım websitesi** yapmak. Kullanıcı bunu **hızlıca** istiyor, aşırı formatlanmış/uzun açıklamalar yerine doğrudan ve öz iletişimi tercih ediyor (bkz. bölüm 7).

## 2. Referans alınan site ve neden bu mimariye karar verildi

Kullanıcı şu siteyi referans/şablon olarak verdi: `https://mark-n.co/lusion-reverse-engineered/` — bu, gerçek `lusion.co` sitesinin bir developer (canxerian) tarafından eğitim amaçlı **reverse-engineer edilmiş** kopyası. Kaynak kodu açık: `https://github.com/canxerian/lusion-reverse-engineered` (CC0 lisans, telif sorunu yok).

**Referans sitenin gerçek mimarisi (önemli, bir sonraki ajan bunu tekrar keşfetmesin diye not düşülüyor):**
- Vite + vanilla JS (React/framework yok)
- **Tüm sayfa tek bir `<canvas>` üzerinde Three.js ile render ediliyor.** Ortografik kamera, `camera.position.y = -scrollY / innerHeight * frustumSize` formülüyle scroll'a bağlanmış — yani "scroll" aslında sayfayı kaydırmıyor, 3D kamerayı world-space'te hareket ettiriyor.
- Açılış animasyonu: **Rapier (WASM fizik motoru)** ile simüle edilen, gerçek zamanlı çarpışan pembe toplar (`physicsSandbox.js` + `homeScene.js`). Bu kullanıcının "kaldıralım" dediği **ağır 3D** kısmıydı.
- "Video panel" dediğimiz, aşağı kaydırdıkça büyüyen bölüm de aslında video değil: custom GLSL shader + "wiggle" bone-rig kütüphanesiyle deforme olan bir **3D tüp mesh'i** (`videoPanelShader.js`, `videoPanelBones.js`, `videoPanelWiggleBones.js`).
- Proje kutucukları (`projectTiles.js`) da Three.js canvas üzerine render ediliyordu.
- DOM tarafında (Three.js'e bağımlı olmayan, saf JS) tek parça: `paging.js` — IntersectionObserver ile h1 reveal animasyonu tetikleme + özel scrollbar güncelleme mantığı.

**Karar:** Bu WebGL/Rapier/shader altyapısını birebir forklamak "hızlı" hedefiyle çelişiyordu (yüzlerce satır, bir WASM fizik motoru, custom shader pipeline). Kullanıcıya bu tradeoff açıkça anlatıldı ve onay alındı:
> "Sadeleştirerek fork'la (Önerilen)" seçildi — Vite/Three.js iskeletini koruma fikri masaya kondu ama uygulamada, Three.js'e ihtiyaç kalmadığı görülünce **tamamen düz HTML/CSS/JS'e** geçildi (build adımı yok, npm yok, hiçbir bağımlılık yok). Bu, "eklemeli/hızlı" ilerleme isteğiyle tam örtüşüyor: her şey düz metin dosyaları, direkt tarayıcıda açılıyor.

`paging.js`'teki custom scrollbar mantığı (IntersectionObserver + scroll% hesaplama) korunarak `script.js`'e taşındı, çünkü zaten Three.js'e bağımlı değildi.

## 3. Mevcut dosya yapısı

```
erka-tech-website/
├── index.html          — tüm sayfa içeriği (tek sayfa / single-page site)
├── style.css            — tüm stiller, CSS custom properties ile
├── script.js            — tüm etkileşim mantığı (aşağıda detay)
├── i18n.js              — TR/EN çeviri sözlükleri + modal içerik metinleri
├── PROJECT_CONTEXT.md   — bu dosya
└── assets/
    ├── erkatech-logo.jpeg   — resmi logo (siyah daire + beyaz hexagon/"3" monogram + "ErKa-Tech" wordmark), header/footer'da kullanılıyor
    ├── robot-arm.jpeg       — 3D-printed robot kolu fotoğrafı, hero altındaki scroll-zoom panelinde kullanılıyor
    ├── sensor-module.png    — sensör küpü prototip fotoğrafı (kırmızı LED'li, beyaz nokta matrisli), "Esnek Sünger Katmanı" tile'ında kullanılıyor
    ├── infographic.jpeg     — Türkçe/İngilizce karışık "Hall-effect Magnetic Tactile Sensor" açıklayıcı infografik, "Hall-Effect Sensör Dizisi" tile'ında kullanılıyor
    ├── layers-diagram.jpeg  — mıknatıs/sünger/PCB katman diyagramı + basınç matrisi tablosu, "Mıknatıs Matrisi" tile'ında kullanılıyor
    ├── heatmap.png          — laptop ekranında canlı 3D basınç heatmap görüntüsü, "Gerçek Zamanlı Basınç Haritası" tile'ında kullanılıyor
    └── breadboard.png       — breadboard üzerinde OLED ekranlı elektronik prototip fotoğrafı, "Prototip" bölümünde kullanılıyor
```

**Not:** Bu klasörde ayrıca `../erka tech` adında (boşluklu, tireli değil) başka boş/farklı bir proje klasörü var — karıştırmamak lazım, doğru klasör **`erka-tech-website`**.

Build adımı YOK. `index.html`'i doğrudan çift tıklayıp Chrome'da açmak yeterli (dosya `file://` protokolüyle sorunsuz çalışıyor, hiçbir npm paketine bağımlı değil).

## 4. Tasarım sistemi

- **Renk paleti: kesinlikle siyah/beyaz** (kullanıcının açık talebi — "renk paletleri beyaz siyah olsun"). `--bg: #ffffff`, `--fg: #0a0a0a`, `--gray: #6b6b6b` (ikincil metin), `--line: #e2e2e2` (border'lar), `--panel-bg: #f4f4f4`. Renkli accent YOK, hover state'ler siyah/beyaz ters çevirerek yapılıyor.
- **Font:** sistem fontu (`-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif`) — harici font yükleme yok, hız için.
- **Hero başlık:** `clamp(2.6rem, 8.5vw, 7.5rem)` ile akıcı/fluid büyük tipografi (referans sitenin 9vw h1 sisteminden esinlenildi).
- **Header:** `position: fixed`, `backdrop-filter: blur(10px)` ile frosted-glass beyaz arkaplan, siyah metin. (İlk versiyonda referans sitedeki gibi `mix-blend-mode: difference` denendi ama bu, header'daki logo görselini renk açısından bozacağı için — logo raster bir imaj, text değil — solid frosted background'a çevrildi.)
- **Ease curve:** `--ease: cubic-bezier(0.16, 1, 0.3, 1)` tüm geçişlerde kullanılıyor.

## 5. Bölümler (index.html içinde sırayla)

1. **Header** (`header.site-header`) — logo + wordmark, nav (Teknoloji/Prototip/Hakkımızda/İletişim), TR/EN toggle.
2. **Hero** (`.hero`) — iki satırlık büyük başlık (satır satır reveal animasyonlu), alt paragraf, "KAYDIR/SCROLL" cue.
3. **Scroll-zoom foto paneli** (`.panel-section` / `.panel-sticky` / `.panel-frame`) — kullanıcının "video yerine foto, kaydırdıkça zoomlanır" isteğinin karşılığı. `robot-arm.jpeg` kullanıyor. `position: sticky` + JS ile scroll progress hesaplanıp `transform: scale()` ve `border-radius` interpolasyonu yapılıyor (bkz. `script.js` → `updatePanel()`). 260vh yükseklikte bir "pin" alanı var, içinde foto scale(1) → scale(~2.35) arası büyüyor.
4. **Teknoloji / "Nasıl Çalışır"** (`#teknoloji`) — 4 kutulu tile grid (Mıknatıs Matrisi / Esnek Sünger / Hall-Effect Dizisi / Basınç Haritası). Her tile tıklanınca modal açılıyor (büyük görsel + açıklama), içerik `i18n.js`'teki `modalContent` objesinden geliyor.
5. **Prototip** (`#prototip`) — breadboard fotoğrafı + metin + 3 istatistik (3×3 sensör matrisi, düşük maliyet hedefi, esnek yüzey kaplama potansiyeli — **bunlar gerçek doğrulanmış rakamlar değil, placeholder**).
6. **Hakkımızda** (`#hakkimizda`) — kısa, dürüst bir "henüz şirketleşmedik" metni. **Tamamen placeholder**, gerçek ekip/kuruluş bilgisi yok.
7. **İletişim/CTA** (`.cta`) — siyah arkaplanlı kutu, `mailto:hello@erkatech.co` linki (**gerçek bir e-posta değil, placeholder**).
8. **Footer** — logo + telif hakkı satırı.
9. **Modal** (`#modal`) — tile'lara tıklanınca açılan tam ekran overlay, `Esc` veya dışına tıklayınca kapanıyor.
10. **Custom scrollbar** (`#scrollbar` / `#scrollbar-handle`) — sağda ince, referans siteden birebir taşınan mantık.

## 6. `script.js` içindeki mantık özetleri

- **Dil sistemi:** `translations` objesi (`i18n.js`) → `data-i18n="key"` attribute'lu her elemente `textContent` ile uygulanıyor. Tercih `localStorage`'da (`erkatech-lang`) saklanıyor.
- **Hero reveal:** `IntersectionObserver` ile `.hero-headline` ve `.hero` elementlerine `.in-view` class'ı ekleniyor (CSS transition'ları bunu tetikliyor). Ayrıca sayfa yüklenir yüklenmez hero için de otomatik tetikleniyor (`requestAnimationFrame`).
- **`.reveal` utility class'ı:** genel scroll-reveal için, `IntersectionObserver` ile `.in-view` ekleniyor.
- **`updatePanel()`:** scroll-zoom foto panelinin kalbi. `panelSection.getBoundingClientRect()` ile progress (0→1) hesaplanıyor, `panelFrame`'e `scale()` ve `border-radius` uygulanıyor. `panelCaption` progress 0.55-0.97 arasında görünür oluyor.
- **`updateScrollbar()`:** sağdaki custom scrollbar handle'ının boyu/pozisyonu.
- **Modal mantığı:** `.tile[data-modal]` elementlerine tıklanınca `modalContent[currentLang][key]` içeriği modal'a basılıyor.

## 7. Kullanıcı tercihleri / iletişim tarzı (önemli!)

- Kullanıcı **çok kısa, direkt, gereksiz açıklamasız** yanıt istiyor. Uzun rapor formatlı mesajlardan kaçın.
- **Hız öncelikli** — "hızlıca yapmam lazım" defalarca vurgulandı. Ağır/karmaşık çözümler yerine en hızlı+risksiz yol tercih ediliyor.
- Kullanıcı Türkçe yazıyor, siteyle ilgili konuşma Türkçe yürüdü. Site içeriği TR/EN toggle ile iki dilli.
- **Direkt bu proje üzerinde eklemeli ilerleme** tercih ediliyor — yeni proje/klasör açmaya gerek yok, mevcut `index.html`/`style.css`/`script.js`/`i18n.js` üzerine yazmaya devam et.
- Kullanıcı görsel detaylara (logo boyutu gibi) çok dikkat ediyor ve **iteratif, hızlı geri bildirim** veriyor — küçük bir CSS değişikliği isteyip hemen sonucu görmek istiyor.

## 8. Yapılan iterasyonlar (kronolojik, ileride "neden böyle" sorusuna cevap olsun diye)

1. İlk versiyon kuruldu (yukarıdaki 10 bölüm).
2. Header logosu "çok küçük" bulundu (28px) → 52px yapıldı.
3. Sonra "3.5 katına çıkart" denildi → 182px yapıldı (52×3.5).
4. Bu **çok büyük ve orantısız** bulundu, nav yazılarıyla uyumsuzdu → kullanıcı "2.5 katında dursun" dedi, bu **orijinal 28px'in 2.5 katı = 70px** olarak yorumlandı (182px'in 2.5 katı değil — bağlamdan bu çıkarıldı çünkü kullanıcı büyük boyuttan şikayet ediyordu). Header padding (`0.7rem 5vw`), logo-lockup font-size (`1.2rem`) ve nav font-size (`0.95rem`) da buna göre orantılı ayarlandı.
5. **Şu anki logo boyutu: `.logo-lockup img { width: 70px; height: 70px; }`** (header). Footer'daki logo ayrı: `34px`.

## 9. Doğrulama / test metodolojisi (bu oturumda kullanılan)

- Otomatik headless browser bu ortamda kurulamadı (sandbox'ta root/apt yok, puppeteer indirmesi arka planda kalıcı olmuyor çünkü her bash çağrısı izole/stateless).
- Bunun yerine: (a) statik kontroller — `node --check` ile JS syntax, referans edilen tüm asset dosyalarının var olduğu, CSS parantez dengesi, `i18n.js`'teki TR/EN key'lerin `data-i18n` attribute'larıyla birebir eşleştiği script ile doğrulandı; (b) **gerçek görsel doğrulama**: `mcp__computer-use` ile kullanıcının bilgisayarında File Explorer üzerinden `index.html` çift tıklanarak gerçek Chrome'da açıldı ve ekran görüntüsü alındı (Chrome bu oturumda salt-okunur izinle bağlı, klavye/tık/scroll gönderilemiyor — sadece görüntüleme). Kullanıcı da kendi tarafında sitede gezinip "Nasıl Çalışır" tile'larını ve modal'ı test etti, çalıştığını doğruladı.
- **`file://` navigasyon notu:** `mcp__claude-in-chrome__navigate` aracı `file://` URL'lerini düzgün işlemiyor (otomatik `https://` prepend ediyor, URL'i bozuyor: `https://file:///...` gibi geçersiz bir sonuç oluşuyor). Bu yüzden local dosya önizlemesi için bunun yerine gerçek işletim sistemi seviyesinde (`mcp__computer-use`) File Explorer'dan çift tıklama kullanıldı.

## 10. Bilinen eksikler / bir sonraki ajanın dikkat etmesi gerekenler

- **Tüm metin içeriği placeholder kalitesinde** — gerçek şirket bilgisi, kurucu isimleri, gerçek istatistikler (3×3 matris, maliyet hedefi vb.), gerçek iletişim e-postası (`hello@erkatech.co` uydurma) henüz yok.
- Mobil responsive temel seviyede var (`@media (max-width: 900px)` bir breakpoint) ama derinlemesine test edilmedi.
- Panel scroll-zoom oranı (`scale(1 + progress * 1.35)`) göz kararı ayarlandı, gerçek tarayıcıda ince ayar gerekebilir.
- Header'daki `backdrop-filter: blur(10px)` bazı eski tarayıcılarda desteklenmeyebilir (fallback yok, düşük risk).
- Favicon olarak logo jpeg'i direkt kullanılıyor (`<link rel="icon" type="image/jpeg" ...>`) — ideal değil ama çalışıyor; ileride `.ico`/`.png` favicon'a çevrilebilir.
- Hiç git repository'si başlatılmadı — proje sadece düz dosyalar halinde duruyor. Versiyon kontrolü isteniyorsa `git init` yapılmalı.
- SEO/OG meta tag'leri minimal (`description` var, `og:*` yok).

## 11. Hızlı başlangıç (bir sonraki ajan için)

Bu klasörü aç, `index.html`, `style.css`, `script.js`, `i18n.js` dosyalarını oku — hepsi kısa ve yorumsuz-ama-anlaşılır düz kod. Değişiklik yapmak için build/npm gerekmiyor, direkt düzenleyip tarayıcıda yenile. Yeni bölüm eklerken mevcut `.block` / `reveal` / `data-i18n` desenlerini takip et ki tutarlılık bozulmasın.

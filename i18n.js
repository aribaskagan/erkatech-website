const translations = {
  tr: {
    "nav.tech": "Teknoloji",
    "nav.proto": "Prototip",
    "nav.about": "Hakkımızda",
    "nav.contact": "İletişim",
    "hero.line1": "DOKUNMAYI",
    "hero.line2": "YENİDEN TASARLIYORUZ",
    "hero.sub": "Hall-effect tabanlı, esnek ve düşük maliyetli manyetik dokunsal sensörlerle robotlara gerçek zamanlı basınç ve dokunma duyusu kazandırıyoruz.",
    "hero.scroll": "Kaydır",
    "panel.caption": "Sensörlerimiz gerçek bir robot koluna entegre edilerek test ediliyor.",
    "panel.tag": "Prototip · 2026",
    "tech.title": "Nasıl Çalışır",
    "tech.desc": "Dört katmanlı basit bir yapı: mıknatıs, esnek sünger, Hall-effect sensör dizisi ve gerçek zamanlı basınç okuması. Her kutucuğa tıklayarak detayına bakabilirsin.",
    "tech.tile1": "Mıknatıs Matrisi",
    "tech.tile2": "Esnek Sünger Katmanı",
    "tech.tile3": "Hall-Effect Sensör Dizisi",
    "tech.tile4": "Gerçek Zamanlı Basınç Haritası",
    "proto.eyebrow": "Atölyeden",
    "proto.title": "Fikirden çalışan prototipe",
    "proto.p1": "Sensör dizisini kendi elektronik kartlarımız üzerinde tasarlayıp test ediyoruz. Basınç verisini gerçek zamanlı okuyup görselleştirebiliyoruz.",
    "proto.p2": "Hedefimiz: neredeyse her yüzeye uygulanabilen, düşük maliyetli ve esnek bir dokunsal sensör katmanı.",
    "proto.stat1": "Sensör matrisi (mevcut prototip)",
    "proto.stat2": "Düşük maliyet hedefi (birim başına)",
    "proto.stat3": "Esnek yüzey kaplama potansiyeli",
    "about.title": "Hakkımızda",
    "about.p1": "ErkaTech, robotlara insan derisine benzer bir dokunma duyusu kazandırmayı hedefleyen erken aşama bir girişim çalışmasıdır. Henüz şirketleşme sürecindeyiz.",
    "about.p2": "Bu sayfadaki içerik ve görseller ilk prototip çalışmalarımızdan oluşuyor; ekip ve şirket bilgileri yakında güncellenecek.",
    "cta.title": "Bizimle çalışmak veya yatırım hakkında konuşmak ister misin?",
    "cta.button": "İletişime Geç",
    "footer.rights": "© 2026 ErkaTech. Tüm hakları saklıdır.",
    "modal.close": "Kapat ✕"
  },
  en: {
    "nav.tech": "Technology",
    "nav.proto": "Prototype",
    "nav.about": "About",
    "nav.contact": "Contact",
    "hero.line1": "REDESIGNING",
    "hero.line2": "ROBOTIC TOUCH",
    "hero.sub": "We give robots real-time pressure and touch sensing with flexible, low-cost magnetic tactile sensors based on the Hall effect.",
    "hero.scroll": "Scroll",
    "panel.caption": "Our sensors integrated onto a real robotic arm for testing.",
    "panel.tag": "Prototype · 2026",
    "tech.title": "How It Works",
    "tech.desc": "A simple four-layer structure: magnet, flexible sponge, Hall-effect sensor array, and real-time pressure readout. Click any tile for details.",
    "tech.tile1": "Magnet Matrix",
    "tech.tile2": "Flexible Sponge Layer",
    "tech.tile3": "Hall-Effect Sensor Array",
    "tech.tile4": "Real-Time Pressure Map",
    "proto.eyebrow": "From the workshop",
    "proto.title": "From idea to working prototype",
    "proto.p1": "We design and test the sensor array on our own electronics boards, reading and visualizing pressure data in real time.",
    "proto.p2": "Our goal: a low-cost, flexible tactile sensing layer that can be applied to almost any surface.",
    "proto.stat1": "Sensor matrix (current prototype)",
    "proto.stat2": "Target low cost (per unit)",
    "proto.stat3": "Flexible surface coverage potential",
    "about.title": "About Us",
    "about.p1": "ErkaTech is an early-stage startup working to give robots a sense of touch similar to human skin. We haven't formally incorporated yet.",
    "about.p2": "The content and visuals on this page are from our early prototype work; team and company details will be updated soon.",
    "cta.title": "Want to work with us or talk about investing?",
    "cta.button": "Get in Touch",
    "footer.rights": "© 2026 ErkaTech. All rights reserved.",
    "modal.close": "Close ✕"
  }
};

const modalContent = {
  tr: {
    magnet: {
      title: "Mıknatıs Matrisi",
      desc: "Üst katmandaki küçük mıknatıslar N/S kutupları dönüşümlü dizilerek altındaki sensör dizisi için değişken bir manyetik alan oluşturur.",
      img: "assets/layers-diagram.jpeg"
    },
    sponge: {
      title: "Esnek Sünger Katmanı",
      desc: "Mıknatıs ile sensör arasındaki sünger katmanı basınçla sıkışarak mesafeyi değiştirir; bu da esneklik ve yumuşak dokunuş hissi sağlar.",
      img: "assets/sensor-module.png"
    },
    hall: {
      title: "Hall-Effect Sensör Dizisi",
      desc: "Taban PCB üzerindeki Hall-effect sensörleri, mıknatıs mesafesindeki değişimi voltaj farkına çevirerek basıncı ölçer. Düşük maliyetli ve kolay entegre edilebilir.",
      img: "assets/infographic.jpeg"
    },
    heatmap: {
      title: "Gerçek Zamanlı Basınç Haritası",
      desc: "Sensör dizisinden gelen veriler anlık olarak 3D bir basınç haritasına dönüştürülüp görselleştiriliyor.",
      img: "assets/heatmap.png"
    }
  },
  en: {
    magnet: {
      title: "Magnet Matrix",
      desc: "Small magnets in the top layer alternate N/S poles, creating a variable magnetic field for the sensor array beneath.",
      img: "assets/layers-diagram.jpeg"
    },
    sponge: {
      title: "Flexible Sponge Layer",
      desc: "The sponge layer between magnet and sensor compresses under pressure, changing distance — giving flexibility and a soft touch feel.",
      img: "assets/sensor-module.png"
    },
    hall: {
      title: "Hall-Effect Sensor Array",
      desc: "Hall-effect sensors on the base PCB convert the change in magnet distance into a voltage difference to measure pressure. Low-cost and easy to integrate.",
      img: "assets/infographic.jpeg"
    },
    heatmap: {
      title: "Real-Time Pressure Map",
      desc: "Data from the sensor array is converted into a live 3D pressure heatmap and visualized instantly.",
      img: "assets/heatmap.png"
    }
  }
};

(function () {
    "use strict";

    /* ---------- Language toggle ---------- */
    const langButtons = document.querySelectorAll(".lang-toggle button");
    let currentLang = localStorage.getItem("erkatech-lang") || "tr";

    function applyLang(lang) {
        currentLang = lang;
        localStorage.setItem("erkatech-lang", lang);
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            const dict = translations[lang];
            if (dict && dict[key] !== undefined) {
                el.textContent = dict[key];
            }
        });
        langButtons.forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
        });
    }

    langButtons.forEach((btn) => {
        btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang")));
    });

    applyLang(currentLang);

    /* ---------- Hero + generic reveal-on-scroll ---------- */
    const heroHeadline = document.querySelector(".hero-headline");
    const hero = document.querySelector(".hero");
    const revealEls = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        },
        { threshold: 0.15 }
    );

    if (heroHeadline) revealObserver.observe(heroHeadline);
    if (hero) revealObserver.observe(hero);
    revealEls.forEach((el) => revealObserver.observe(el));

    // Trigger hero immediately on load (it's above the fold)
    requestAnimationFrame(() => {
        heroHeadline && heroHeadline.classList.add("in-view");
        hero && hero.classList.add("in-view");
    });

    /* ---------- Scroll-zoom photo panel ---------- */
    const panelSection = document.getElementById("panel-section");
    const panelFrame = document.getElementById("panel-frame");
    const panelCaption = document.getElementById("panel-caption");

    function updatePanel() {
        if (!panelSection || !panelFrame) return;

        const rect = panelSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height - vh;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const progress = total > 0 ? scrolled / total : 0;

        // Ease the growth: fast in the middle of the section
        const scale = 1 + progress * 1.35;
        const radius = 18 - progress * 18;

        panelFrame.style.transform = `scale(${scale})`;
        panelFrame.style.borderRadius = `${radius}px`;

        if (panelCaption) {
            panelCaption.classList.toggle("visible", progress > 0.55 && progress < 0.97);
        }
    }

    let panelTicking = false;
    window.addEventListener("scroll", () => {
        if (!panelTicking) {
            requestAnimationFrame(() => {
                updatePanel();
                panelTicking = false;
            });
            panelTicking = true;
        }
    });
    window.addEventListener("resize", updatePanel);
    updatePanel();

    /* ---------- Custom scrollbar ---------- */
    const scrollbar = document.getElementById("scrollbar");
    const scrollbarHandle = document.getElementById("scrollbar-handle");

    function updateScrollbar() {
        if (!scrollbar || !scrollbarHandle) return;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const heightPerViewport = document.body.scrollHeight / window.innerHeight;
        scrollbarHandle.style.height = `${scrollbar.clientHeight / heightPerViewport}px`;
        const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
        const maxTop = scrollbar.clientHeight - scrollbarHandle.clientHeight;
        scrollbarHandle.style.top = `${Math.min(Math.max(progress, 0), 1) * maxTop}px`;
    }

    window.addEventListener("scroll", updateScrollbar);
    window.addEventListener("resize", updateScrollbar);
    updateScrollbar();

    /* ---------- Prototype video ---------- */
    const prototypeVideo = document.getElementById("prototype-video");
    if (prototypeVideo) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    prototypeVideo.play().catch(() => {});
                } else {
                    prototypeVideo.pause();
                }
            });
        }, { threshold: 0.55 });
        videoObserver.observe(prototypeVideo);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) prototypeVideo.pause();
        });
    }
})();

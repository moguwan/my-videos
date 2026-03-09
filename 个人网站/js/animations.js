/**
 * 全页动效：滚动进入动画、横屏滚动、数字计数
 */
(function () {
    'use strict';

    // ========== 1. 滚动进入动画（从屏幕外进入） ==========
    const revealEls = document.querySelectorAll('[data-reveal]');
    const REVEAL_THRESHOLD = 0.15;
    const REVEAL_ROOT_MARGIN = '0px 0px -80px 0px';

    function initReveal() {
        if (!revealEls.length) return;
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const delay = parseFloat(el.dataset.delay || 0) * 400;
                setTimeout(function () {
                    el.classList.add('revealed');
                }, delay);
            });
        }, { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN });

        revealEls.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ========== 2. 横屏滚动 ==========
    const horizontalWrap = document.querySelector('.horizontal-scroll-wrap');
    const horizontalTrack = document.querySelector('.horizontal-track');
    const horizontalPanels = document.querySelectorAll('.horizontal-panel');

    function initHorizontalScroll() {
        if (!horizontalWrap || !horizontalTrack) return;

        const pin = horizontalWrap.querySelector('.horizontal-scroll-pin');
        if (!pin) return;

        let scrollHeight = 0;
        let trackWidth = 0;

        function updateSizes() {
            const panels = horizontalTrack.querySelectorAll('.horizontal-panel');
            trackWidth = 0;
            panels.forEach(function (p) {
                trackWidth += p.offsetWidth + 40;
            });
            horizontalTrack.style.width = trackWidth + 'px';
            scrollHeight = horizontalWrap.offsetHeight;
        }

        function onScroll() {
            const rect = horizontalWrap.getBoundingClientRect();
            const wh = window.innerHeight;
            if (rect.top > wh || rect.bottom < 0) return;

            const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - wh)));
            const maxScroll = trackWidth - window.innerWidth;
            if (maxScroll > 0) {
                horizontalTrack.style.transform = 'translateX(-' + progress * maxScroll + 'px)';
            }

            horizontalPanels.forEach(function (panel, i) {
                const numEl = panel.querySelector('.panel-num');
                if (!numEl) return;
                const target = parseInt(numEl.dataset.count || 0, 10);
                const startP = i * 0.25;
                const endP = startP + 0.25;
                const t = progress < startP ? 0 : Math.min(1, (progress - startP) / (endP - startP));
                const eased = 1 - Math.pow(1 - t, 2);
                numEl.textContent = Math.round(target * eased);
            });
        }

        updateSizes();
        window.addEventListener('resize', updateSizes);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ========== 3. 数字统计区 - 滚动触发计数 ==========
    const statNums = document.querySelectorAll('.stat-num[data-count]');

    function initStatCounters() {
        if (!statNums.length) return;

        statNums.forEach(function (el) {
            const target = parseInt(el.dataset.count || 0, 10);
            let animated = false;

            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting || animated) return;
                    animated = true;
                    animateNumber(el, 0, target, 1000);
                });
            }, { threshold: 0.3 });

            observer.observe(el.closest('.stat-item') || el);
        });
    }

    function animateNumber(el, from, to, duration) {
        const start = performance.now();
        function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 2);
            const val = Math.round(from + (to - from) * eased);
            el.textContent = val;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ========== 启动 ==========
    initReveal();
    initHorizontalScroll();
    initStatCounters();
})();

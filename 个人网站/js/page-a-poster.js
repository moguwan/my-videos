/**
 * A 页 - 第二屏：海报-1+海报-2 滚动驱动动画（非逐帧）
 */
(function () {
    'use strict';

    const section = document.querySelector('[data-poster-section]');
    if (!section) return;

    const bg = section.querySelector('.a-overview-bg');
    const posterVisual = section.querySelector('.a-poster-visual');
    const textEls = section.querySelectorAll('[data-reveal="text"]');

    let smoothProgress = 0;
    const SMOOTH_FACTOR = 0.08;

    function getScrollProgress() {
        const rect = section.getBoundingClientRect();
        const wh = window.innerHeight;
        const sh = section.offsetHeight;
        if (rect.top > wh) return 0;
        if (rect.bottom < 0) return 1;
        const progress = (wh - rect.top) / (wh + sh);
        return Math.max(0, Math.min(1, progress));
    }

    function updateScrollAnimations(progress) {
        // 1. 海报-2：渐出 + 从很大缩小到最终效果（progress 0.1~0.35）
        if (posterVisual) {
            const start = 0.1;
            const end = 0.35;
            const fadeEnd = 0.18;
            let opacity = 0;
            if (progress >= fadeEnd) opacity = 1;
            else if (progress > start) opacity = (progress - start) / (fadeEnd - start);
            posterVisual.style.opacity = String(opacity);
            let scale = 5;
            if (progress >= end) scale = 1;
            else if (progress > start) scale = 5 - (5 - 1) * (progress - start) / (end - start);
            posterVisual.style.transform = 'scale(' + scale + ')';
        }

        // 2. 海报-1：渐出 + 海报-2 动画结束后隔更多帧才出现，从很大缩小到最终效果（progress 0.48~0.72）
        if (bg) {
            const start = 0.48;
            const end = 0.72;
            const fadeEnd = 0.56;
            let opacity = 0;
            if (progress >= fadeEnd) opacity = 1;
            else if (progress > start) opacity = (progress - start) / (fadeEnd - start);
            bg.style.opacity = String(opacity);
            let scale = 5;
            if (progress >= end) scale = 1;
            else if (progress > start) scale = 5 - (5 - 1) * (progress - start) / (end - start);
            bg.style.transform = 'scale(' + scale + ')';
        }

        // 3. 文字：直接渐出（progress 0.65~0.85）
        textEls.forEach(function (el, i) {
            const start = 0.65 + i * 0.03;
            const end = start + 0.1;
            let opacity = 0;
            if (progress >= end) opacity = 1;
            else if (progress > start) opacity = (progress - start) / (end - start);
            el.style.opacity = String(opacity);
        });
    }

    function animate() {
        const rect = section.getBoundingClientRect();
        const wh = window.innerHeight;
        if (rect.top > wh || rect.bottom < 0) {
            requestAnimationFrame(animate);
            return;
        }
        const target = getScrollProgress();
        smoothProgress += (target - smoothProgress) * SMOOTH_FACTOR;
        updateScrollAnimations(smoothProgress);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();

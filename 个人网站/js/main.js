/**
 * 滚动图片序列 - 正确时序
 * 1. 视频在视口内时：始终跟随屏幕（sticky）
 * 2. 只有滚动到位置后才开始逐帧播放（section top > 0 时保持第 0 帧）
 * 3. 动画播完后：视频停留在页面位置，不再跟随
 */
(function () {
    'use strict';

    const SMOOTH_FACTOR = 0.14;
    const ENABLE_FRAME_BLEND = true;

    const videoSections = document.querySelectorAll('[data-video-section]');
    if (!videoSections.length) return;

    const sections = [];
    const smoothProgressCache = {};

    function updateOverlay(section, progress) {
        const overlay = section.querySelector('.video-overlay');
        if (!overlay) return;

        const rect = section.getBoundingClientRect();
        const inView = rect.top <= window.innerHeight && rect.bottom >= 0;
        if (inView) overlay.classList.add('visible');
        else overlay.classList.remove('visible');

        const cards = overlay.querySelectorAll('.feature-card');
        cards.forEach(function (card, idx) {
            const delay = parseFloat(card.dataset.delay || 0);
            const numEl = card.querySelector('.card-num');
            if (!numEl) return;

            const target = parseFloat(numEl.dataset.target || 0);
            const startProgress = delay;
            const endProgress = Math.min(0.95, delay + 0.35);
            const t = progress < startProgress ? 0 : Math.min(1, (progress - startProgress) / (endProgress - startProgress));
            const eased = 1 - Math.pow(1 - t, 2);
            const val = target * eased;

            if (target === Math.floor(target) && target >= 1) {
                numEl.textContent = Math.round(val);
            } else if (target < 1 && target > 0) {
                numEl.textContent = val.toFixed(2);
            } else if (target.toString().includes('.')) {
                numEl.textContent = val.toFixed(1);
            } else {
                numEl.textContent = Math.round(val);
            }
        });
    }

    /**
     * 进度计算：scrollZone = 区块高度，播完时 section 底部刚好离开视口，无多余停顿
     */
    function getScrollProgress(section) {
        const rect = section.getBoundingClientRect();
        const wh = window.innerHeight;
        const sh = section.offsetHeight;

        if (rect.top > wh) return 0;
        if (rect.bottom < 0) return 1;

        const scrollZone = sh;
        if (scrollZone <= 0) return 0;

        if (rect.top > 0) return 0;

        const progress = -rect.top / scrollZone;
        return Math.max(0, Math.min(1, progress));
    }

    function initSection(section, index) {
        const canvas = section.querySelector('.frame-canvas');
        const video = section.querySelector('.frame-video');
        const framesPath = section.dataset.framesPath;
        const framesKey = section.dataset.framesKey;
        const frameCount = Math.max(1, parseInt(
            (window.FRAME_COUNTS && window.FRAME_COUNTS[framesKey]) || section.dataset.frameCount || '150',
            10
        ));
        const videoSrc = section.dataset.videoSrc;

        const ctx = canvas.getContext('2d', { alpha: false });
        const images = [];
        let useFrames = false;

        function getFrameUrl(i) {
            return framesPath + String(i).padStart(5, '0') + '.jpg';
        }

        function preloadFrames() {
            if (frameCount <= 0) {
                useFrames = false;
                video.src = videoSrc;
                video.style.display = 'block';
                canvas.style.display = 'none';
                return;
            }
            const testImg = new Image();
            testImg.onload = function () {
                useFrames = true;
                for (let i = 1; i <= frameCount; i++) {
                    const img = new Image();
                    img.src = getFrameUrl(i);
                    images.push(img);
                }
            };
            testImg.onerror = function () {
                useFrames = false;
                video.src = videoSrc;
                video.style.display = 'block';
                canvas.style.display = 'none';
            };
            testImg.src = getFrameUrl(1);
        }

        let lastVideoTime = -1;
        const VIDEO_SEEK_THRESHOLD = 0.06;

        function drawFrame(progress) {
            if (useFrames && images.length > 0) {
                const fc = Math.max(0, images.length - 1);
                const exactIdx = progress * fc;
                const idx0 = Math.min(Math.floor(exactIdx), fc);
                const idx1 = Math.min(idx0 + 1, fc);
                const blend = ENABLE_FRAME_BLEND ? Math.max(0, exactIdx - idx0) : 0;

                function findValid(idx) {
                    for (let i = idx; i >= 0; i--) {
                        const img = images[i];
                        if (img && img.complete && img.naturalWidth) return img;
                    }
                    return null;
                }

                const img0 = findValid(idx0);
                const img1 = findValid(idx1);

                if (!img0) return;

                const w = window.innerWidth;
                const h = window.innerHeight;

                function drawOne(img, alpha) {
                    if (!img || !img.complete || !img.naturalWidth) return;
                    const iw = img.naturalWidth;
                    const ih = img.naturalHeight;
                    const scale = Math.max(w / iw, h / ih);
                    const sw = iw * scale;
                    const sh = ih * scale;
                    const sx = (w - sw) / 2;
                    const sy = (h - sh) / 2;
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(img, sx, sy, sw, sh);
                }

                ctx.globalAlpha = 1;
                if (blend > 0.02 && img1 && img1 !== img0) {
                    drawOne(img0, 1 - blend);
                    drawOne(img1, blend);
                } else {
                    drawOne(img0, 1);
                }
                ctx.globalAlpha = 1;
            } else if (video.readyState >= 2 && video.duration) {
                const targetTime = progress * video.duration;
                if (Math.abs(targetTime - lastVideoTime) > VIDEO_SEEK_THRESHOLD) {
                    video.currentTime = targetTime;
                    lastVideoTime = targetTime;
                }
            }
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }

        preloadFrames();
        resize();
        window.addEventListener('resize', resize);

        return { section, frameCount, drawFrame };
    }

    videoSections.forEach(function (section, i) {
        sections.push(initSection(section, i));
        smoothProgressCache[i] = 0;
    });

    function animate() {
        const wh = window.innerHeight;

        sections.forEach(function (s, i) {
            const rect = s.section.getBoundingClientRect();
            if (rect.top > wh || rect.bottom < 0) {
                if (rect.top > wh) {
                    smoothProgressCache[i] = 0;
                    updateOverlay(s.section, 0);
                } else {
                    smoothProgressCache[i] = 1;
                    updateOverlay(s.section, 1);
                }
                if (rect.top > wh) s.drawFrame(0);
                else if (rect.bottom < 0) s.drawFrame(1);
                return;
            }

            const targetProgress = getScrollProgress(s.section);
            let smooth = smoothProgressCache[i];
            smooth += (targetProgress - smooth) * SMOOTH_FACTOR;
            smoothProgressCache[i] = smooth;

            s.drawFrame(smooth);
            updateOverlay(s.section, smooth);
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();

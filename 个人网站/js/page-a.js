/**
 * A 页 - Chawke 焊接头产品介绍
 * 第一屏：全黑 → Logo 渐现 → Logo 渐隐 → 视频渐现
 * 导航栏：滚动时才显示
 * 视频：滚动时音量渐变，滚出视区暂停，滚回时恢复
 */
(function () {
    'use strict';

    // 每次进入/刷新/返回页面时从顶部开始
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    window.addEventListener('pageshow', function () { window.scrollTo(0, 0); });

    const hero = document.getElementById('a-hero');
    const logoEl = document.querySelector('[data-hero="logo"]');
    const videoWrap = hero && hero.querySelector('[data-hero="video"]');
    const video = videoWrap && videoWrap.querySelector('video');
    const nav = document.querySelector('.main-nav');

    if (!hero || !logoEl) return;

    // 1. Logo 渐现
    requestAnimationFrame(function () {
        logoEl.classList.add('visible');
    });

    // 2. Logo 停留后渐隐消失，视频渐现并开始播放
    var soundHint = document.getElementById('a-hero-sound-hint');
    var soundBubble = soundHint && soundHint.querySelector('.a-hero-sound-bubble');
    setTimeout(function () {
        logoEl.classList.remove('visible');
        if (videoWrap) {
            videoWrap.classList.add('visible');
            if (video) video.play().catch(function () {});
        }
        if (soundHint) soundHint.classList.add('visible');
        if (soundBubble && video) {
            if (video.volume === 0 || video.paused) soundBubble.classList.add('show');
            else soundBubble.classList.remove('show');
        }
    }, 2200);

    var userPaused = false;

    // 2b. 点击喇叭：切换播放/暂停
    if (soundHint && video) {
        soundHint.addEventListener('click', function (e) {
            e.stopPropagation();
            if (video.paused) {
                userPaused = false;
                video.volume = 1;
                video.play().catch(function () {});
            } else {
                userPaused = true;
                video.pause();
            }
        });
    }

    // 2c. 点击视频：暂停/继续播放
    if (video) {
        video.addEventListener('click', function (e) {
            e.preventDefault();
            if (video.paused) {
                userPaused = false;
                video.play().catch(function () {});
            } else {
                userPaused = true;
                video.pause();
            }
        });
    }

    // 3. 视频滚动控制：向下滚音量渐小、滚出视区暂停；滚回时音量渐大、居中时正常播放
    if (video && hero) {
        var scrollZone = window.innerHeight;
        function updateVideoByScroll() {
            var y = window.scrollY;
            var scale = Math.max(0, 1 - y / scrollZone);
            if (y >= scrollZone) {
                hero.classList.add('scrolled-past');
                video.pause();
                video.volume = 0;
                userPaused = false;
                if (soundHint) {
                    soundHint.classList.add('hidden');
                    soundHint.style.setProperty('--sound-scale', '0');
                }
            } else {
                hero.classList.remove('scrolled-past');
                if (soundHint) {
                    soundHint.classList.remove('hidden');
                    soundHint.style.setProperty('--sound-scale', String(scale));
                }
                if (!userPaused && video.paused) video.play().catch(function () {});
                video.volume = scale;
                // 无声音时显示云朵提示
                if (soundBubble) {
                    if (video.volume === 0 || video.paused) {
                        soundBubble.classList.add('show');
                    } else {
                        soundBubble.classList.remove('show');
                    }
                }
            }
        }
        window.addEventListener('scroll', updateVideoByScroll, { passive: true });
        updateVideoByScroll();
        // 监听播放/暂停，更新云朵显示
        if (soundBubble) {
            video.addEventListener('play', function () {
                if (video.volume > 0) soundBubble.classList.remove('show');
            });
            video.addEventListener('pause', function () {
                if (soundHint && !soundHint.classList.contains('hidden')) soundBubble.classList.add('show');
            });
        }
    }

    // 4. 导航栏：滚动时才显示
    if (nav) {
        var SCROLL_THRESHOLD = 80;
        function onScroll() {
            if (window.scrollY > SCROLL_THRESHOLD) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

})();

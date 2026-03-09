document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* 1. 卡片滚动渐入渐出：进入视口渐渐出现，离开渐渐消失 */
    gsap.utils.toArray('.gs-reveal').forEach(function (elem) {
        gsap.fromTo(elem,
            { y: 80, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 90%",
                    end: "top 30%",
                    scrub: 1.2,
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    /* 2. 刀片扇形展开：第四列全高布局，上5向内、下5向外 */
    const R_top = 72;
    const R_bottom = 100;
    const deg90 = 90 / 4;
    const toRad = (d) => (d * Math.PI) / 180;

    const topBlades = [0, 1, 2, 3, 4].map((i) => {
        const deg = deg90 * i;
        const rad = toRad(deg);
        return {
            el: `.t-b${i + 1}-wrap`,
            x: R_top * Math.cos(rad),
            y: R_top * Math.sin(rad),
            rot: deg
        };
    });

    /* 下方：同角度分布，半径 R_bottom 略大以拉开间距 */
    const bottomBlades = [0, 1, 2, 3, 4].map((i) => {
        const deg = deg90 * i;
        const rad = toRad(deg);
        const scaleFlip = i >= 1; /* 刀片 7～10 用 scaleX 翻转使刀尖朝外 */
        const rotExtra = i === 0 ? 180 : 0; /* 刀片 6 再旋转 180° */
        return {
            el: `.b-b${i + 1}-wrap`,
            x: -R_bottom * Math.cos(rad),
            y: -R_bottom * Math.sin(rad),
            rot: 180 + deg + rotExtra,
            scaleX: scaleFlip ? -1 : 1
        };
    });

    gsap.set('.blade-wrap', { rotation: 0, x: 0, y: 0 });

    const headsEl = document.querySelector('.module-heads');
    const bladeEls = document.querySelectorAll('.blade');
    if (headsEl && bladeEls.length) {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".module-heads",
            start: "top 85%",
            end: "top 25%",
            scrub: 1.5,
            toggleActions: "play none none reverse"
        }
    });

    /* 刀片扇子式逐个出现：上5从第一个开始依次展开，下5同理 */
    topBlades.forEach((b, i) => {
        tl.to(b.el + ' .blade', { opacity: 1, duration: 0.08 }, i * 0.12);
        tl.to(b.el, { x: b.x, y: b.y, rotation: b.rot, duration: 0.6, ease: "back.out(1.5)" }, i * 0.12);
    });
    bottomBlades.forEach((b, i) => {
        tl.to(b.el + ' .blade', { opacity: 1, duration: 0.08 }, topBlades.length * 0.12 + i * 0.12);
        tl.to(b.el, { x: b.x, y: b.y, rotation: b.rot, scaleX: b.scaleX, duration: 0.6, ease: "back.out(1.5)" }, topBlades.length * 0.12 + i * 0.12);
    });
    }

    /* 3. 70W 模块：先文字溅出，再刀从右侧滑入穿过文字 */
    const mod70w = document.querySelector('[data-70w-anim]');
    if (mod70w) {
        gsap.set(mod70w, { opacity: 0 });
        gsap.set(mod70w.querySelectorAll('.sub, .big-num'), { opacity: 0, scale: 0.92 });
        gsap.set(mod70w.querySelector('.knife-img'), { opacity: 1, xPercent: 80, yPercent: -50, scale: 1 });

        const tl70w = gsap.timeline({
            scrollTrigger: {
                trigger: mod70w,
                start: "top 90%",
                end: "top 30%",
                scrub: 1.2,
                toggleActions: "play none none reverse"
            }
        });
        tl70w.to(mod70w, { opacity: 1, duration: 0.2, ease: "none" });
        tl70w.to(mod70w.querySelectorAll('.sub, .big-num'), { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, 0);
        tl70w.to(mod70w.querySelector('.knife-img'), { xPercent: -22, yPercent: -50, duration: 1, ease: "power3.in" }, 0.5);
    }

    /* 4. 技术图表区：使用 gs-reveal 统一出场/退场动画（已在上面 forEach 中处理） */

    /* 5. 三种焊头：进度条横向填充 -> 垂直展开的丝滑动画 */
    const weldingHeads = document.querySelector('[data-welding-heads]');
    const weldingDetail = document.querySelector('.a-welding-detail');

    if (weldingHeads && weldingDetail) {
        const cards = weldingHeads.querySelectorAll('.a-welding-head-card');

        // 创建绑定滚动的整段动画时间线
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: weldingHeads,
                start: "top 75%",     // 当模块到达视口 75% 处开始
                end: "+=2000",        // 滚动锁定距离，数值越大动画越慢越细腻
                pin: weldingDetail,   // 锁定外层容器
                pinSpacing: true,
                scrub: 1,             // Scrub: 1 让动画跟手且带有一点丝滑惯性
                anticipatePin: 1,     // 预计算 pin 位置，减少 unpin 时的布局跳动
                onEnter: () => weldingDetail.classList.add('is-pinned'),
                onEnterBack: () => weldingDetail.classList.add('is-pinned'),
                onLeave: () => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => weldingDetail.classList.remove('is-pinned'));
                    });
                },
                onLeaveBack: () => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => weldingDetail.classList.remove('is-pinned'));
                    });
                }
            }
        });

        // 遍历三张卡片，加入时间线实现错峰动画 (Stagger)
        cards.forEach((card, i) => {
            const wrap = card.querySelector('.a-welding-head-panel-wrap');
            const bg = card.querySelector('.a-welding-head-panel-bg');
            const content = card.querySelector('.a-welding-head-panel-content');
            const arrow = card.querySelector('.a-welding-head-arrow');

            // 错位启动时间：第一张 0，第二张等第一张走了一半(0.4)就开始，依次错开
            const startTime = i * 0.4; 

            // 第一阶段：背景条从左到右填满 (宽 0 -> 100%)
            tl.to(bg, { 
                width: "100%", 
                duration: 0.5, 
                ease: "power1.inOut" 
            }, startTime);

            // 第二阶段：容器向下展开 (高 14px -> auto 原生高度)
            tl.to(wrap, { 
                height: "auto", 
                duration: 0.4, 
                ease: "power2.out" 
            }, startTime + 0.5);

            // 箭头反转指示展开
            tl.to(arrow, { 
                rotation: -180, 
                duration: 0.4, 
                ease: "power2.out" 
            }, startTime + 0.5);

            // 第三阶段：文字与图片渐入
            tl.to(content, { 
                opacity: 1, 
                duration: 0.3, 
                ease: "none" 
            }, startTime + 0.6);
        });
    }

    /* 页面加载完成后刷新 ScrollTrigger（图片等资源可能影响布局） */
    window.addEventListener('load', function () {
        ScrollTrigger.refresh();
    });
});

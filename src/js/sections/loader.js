// /src/js/sections/loader.js
import gsap from 'gsap';
import { stopScroll, startScroll } from '../lib/scroll.js';
import { setTone } from '../lib/tone.js';
import { PALETTE } from '../lib/botanicals.js';

export function runLoader() {
  return new Promise((resolve) => {
    stopScroll();

    const loaderEl = document.querySelector('.verdant-loader');
    if (!loaderEl) {
      startScroll();
      setTone('sage', true);
      resolve();
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      loaderEl.style.display = 'none';
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        heroEl.classList.remove('hero-hidden');
        heroEl.style.opacity = '1';
        heroEl.style.visibility = 'visible';
      }
      const dockWrap = document.querySelector('.verdant-dock-wrap');
      if (dockWrap) {
        dockWrap.style.transform = 'translateX(-50%) translateY(0)';
        dockWrap.style.opacity = '1';
      }
      setTone('sage', true);
      startScroll();
      resolve();
      return;
    }

    const seed = loaderEl.querySelector('.loader-seed');
    const stem = loaderEl.querySelector('.loader-stem');
    const leafLeft = loaderEl.querySelector('.loader-leaf-left');
    const leafRight = loaderEl.querySelector('.loader-leaf-right');
    const bud = loaderEl.querySelector('.loader-bud');
    const wordmark = loaderEl.querySelector('.loader-wordmark');
    const revealCircle = loaderEl.querySelector('.loader-reveal-circle');

    // Total length of the stem path for stroke-dashoffset drawing
    const stemLength = stem.getTotalLength ? stem.getTotalLength() : 110;
    gsap.set(stem, {
      strokeDasharray: stemLength,
      strokeDashoffset: stemLength,
      opacity: 0
    });

    gsap.set(seed, { y: -90, opacity: 0 });
    gsap.set([leafLeft, leafRight], { scale: 0, opacity: 0, transformOrigin: '0% 100%' });
    gsap.set(leafLeft, { transformOrigin: '40px 65px' });
    gsap.set(leafRight, { transformOrigin: '40px 65px' });
    gsap.set(bud, { scale: 0, opacity: 0, transformOrigin: '40px 20px' });
    gsap.set(revealCircle, { scale: 0 });

    let isFinished = false;

    // Failsafe timer (6s) forces loader off and shows the page completely
    const failsafeTimer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        tl.kill();
        loaderEl.style.display = 'none';
        const heroEl = document.getElementById('hero');
        if (heroEl) {
          heroEl.classList.remove('hero-hidden');
          heroEl.style.opacity = '1';
          heroEl.style.visibility = 'visible';
        }
        const dockWrap = document.querySelector('.verdant-dock-wrap');
        if (dockWrap) {
          dockWrap.style.transform = 'translateX(-50%) translateY(0)';
          dockWrap.style.opacity = '1';
        }
        setTone('sage', true);
        startScroll();
        resolve();
      }
    }, 6000);

    const tl = gsap.timeline({
      onComplete: () => {
        if (isFinished) return;
        isFinished = true;
        clearTimeout(failsafeTimer);

        // Transition tone to sage
        setTone('sage', true);
        startScroll();

        // Remove loader from view
        gsap.to(loaderEl, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            loaderEl.style.display = 'none';
            resolve();
          }
        });
      }
    });

    // Wait for fonts alongside the timeline
    const fontsReadyPromise = document.fonts ? document.fonts.ready : Promise.resolve();

    // 1. Clay seed drops onto soil with soft bounce (~0.6s)
    tl.to(seed, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'bounce.out'
    });

    // 2. Stem draws upward
    tl.to(stem, {
      opacity: 1,
      strokeDashoffset: 0,
      duration: 0.85,
      ease: 'power2.inOut'
    }, '-=0.2');

    // 3. Two leaves unfurl with elastic rotation and scale
    tl.to(leafLeft, {
      opacity: 1,
      scale: 1,
      rotation: -28,
      duration: 0.8,
      ease: 'elastic.out(1.2, 0.4)'
    }, '-=0.4');

    tl.to(leafRight, {
      opacity: 1,
      scale: 1,
      rotation: 28,
      duration: 0.8,
      ease: 'elastic.out(1.2, 0.4)'
    }, '-=0.7');

    // Bud at tip appears
    tl.to(bud, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: 'back.out(2)'
    }, '-=0.4');

    // 4. Wordmark fades up gently
    tl.to(wordmark, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.4');

    // Wait for fonts to finish loading before expanding
    tl.add(async () => {
      await fontsReadyPromise;
    });

    // 5. Expand sage circle clip-path from bud tip to cover the whole viewport
    tl.to(revealCircle, {
      scale: 180,
      duration: 0.9,
      ease: 'power3.inOut'
    }, '+=0.2');
  });
}

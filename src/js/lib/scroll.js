// /src/js/lib/scroll.js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initScrollEngine() {
  if (lenisInstance) return lenisInstance;

  // Exactly ONE Lenis instance driven by gsap ticker
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
    autoRaf: false // We drive Lenis strictly from the GSAP ticker
  });

  // Connect Lenis to ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  // Drive Lenis from the GSAP ticker
  const tickerCallback = (time) => {
    if (!document.hidden) {
      lenisInstance.raf(time * 1000);
    }
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  // Pause every animation & ticker when document is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      gsap.ticker.sleep();
    } else {
      gsap.ticker.wake();
      ScrollTrigger.refresh();
    }
  });

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}

export function stopScroll() {
  if (lenisInstance) {
    lenisInstance.stop();
  }
}

export function startScroll() {
  if (lenisInstance) {
    lenisInstance.start();
  }
}

export function scrollToAnchor(target, options = {}) {
  if (!lenisInstance) return;
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  lenisInstance.scrollTo(element, {
    offset: options.offset ?? -96,
    duration: options.duration ?? 1.4,
    easing: (t) => (t < 0.5 ? 8 * Math.pow(2, 10 * (t - 1)) : 1 - 8 * Math.pow(2, -10 * t)) // expo.inOut
  });
}

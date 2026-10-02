// /src/js/lib/magnetic.js
import gsap from 'gsap';

/**
 * Attaches magnetic interaction to elements with [data-magnetic] or selector
 * Pulls slightly toward cursor within magnetic radius (90px) and springs back.
 */
export function initMagneticElements(selector = '[data-magnetic]') {
  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
    return;
  }

  const elements = document.querySelectorAll(selector);

  elements.forEach((el) => {
    let bounds = el.getBoundingClientRect();
    const radius = 90;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' });

    function onMouseMove(e) {
      bounds = el.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < radius) {
        // Magnetic pull
        const strength = 0.35;
        xTo(deltaX * strength);
        yTo(deltaY * strength);
      } else {
        // Springy return
        xTo(0);
        yTo(0);
      }
    }

    function onMouseLeave() {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'elastic.out(1.1, 0.4)'
      });
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave);
  });
}

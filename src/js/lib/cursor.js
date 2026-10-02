// /src/js/lib/cursor.js
import gsap from 'gsap';

export function initCursor() {
  // Disable on touch devices or fine pointer absent
  if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
    return { destroy: () => {} };
  }

  const cursorContainer = document.createElement('div');
  cursorContainer.className = 'verdant-cursor-wrap';
  cursorContainer.innerHTML = `
    <div class="verdant-cursor-blob">
      <span class="verdant-cursor-label"></span>
    </div>
    <div class="verdant-cursor-dot"></div>
  `;
  document.body.appendChild(cursorContainer);

  const dot = cursorContainer.querySelector('.verdant-cursor-dot');
  const blob = cursorContainer.querySelector('.verdant-cursor-blob');
  const label = cursorContainer.querySelector('.verdant-cursor-label');

  // GSAP quickTo for ultra-fluid responsive tracking
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });

  const blobX = gsap.quickTo(blob, 'x', { duration: 0.35, ease: 'power2.out' });
  const blobY = gsap.quickTo(blob, 'y', { duration: 0.35, ease: 'power2.out' });

  let isHovering = false;
  let isVisible = false;

  // Organic blob morph animation
  const morphFrames = [
    '60% 40% 30% 70% / 60% 30% 70% 40%',
    '40% 60% 70% 30% / 40% 70% 30% 60%',
    '50% 50% 35% 65% / 55% 45% 55% 45%',
    '65% 35% 55% 45% / 35% 65% 45% 55%'
  ];
  let frameIdx = 0;
  gsap.to(blob, {
    duration: 3.5,
    repeat: -1,
    ease: 'sine.inOut',
    onRepeat: () => {
      frameIdx = (frameIdx + 1) % morphFrames.length;
      blob.style.borderRadius = morphFrames[frameIdx];
    }
  });

  function onMouseMove(e) {
    if (!isVisible) {
      isVisible = true;
      gsap.to(cursorContainer, { opacity: 1, duration: 0.25 });
    }
    const { clientX: x, clientY: y } = e;
    dotX(x);
    dotY(y);
    blobX(x);
    blobY(y);
  }

  function onMouseLeave() {
    isVisible = false;
    gsap.to(cursorContainer, { opacity: 0, duration: 0.25 });
  }

  function onMouseEnter() {
    isVisible = true;
    gsap.to(cursorContainer, { opacity: 1, duration: 0.25 });
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onMouseLeave);
  document.documentElement.addEventListener('mouseenter', onMouseEnter);

  // Delegate hover states for interactive elements
  const onPointerOver = (e) => {
    const target = e.target.closest('[data-cursor], button, a, .interactive, .hero-blob-stage');
    if (target) {
      isHovering = true;
      const customLabel = target.getAttribute('data-cursor') || (target.tagName === 'A' ? 'EXPLORE' : 'VIEW');
      label.textContent = customLabel;
      gsap.to(blob, {
        width: 88,
        height: 88,
        scale: 1,
        opacity: 0.85,
        duration: 0.3,
        ease: 'power3.out'
      });
      gsap.to(label, { opacity: 1, scale: 1, duration: 0.2 });
      gsap.to(dot, { scale: 0, opacity: 0, duration: 0.2 });
    }
  };

  const onPointerOut = (e) => {
    const target = e.target.closest('[data-cursor], button, a, .interactive, .hero-blob-stage');
    if (target) {
      isHovering = false;
      label.textContent = '';
      gsap.to(blob, {
        width: 56,
        height: 56,
        scale: 1,
        opacity: 0.22,
        duration: 0.3,
        ease: 'power3.out'
      });
      gsap.to(label, { opacity: 0, scale: 0.8, duration: 0.15 });
      gsap.to(dot, { scale: 1, opacity: 1, duration: 0.2 });
    }
  };

  document.addEventListener('mouseover', onPointerOver);
  document.addEventListener('mouseout', onPointerOut);

  return {
    destroy() {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onPointerOver);
      document.removeEventListener('mouseout', onPointerOut);
      cursorContainer.remove();
    }
  };
}

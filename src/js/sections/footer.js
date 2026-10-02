// /src/js/sections/footer.js
// PART D: FOOTER (tone moss, padding 140px top, 40px bottom)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { botanicals } from '../lib/botanicals.js';
import { scrollToAnchor, getLenis } from '../lib/scroll.js';

export function setupFooter(footerEl) {
  if (!footerEl) return;

  const gardenStage = footerEl.querySelector('.footer-garden-stage');
  const quizBtn = footerEl.querySelector('.footer-quiz-pill');
  const shopBtn = footerEl.querySelector('.footer-shop-pill');
  const backToTopBtn = footerEl.querySelector('.footer-back-to-top');

  // Newsletter form elements
  const newsForm = footerEl.querySelector('.newsletter-form-row');
  const newsInput = footerEl.querySelector('.newsletter-input');
  const newsSubmit = footerEl.querySelector('.newsletter-submit-btn');
  const newsError = footerEl.querySelector('.newsletter-error-msg');
  const newsSuccess = footerEl.querySelector('.newsletter-success-state');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Build the 7 Growing Garden Sprigs
  const sprigTypes = [
    { type: 'fern', h: 140, w: 90, hasBlossom: false },
    { type: 'eucalyptus', h: 175, w: 110, hasBlossom: true },
    { type: 'olive', h: 130, w: 95, hasBlossom: false },
    { type: 'rosemary', h: 160, w: 100, hasBlossom: true },
    { type: 'fern', h: 150, w: 95, hasBlossom: false },
    { type: 'eucalyptus', h: 180, w: 115, hasBlossom: true },
    { type: 'olive', h: 145, w: 100, hasBlossom: false }
  ];

  if (gardenStage) {
    gardenStage.innerHTML = `
      <div class="garden-soil-line"></div>
      ${sprigTypes.map((s, i) => {
        const renderFn = botanicals[s.type] || botanicals.eucalyptus;
        const svgStr = renderFn({ width: s.w, height: s.h });
        return `
          <div class="garden-sprig-item sprig-${i}" data-index="${i}" style="height: ${s.h}px;">
            ${svgStr}
            ${s.hasBlossom ? '<div class="garden-sprig-blossom" aria-hidden="true"></div>' : ''}
          </div>
        `;
      }).join('')}
    `;
  }

  const sprigEls = Array.from(footerEl.querySelectorAll('.garden-sprig-item'));
  const blossoms = Array.from(footerEl.querySelectorAll('.garden-sprig-blossom'));

  // 2. Garden Growth Scrubbed Animation via ScrollTrigger
  if (!prefersReduced && sprigEls.length > 0) {
    const gardenTL = gsap.timeline({
      scrollTrigger: {
        trigger: gardenStage,
        start: 'top 95%',
        end: 'bottom 75%',
        scrub: 1
      }
    });

    sprigEls.forEach((sprig, i) => {
      gardenTL.fromTo(sprig,
        { scaleY: 0, scaleX: 0.3, rotation: (i % 2 === 0 ? -12 : 12), opacity: 0.2 },
        { scaleY: 1, scaleX: 1, rotation: 0, opacity: 1, ease: 'power2.out' },
        i * 0.08
      );
    });

    blossoms.forEach((b, i) => {
      gardenTL.to(b, {
        scale: 1,
        ease: 'back.out(2)',
        duration: 0.2
      }, 0.5 + i * 0.1);
    });
  } else {
    // prefers-reduced-motion: full grown immediately
    sprigEls.forEach(s => gsap.set(s, { scale: 1, opacity: 1 }));
    blossoms.forEach(b => gsap.set(b, { scale: 1 }));
  }

  // 3. Interactive Sprig Deflection (quickTo, max 12deg, radius 160px) & Idle Sway on GSAP Ticker
  let isFooterVisible = false;
  const quickRotators = sprigEls.map(sprig => gsap.quickTo(sprig, 'rotation', { duration: 0.5, ease: 'power2.out' }));
  let mouseSprigRotations = sprigEls.map(() => 0);

  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (gardenStage && !prefersReduced && !isTouch) {
    gardenStage.addEventListener('mousemove', (e) => {
      const rect = gardenStage.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      sprigEls.forEach((sprig, i) => {
        const sRect = sprig.getBoundingClientRect();
        const baseCenterX = sRect.left + sRect.width / 2;
        const baseCenterY = sRect.bottom;

        const dist = Math.hypot(mouseX - baseCenterX, mouseY - baseCenterY);
        if (dist < 160) {
          const strength = (1 - dist / 160);
          const dir = mouseX < baseCenterX ? 1 : -1;
          mouseSprigRotations[i] = dir * strength * 14;
        } else {
          mouseSprigRotations[i] = 0;
        }
      });
    });

    gardenStage.addEventListener('mouseleave', () => {
      mouseSprigRotations = mouseSprigRotations.map(() => 0);
    });
  }

  // Shared GSAP ticker callback for idle sway, paused when footer is offscreen
  const swayCallback = (time) => {
    if (!isFooterVisible || prefersReduced) return;
    sprigEls.forEach((_, i) => {
      const idle = Math.sin(time * 1.8 + i * 1.3) * 2.2;
      const targetRot = idle + (mouseSprigRotations[i] || 0);
      quickRotators[i](targetRot);
    });
  };

  gsap.ticker.add(swayCallback);

  ScrollTrigger.create({
    trigger: footerEl,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => { isFooterVisible = true; },
    onEnterBack: () => { isFooterVisible = true; },
    onLeave: () => { isFooterVisible = false; },
    onLeaveBack: () => { isFooterVisible = false; }
  });

  // 4. Word reveal for headline
  const headline = footerEl.querySelector('.footer-headline');
  if (headline && !prefersReduced) {
    gsap.fromTo(headline,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headline,
          start: 'top 85%',
          once: true
        }
      }
    );
  }

  // 5. Buttons: Quiz & Shop
  if (quizBtn) {
    quizBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('quiz:open'));
    });
  }

  if (shopBtn) {
    shopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToAnchor('#shop');
    });
  }

  // 6. Navigation anchors with Lenis smooth scroll
  const navLinks = footerEl.querySelectorAll('.footer-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          scrollToAnchor(target, { offset: -96, duration: 1.4 });
        }
      }
    });
  });

  // 7. Newsletter Validation & Success
  function handleNewsletterSubmit() {
    if (!newsInput) return;
    const email = newsInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      if (newsError) {
        newsError.textContent = 'Please enter a valid botanical correspondence address.';
        newsError.classList.add('visible');
      }
      return;
    }

    if (newsError) newsError.classList.remove('visible');
    if (newsForm) newsForm.style.display = 'none';
    if (newsSuccess) newsSuccess.classList.add('visible');
  }

  if (newsSubmit) {
    newsSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      handleNewsletterSubmit();
    });
  }

  if (newsInput) {
    newsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNewsletterSubmit();
      }
    });
  }

  // 8. Back to Top Button (magnetic, Lenis 1.6s expo.inOut)
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, {
          duration: 1.6,
          easing: (t) => (t < 0.5 ? 8 * Math.pow(2, 10 * (t - 1)) : 1 - 8 * Math.pow(2, -10 * t))
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

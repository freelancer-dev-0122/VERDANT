// /src/js/sections/testimonials.js
// PART C: TESTIMONIALS (tone sage, padding 140px top/bottom)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { drawProduct } from '../lib/botanicals.js';

export const reviews = [
  {
    id: 1,
    quote: '“Dew Serum changed my winter skin entirely. The redness around my cheeks softened within a week of morning use.”',
    name: 'Elena Rostova',
    skin: 'Reactive & Dry',
    productId: 'dew-serum',
    productName: 'Dew Serum'
  },
  {
    id: 2,
    quote: '“I was skeptical of a 12-ingredient list until I touched Moss Cream. Pure cellular nourishment with zero greasy film.”',
    name: 'Marcus Vance',
    skin: 'Combination & Sensitive',
    productId: 'moss-cream',
    productName: 'Moss Cream'
  },
  {
    id: 3,
    quote: '“The Clay Cleanser does not strip or tighten. My barrier feels calm and balanced even in sub-zero morning winds.”',
    name: 'Sarah Lin',
    skin: 'Dehydrated Barrier',
    productId: 'clay-cleanser',
    productName: 'Clay Cleanser'
  },
  {
    id: 4,
    quote: '“Petal Mist is my studio companion between deep focus sessions. The botanical rose scent is grounding and restorative.”',
    name: 'Amara Diallo',
    skin: 'Stressed & Dull',
    productId: 'petal-mist',
    productName: 'Petal Mist'
  },
  {
    id: 5,
    quote: '“Receiving the ritual bundle simplified my entire morning routine. No redundant clutter, just quiet daily results.”',
    name: 'Julian Thorne',
    skin: 'Sensitive & Dry',
    productId: 'dew-serum',
    productName: 'Ritual Bundle'
  }
];

export function setupTestimonials(sectionEl) {
  if (!sectionEl) return;

  const stage = sectionEl.querySelector('.testimonials-stack-stage');
  const counterEl = sectionEl.querySelector('.testimonials-counter');
  const prevBtn = sectionEl.querySelector('.testimonials-prev-btn');
  const nextBtn = sectionEl.querySelector('.testimonials-next-btn');
  const barFills = sectionEl.querySelectorAll('.rating-bar-fill');

  if (!stage) return;

  // Stacking parameters for 5 cards: rotation & offset
  const stackConfigs = [
    { rot: 0, scale: 1, y: 0, opacity: 1 },
    { rot: -4, scale: 0.96, y: 12, opacity: 0.9 },
    { rot: 3, scale: 0.92, y: 24, opacity: 0.8 },
    { rot: -2, scale: 0.88, y: 36, opacity: 0.7 },
    { rot: 5, scale: 0.84, y: 48, opacity: 0.55 }
  ];

  let order = [0, 1, 2, 3, 4]; // Current card indices from top to bottom
  let isAnimating = false;
  let autoTimer = null;
  let isPaused = false;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Render cards initially
  stage.innerHTML = reviews.map((rev, i) => `
    <div class="review-card" data-idx="${i}" data-cursor="DRAG" tabindex="0" role="region" aria-label="Review by ${rev.name}">
      <div>
        <div class="review-stars-row" aria-label="5 out of 5 stars">
          ${Array.from({ length: 5 }).map(() => `
            <svg class="review-star-svg" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          `).join('')}
        </div>
        <blockquote class="review-quote">${rev.quote}</blockquote>
      </div>

      <div class="review-author-row">
        <div class="review-author-left">
          <div class="review-prod-thumb">
            ${drawProduct(rev.productId, { width: 36, height: 36 })}
          </div>
          <div class="review-author-details">
            <span class="review-author-name">${rev.name}</span>
            <span class="review-author-skin">${rev.skin} • ${rev.productName}</span>
          </div>
        </div>
        <span class="review-verified-pill">Verified Buyer</span>
      </div>
    </div>
  `).join('');

  const cardEls = Array.from(stage.querySelectorAll('.review-card'));

  function updateCardPositions(animate = true) {
    order.forEach((cardIdx, stackPos) => {
      const card = cardEls[cardIdx];
      const cfg = stackConfigs[stackPos];
      const z = 10 - stackPos;

      card.style.zIndex = z;
      card.setAttribute('aria-hidden', stackPos === 0 ? 'false' : 'true');

      if (!animate || prefersReduced) {
        gsap.set(card, {
          x: 0,
          y: cfg.y,
          rotation: cfg.rot,
          scale: cfg.scale,
          opacity: cfg.opacity
        });
      } else {
        gsap.to(card, {
          x: 0,
          y: cfg.y,
          rotation: cfg.rot,
          scale: cfg.scale,
          opacity: cfg.opacity,
          duration: 0.6,
          ease: 'power3.out'
        });
      }
    });

    if (counterEl) {
      const topIdx = order[0] + 1;
      counterEl.textContent = `0${topIdx} / 05`;
    }
  }

  updateCardPositions(false);

  // Animate rating breakdown bars on enter
  if (barFills.length > 0) {
    ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top 65%',
      once: true,
      onEnter: () => {
        barFills.forEach(bar => {
          const width = bar.dataset.pct || '90%';
          bar.style.width = width;
        });
      }
    });
  }

  // Fling top card next
  function flingNext(customVx = 1) {
    if (isAnimating) return;
    isAnimating = true;

    const topIdx = order[0];
    const topCard = cardEls[topIdx];
    const direction = customVx >= 0 ? 1 : -1;

    if (prefersReduced) {
      order.push(order.shift());
      updateCardPositions(false);
      isAnimating = false;
      return;
    }

    gsap.to(topCard, {
      x: direction * (window.innerWidth > 768 ? 480 : 320),
      rotation: direction * 25,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        // Shift array: top moves to back
        order.push(order.shift());
        gsap.set(topCard, { x: 0, y: stackConfigs[4].y, rotation: stackConfigs[4].rot, scale: stackConfigs[4].scale, opacity: 0 });
        updateCardPositions(true);
        setTimeout(() => {
          isAnimating = false;
        }, 300);
      }
    });
  }

  // Prev card (bring back card to top)
  function flingPrev() {
    if (isAnimating) return;
    isAnimating = true;

    // Last card becomes first
    const lastIdx = order.pop();
    order.unshift(lastIdx);
    const newTop = cardEls[lastIdx];

    if (prefersReduced) {
      updateCardPositions(false);
      isAnimating = false;
      return;
    }

    gsap.fromTo(newTop,
      { x: -360, rotation: -20, opacity: 0, scale: 0.9 },
      {
        x: 0,
        rotation: 0,
        opacity: 1,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
        onComplete: () => {
          isAnimating = false;
        }
      }
    );
    updateCardPositions(true);
  }

  // Pointer drag on top card
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;

  function onPointerDown(e) {
    if (isAnimating) return;
    const topCard = cardEls[order[0]];
    if (!topCard.contains(e.target)) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    currentX = 0;
    pauseAuto();

    topCard.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    currentX = dx;
    const topCard = cardEls[order[0]];

    const rot = (dx / 300) * 15;
    gsap.set(topCard, {
      x: dx,
      rotation: rot
    });
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    resumeAuto();

    const topCard = cardEls[order[0]];
    try {
      topCard.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (Math.abs(currentX) > 120) {
      flingNext(currentX);
    } else {
      // Spring back
      gsap.to(topCard, {
        x: 0,
        rotation: 0,
        duration: 0.45,
        ease: 'elastic.out(1, 0.6)'
      });
    }
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      pauseAuto();
      flingNext(1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      pauseAuto();
      flingPrev();
    });
  }

  // Keyboard navigation when card or controls are focused
  sectionEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      pauseAuto();
      flingNext(1);
    } else if (e.key === 'ArrowLeft') {
      pauseAuto();
      flingPrev();
    }
  });

  // 7-second auto advance while visible
  function startAuto() {
    if (prefersReduced || autoTimer) return;
    autoTimer = setInterval(() => {
      if (!isPaused && !isDragging) {
        flingNext(1);
      }
    }, 7000);
  }

  function pauseAuto() {
    isPaused = true;
  }

  function resumeAuto() {
    isPaused = false;
  }

  // Pause on hover, focus & touch
  stage.addEventListener('mouseenter', pauseAuto);
  stage.addEventListener('mouseleave', resumeAuto);
  stage.addEventListener('focusin', pauseAuto);
  stage.addEventListener('focusout', resumeAuto);
  stage.addEventListener('touchstart', pauseAuto, { passive: true });
  stage.addEventListener('touchend', resumeAuto, { passive: true });

  // ScrollTrigger to start/pause when visible
  ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top 80%',
    end: 'bottom 20%',
    onEnter: startAuto,
    onEnterBack: startAuto,
    onLeave: () => clearInterval(autoTimer),
    onLeaveBack: () => clearInterval(autoTimer)
  });
}

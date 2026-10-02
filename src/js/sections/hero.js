// /src/js/sections/hero.js
import gsap from 'gsap';
import { botanicals, drawProduct } from '../lib/botanicals.js';
import { splitTextIntoMaskedWords, revealMaskedWords } from '../lib/textSplitter.js';
import { scrollToAnchor } from '../lib/scroll.js';

export function setupHero(container) {
  if (!container) return;

  // Insert Products inside Blob
  const productsComposite = container.querySelector('.hero-products-composite');
  if (productsComposite) {
    productsComposite.innerHTML = `
      <div class="hero-product-layer hero-product-jar" data-depth="0.08">
        ${drawProduct('moss-cream')}
      </div>
      <div class="hero-product-layer hero-product-serum" data-depth="0.14">
        ${drawProduct('dew-serum')}
      </div>
      <div class="hero-product-layer hero-product-mist" data-depth="0.1">
        ${drawProduct('petal-mist')}
      </div>
    `;
  }

  // Generate 8-10 Botanical Sprigs with depth values around the blob
  const botanicalsField = container.querySelector('.hero-botanicals-field');
  const botanicalDefs = [
    // [type, top, left, depth, rotation, isFar, scale]
    ['eucalyptus', '12%', '42%', 0.09, -15, true, 0.75],
    ['fern', '18%', '78%', 0.18, 22, false, 1.0],
    ['oliveTwig', '62%', '72%', 0.12, -25, false, 0.95],
    ['monsteraPiece', '74%', '34%', 0.08, 18, true, 0.7],
    ['rosemarySprig', '38%', '88%', 0.15, 12, false, 0.9],
    ['singlePetal', '28%', '36%', 0.22, -35, false, 1.1],
    ['oliveTwig', '8%', '62%', 0.07, 10, true, 0.65],
    ['singlePetal', '82%', '60%', 0.2, 40, false, 1.0],
    ['eucalyptus', '48%', '30%', 0.16, -10, false, 0.85]
  ];

  const sprigElements = [];

  if (botanicalsField) {
    botanicalDefs.forEach(([type, top, left, depth, rot, isFar, scale], idx) => {
      const sprig = document.createElement('div');
      sprig.className = `botanical-item ${isFar ? 'far' : 'near'}`;
      sprig.dataset.depth = depth;
      sprig.dataset.baseRot = rot;
      sprig.dataset.baseScale = scale;
      sprig.style.top = top;
      sprig.style.left = left;
      sprig.style.transformOrigin = 'bottom center';

      const svgBuilder = botanicals[type] || botanicals.singlePetal;
      sprig.innerHTML = svgBuilder({
        width: Math.round(90 * scale),
        height: Math.round(140 * scale)
      });

      botanicalsField.appendChild(sprig);
      sprigElements.push(sprig);
    });
  }

  // Center Organic Blob continuous border-radius morph (9s loop, sine.inOut, yoyo)
  const blob = container.querySelector('.hero-organic-blob');
  if (blob) {
    const blobKeyframes = [
      '62% 38% 54% 46% / 44% 58% 42% 56%',
      '42% 58% 36% 64% / 60% 38% 62% 38%',
      '55% 45% 68% 32% / 35% 65% 35% 65%',
      '38% 62% 45% 55% / 52% 48% 64% 36%'
    ];
    let bIdx = 0;
    gsap.to(blob, {
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      onRepeat: () => {
        bIdx = (bIdx + 1) % blobKeyframes.length;
        blob.style.borderRadius = blobKeyframes[bIdx];
      }
    });
  }

  // Floating bob animation for products inside the blob (independent 4 to 6s)
  const serum = container.querySelector('.hero-product-serum');
  const jar = container.querySelector('.hero-product-jar');
  const mist = container.querySelector('.hero-product-mist');

  if (serum) {
    gsap.to(serum, {
      y: -14,
      scale: 1.02,
      duration: 5.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
  if (jar) {
    gsap.to(jar, {
      y: -10,
      scale: 0.72,
      duration: 4.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.6
    });
  }
  if (mist) {
    gsap.to(mist, {
      y: -12,
      scale: 0.88,
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.1
    });
  }

  // Idle sway for sprigs (+-3deg, 5 to 8s sine)
  sprigElements.forEach((sprig, i) => {
    const baseRot = parseFloat(sprig.dataset.baseRot) || 0;
    const dur = 5 + (i % 4) * 0.9;
    gsap.to(sprig, {
      rotation: baseRot + (i % 2 === 0 ? 3.5 : -3.5),
      duration: dur,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.3
    });
  });

  // Parallax tracking with cursor for sprigs (near items max 40px, far max 12px)
  const quickSetters = sprigElements.map((sprig) => {
    const depth = parseFloat(sprig.dataset.depth) || 0.1;
    const isFar = sprig.classList.contains('far');
    const maxPx = isFar ? 12 : 40;
    return {
      xTo: gsap.quickTo(sprig, 'x', { duration: 0.6, ease: 'power2.out' }),
      yTo: gsap.quickTo(sprig, 'y', { duration: 0.6, ease: 'power2.out' }),
      depth,
      maxPx
    };
  });

  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const onMouseMove = (e) => {
    if (window.innerWidth < 768 || isTouch) return; // avoid battery waste on mobile and touch
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;

    quickSetters.forEach((item) => {
      const targetX = normX * item.maxPx * (item.depth / 0.15);
      const targetY = normY * item.maxPx * (item.depth / 0.15);
      item.xTo(targetX);
      item.yTo(targetY);
    });
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Clicking the blob triggers botanical burst and spins orbit ring
  const centerStage = container.querySelector('.hero-center-stage');
  const orbitRing = container.querySelector('.hero-orbit-ring');

  if (centerStage) {
    centerStage.addEventListener('click', () => {
      // 1. Gentle outward burst of botanicals
      sprigElements.forEach((sprig) => {
        const rect = sprig.getBoundingClientRect();
        const stageRect = centerStage.getBoundingClientRect();
        const dirX = (rect.left + rect.width / 2) - (stageRect.left + stageRect.width / 2);
        const dirY = (rect.top + rect.height / 2) - (stageRect.top + stageRect.height / 2);
        const angle = Math.atan2(dirY, dirX);
        const burstDist = 18;

        gsap.to(sprig, {
          x: `+=${Math.cos(angle) * burstDist}`,
          y: `+=${Math.sin(angle) * burstDist}`,
          duration: 0.35,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        });
      });

      // 2. Blob soft squash & stretch
      gsap.to(blob, {
        scale: 1.08,
        duration: 0.25,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });

      // 3. Spin orbit ring once
      if (orbitRing) {
        gsap.to(orbitRing, {
          rotation: '+=360',
          duration: 1.2,
          ease: 'power3.out'
        });
      }
    });
  }

  // Text link "Shop the collection" smooth scrolls to #shop
  const shopLink = container.querySelector('.hero-link-shop');
  if (shopLink) {
    shopLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToAnchor('#shop');
    });
  }

  // Cart button opens cart drawer
  const cartBtn = container.querySelector('.hero-cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('cart:open'));
    });
  }

  // Quiz button dispatches "quiz:open"
  const quizBtn = container.querySelector('.hero-btn-moss');
  if (quizBtn) {
    quizBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('quiz:open'));
    });
  }

  // Badge wobbles on hover
  const badges = container.querySelectorAll('.hero-sticker-badge');
  badges.forEach((badge) => {
    badge.addEventListener('mouseenter', () => {
      gsap.to(badge, {
        rotation: (Math.random() - 0.5) * 20,
        scale: 1.15,
        duration: 0.3,
        ease: 'back.out(2)'
      });
    });
    badge.addEventListener('mouseleave', () => {
      gsap.to(badge, {
        rotation: badge.classList.contains('badge-vegan') ? -7 : badge.classList.contains('badge-refillable') ? 6 : 8,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  });

  // Return entrance animation controller (called strictly after loader completes)
  return {
    enter() {
      container.classList.remove('hero-hidden');
      gsap.set(container, { opacity: 1, visibility: 'visible' });

      const tl = gsap.timeline();

      // 1. Top row entrance
      const topRow = container.querySelector('.hero-top-row');
      tl.from(topRow, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      // 2. Blob & Products grow in
      tl.from(centerStage, {
        scale: 0.7,
        opacity: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)'
      }, '-=0.5');

      // 3. Botanical sprigs grow from their base with stagger
      tl.from(sprigElements, {
        scale: 0,
        opacity: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: 'back.out(1.8)'
      }, '-=0.8');

      // 4. Headline masked reveal
      const line1 = container.querySelector('.hero-title-line-1');
      const line2 = container.querySelector('.hero-title-line-2');
      const subhead = container.querySelector('.hero-subhead');
      const ctas = container.querySelector('.hero-cta-group');
      const scrollBadge = container.querySelector('.hero-scroll-badge');

      if (line1 && line2) {
        const words1 = splitTextIntoMaskedWords(line1);
        const words2 = splitTextIntoMaskedWords(line2);
        revealMaskedWords([...words1, ...words2], { delay: 0.1 });
      }

      tl.from([subhead, ctas], {
        y: 24,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.4');

      if (scrollBadge) {
        tl.from(scrollBadge, {
          scale: 0,
          opacity: 0,
          duration: 0.7,
          ease: 'back.out(1.5)'
        }, '-=0.4');
      }

      return tl;
    }
  };
}

// /src/js/sections/shop.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { products, cart } from '../../data/products.js';
import { botanicals, drawProduct } from '../lib/botanicals.js';
import { setTone } from '../lib/tone.js';
import { scrollToAnchor } from '../lib/scroll.js';
import { prefersReducedMotion } from '../lib/textSplitter.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Plain JS state object (no localStorage)
export const shopState = {
  activeCardIndex: 0,
  skinTypes: {
    'dew-serum': 'COMBINATION',
    'moss-cream': 'DRY',
    'clay-cleanser': 'OILY',
    'petal-mist': 'COMBINATION'
  }
};

// Curated ingredients & benefits per product
const productDetails = {
  'dew-serum': {
    ingredients: ['Tremella Mushroom', 'Olive Squalane', 'Wild Sea Kelp'],
    benefits: ['Plumps multi-depth skin reservoirs', 'Restores natural morning luminescence', 'Zero tacky or heavy residue']
  },
  'moss-cream': {
    ingredients: ['Sub-Arctic Lichen', 'Elderberry Wax', 'Blue Tansy'],
    benefits: ['Locks in cellular lipid barrier', 'Instantly soothes redness and flare-ups', 'Protects against harsh climate drying']
  },
  'clay-cleanser': {
    ingredients: ['Glacial Sun-Clay', 'Colloidal Oat Milk', 'Chamomile Water'],
    benefits: ['Purifies pores without barrier stripping', 'Balances excess sebum production', 'Leaves skin velvety, soft and supple']
  },
  'petal-mist': {
    ingredients: ['Alpine Rose Water', 'Witch Hazel Hydrosol', 'Cucumber Bio-Water'],
    benefits: ['Delivers immediate cellular refreshment', 'Balances cutaneous pH balance', 'Acts as unhurried midday skin reset']
  }
};

export function setupShop(section) {
  if (!section) return;

  const deckWrapper = section.querySelector('.shop-deck-wrapper');
  if (!deckWrapper) return;

  // Build the 4 Sticky Product Cards
  deckWrapper.innerHTML = `
    <!-- Sticky Progress Indicator on right -->
    <div class="shop-deck-progress" aria-label="Product deck progress">
      ${products.map((_, i) => `<div class="shop-progress-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
    </div>

    <!-- Cards Container -->
    <div class="shop-cards-container">
      ${products.map((product, idx) => {
        const details = productDetails[product.id];
        return `
          <article class="product-card ${idx === 0 ? 'is-active' : ''}" id="product-card-${idx}" data-index="${idx}" data-id="${product.id}" data-tone="${product.tone}">
            <div class="product-card-overlay"></div>
            
            <!-- LEFT: Blob, Floating Product & Botanicals -->
            <div class="product-card-left" data-cursor="VIEW">
              <div class="product-card-blob tone-${product.tone}"></div>
              
              <div class="product-card-sprig sprig-1">
                ${botanicals.eucalyptus({ width: 75, height: 110 })}
              </div>
              <div class="product-card-sprig sprig-2">
                ${botanicals.oliveTwig({ width: 75, height: 100 })}
              </div>

              <div class="product-card-art-wrap">
                <div class="product-card-svg-container">
                  ${drawProduct(product.id, { width: 230, height: 300 })}
                </div>
              </div>
            </div>

            <!-- RIGHT: Meta, Title, Specs, Skin Selector, Actions -->
            <div class="product-card-right">
              <div class="product-card-meta">${product.no} // ${product.size}</div>
              <h3 class="product-card-title">${product.name}</h3>
              <div class="product-card-tagline">${product.tagline}</div>
              <p class="product-card-desc">${product.description}</p>

              <!-- Key Ingredients Chips -->
              <div class="product-chips-row">
                ${details.ingredients.map(ing => `<span class="product-chip">${ing}</span>`).join('')}
              </div>

              <!-- 3 Benefits with animated check marks -->
              <div class="product-benefits-list">
                ${details.benefits.map(b => `
                  <div class="product-benefit-item">
                    <svg class="benefit-check-svg" viewBox="0 0 24 24">
                      <path class="benefit-check-path" d="M20 6L9 17l-5-5"/>
                    </svg>
                    <span>${b}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Skin-type Selector (Dry / Combination / Oily) -->
              <div class="product-skin-selector" data-id="${product.id}">
                <button type="button" class="skin-type-pill ${shopState.skinTypes[product.id] === 'DRY' ? 'selected' : ''}" data-type="DRY">DRY</button>
                <button type="button" class="skin-type-pill ${shopState.skinTypes[product.id] === 'COMBINATION' ? 'selected' : ''}" data-type="COMBINATION">COMBINATION</button>
                <button type="button" class="skin-type-pill ${shopState.skinTypes[product.id] === 'OILY' ? 'selected' : ''}" data-type="OILY">OILY</button>
              </div>

              <!-- Price & Add Action -->
              <div class="product-card-action-row">
                <div class="product-card-price-wrap">
                  <span class="product-card-price">$${product.price}</span>
                  <span class="product-card-size">/ ${product.size}</span>
                </div>
                <div class="product-card-buttons">
                  <button type="button" class="product-btn-add" data-id="${product.id}" data-cursor="ADD" data-magnetic>
                    <span class="add-btn-text">Add to ritual ↗</span>
                  </button>
                  <a href="#ingredients" class="product-link-ingredients">See ingredients</a>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  const cards = Array.from(deckWrapper.querySelectorAll('.product-card'));
  const progressDots = Array.from(deckWrapper.querySelectorAll('.shop-progress-dot'));

  // Set sticky top offsets per card: top = 96px + index * 28px (desktop) / 72px + index * 16px (mobile)
  function updateCardStickyOffsets() {
    const isMobile = window.innerWidth <= 768;
    cards.forEach((card, idx) => {
      const topOffset = isMobile ? (72 + idx * 16) : (96 + idx * 28);
      card.style.top = `${topOffset}px`;
    });
  }
  updateCardStickyOffsets();
  window.addEventListener('resize', updateCardStickyOffsets);

  // Card Progress Dot Clicks
  progressDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      const targetCard = cards[idx];
      if (targetCard) {
        scrollToAnchor(targetCard, { offset: -80, duration: 1.4 });
      }
    });
  });

  // Skin-type selector clicks
  cards.forEach((card) => {
    const selector = card.querySelector('.product-skin-selector');
    if (!selector) return;
    const prodId = selector.dataset.id;
    const pills = selector.querySelectorAll('.skin-type-pill');

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        shopState.skinTypes[prodId] = pill.dataset.type;
      });
    });
  });

  // Hover Parallax on Botanicals + Slow Product Bob
  cards.forEach((card) => {
    const leftCol = card.querySelector('.product-card-left');
    const sprig1 = card.querySelector('.sprig-1');
    const sprig2 = card.querySelector('.sprig-2');
    const artWrap = card.querySelector('.product-card-svg-container');
    const blob = card.querySelector('.product-card-blob');

    // Blob morphing loop
    if (blob) {
      const morphShapes = [
        '60% 40% 50% 50% / 50% 60% 40% 50%',
        '45% 55% 62% 38% / 58% 42% 58% 42%',
        '54% 46% 40% 60% / 40% 55% 45% 60%'
      ];
      let bIndex = 0;
      gsap.to(blob, {
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        onRepeat: () => {
          bIndex = (bIndex + 1) % morphShapes.length;
          blob.style.borderRadius = morphShapes[bIndex];
        }
      });
    }

    // Slow product bob (0 to -12px)
    if (artWrap) {
      gsap.to(artWrap, {
        y: -12,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // Parallax sprigs inside card on hover
    if (leftCol && sprig1 && sprig2 && !window.matchMedia('(pointer: coarse)').matches) {
      const s1X = gsap.quickTo(sprig1, 'x', { duration: 0.5, ease: 'power2.out' });
      const s1Y = gsap.quickTo(sprig1, 'y', { duration: 0.5, ease: 'power2.out' });
      const s2X = gsap.quickTo(sprig2, 'x', { duration: 0.6, ease: 'power2.out' });
      const s2Y = gsap.quickTo(sprig2, 'y', { duration: 0.6, ease: 'power2.out' });

      leftCol.addEventListener('mousemove', (e) => {
        const rect = leftCol.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        s1X(normX * 30);
        s1Y(normY * 26);
        s2X(-normX * 24);
        s2Y(-normY * 20);
      });

      leftCol.addEventListener('mouseleave', () => {
        s1X(0);
        s1Y(0);
        s2X(0);
        s2Y(0);
      });
    }
  });

  // STACKING & TONE CONTROLLER WITH SCROLLTRIGGER
  cards.forEach((card, idx) => {
    const nextCard = cards[idx + 1];
    const overlay = card.querySelector('.product-card-overlay');
    const product = products[idx];

    // Tone update when card reaches active threshold ("top 55%")
    ScrollTrigger.create({
      trigger: card,
      start: 'top 55%',
      end: () => (nextCard ? 'bottom 55%' : 'bottom 30%'),
      onEnter: () => setActiveCard(idx, product.tone),
      onEnterBack: () => setActiveCard(idx, product.tone)
    });

    // Stacking card scrub: previous card scales to 0.94 and gains 14% moss overlay as next card slides over
    if (nextCard && !prefersReducedMotion) {
      gsap.to(card, {
        scale: 0.94,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: nextCard,
          start: 'top 85%',
          end: 'top 15%',
          scrub: 1
        }
      });

      if (overlay) {
        gsap.to(overlay, {
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1
          }
        });
      }
    }
  });

  function setActiveCard(index, tone) {
    if (shopState.activeCardIndex === index && document.body.getAttribute('data-tone') === tone) {
      return;
    }
    shopState.activeCardIndex = index;

    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === index);
    });

    progressDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    setTone(tone);
  }

  // ADD TO RITUAL: Fly-to-cart animation, counter bounce, "Added ✓" state, leaf confetti
  const addButtons = deckWrapper.querySelectorAll('.product-btn-add');
  addButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prodId = btn.dataset.id;
      const product = products.find(p => p.id === prodId);
      if (!product) return;

      // Add to store (emits "cart:change", does not open drawer)
      cart.add(prodId, 1);

      // 1. Fly to cart arc animation
      playFlyToCart(btn, prodId);

      // 2. Leaf confetti
      spawnLeafConfetti(btn);

      // 3. Button state toggle "Added ✓" for 1.4s
      const labelSpan = btn.querySelector('.add-btn-text');
      const prevText = labelSpan ? labelSpan.textContent : 'Add to ritual ↗';
      btn.classList.add('added');
      if (labelSpan) labelSpan.textContent = 'Added ✓';

      setTimeout(() => {
        btn.classList.remove('added');
        if (labelSpan) labelSpan.textContent = prevText;
      }, 1400);
    });
  });

  // Closing strip quiz button
  const quizPill = section.querySelector('.shop-quiz-pill');
  if (quizPill) {
    quizPill.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('quiz:open'));
    });
  }
}

/**
 * Curved flight arc from button to dock cart icon
 */
function playFlyToCart(sourceBtn, productId) {
  if (prefersReducedMotion) return;

  const btnRect = sourceBtn.getBoundingClientRect();
  const dockCart = document.querySelector('.dock-item[data-target="cart"]') || document.querySelector('.hero-cart-btn');
  const targetRect = dockCart ? dockCart.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 40 };

  const startX = btnRect.left + btnRect.width / 2;
  const startY = btnRect.top + btnRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const flyClone = document.createElement('div');
  flyClone.className = 'cart-fly-clone';
  flyClone.innerHTML = drawProduct(productId, { width: 32, height: 32 });
  document.body.appendChild(flyClone);

  gsap.set(flyClone, {
    x: startX - 24,
    y: startY - 24,
    scale: 0.9,
    opacity: 1
  });

  // Flight with curved path & scale down into dock
  const midX = (startX + endX) / 2 + (startX < endX ? 60 : -60);
  const midY = Math.min(startY, endY) - 80;

  const tl = gsap.timeline({
    onComplete: () => {
      flyClone.remove();

      // Bump dock badge & hero count with elastic return
      const badges = document.querySelectorAll('.dock-cart-badge, .hero-cart-count-badge');
      badges.forEach((b) => {
        gsap.fromTo(b, { scale: 1.4 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.3, 0.4)' });
      });
    }
  });

  tl.to(flyClone, {
    duration: 0.8,
    ease: 'power2.inOut',
    scale: 0.4,
    opacity: 0.9,
    motionPath: {
      path: [
        { x: startX - 24, y: startY - 24 },
        { x: midX - 24, y: midY - 24 },
        { x: endX - 24, y: endY - 24 }
      ],
      curviness: 1.5
    }
  });
}

/**
 * 6 tiny clay leaf confetti pieces popping from button
 */
function spawnLeafConfetti(sourceBtn) {
  if (prefersReducedMotion) return;

  const rect = sourceBtn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 6; i++) {
    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leaf.setAttribute('class', 'leaf-confetti-piece');
    leaf.setAttribute('viewBox', '0 0 20 20');
    leaf.setAttribute('width', '16');
    leaf.setAttribute('height', '16');
    leaf.innerHTML = `<path d="M10 2 C6 7 4 11 10 18 C16 11 14 7 10 2 Z"/>`;
    document.body.appendChild(leaf);

    const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const distance = 40 + Math.random() * 35;
    const targetX = originX + Math.cos(angle) * distance;
    const targetY = originY + Math.sin(angle) * distance;

    gsap.set(leaf, {
      x: originX - 8,
      y: originY - 8,
      scale: 0.5,
      rotation: Math.random() * 360,
      opacity: 1
    });

    gsap.to(leaf, {
      x: targetX - 8,
      y: targetY - 8,
      rotation: `+=${180 + Math.random() * 180}`,
      scale: 1,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out',
      onComplete: () => leaf.remove()
    });
  }
}

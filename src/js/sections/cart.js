// /src/js/sections/cart.js
// PART A: CART DRAWER / STUDIO BASKET
import gsap from 'gsap';
import { cart, products } from '../../data/products.js';
import { calculatePricing } from '../lib/pricing.js';
import { drawProduct } from '../lib/botanicals.js';
import { scrollToAnchor } from '../lib/scroll.js';
import { scrollLock } from '../lib/scrollLock.js';

export function setupCart() {
  const overlay = document.querySelector('.cart-drawer-overlay');
  if (!overlay) return;

  const panel = overlay.querySelector('.cart-drawer-panel');
  const sageBlob = overlay.querySelector('.cart-drawer-sage-blob');
  const closeBtn = overlay.querySelector('.cart-close-btn');
  const itemsContainer = overlay.querySelector('.cart-items-container');
  const shippingText = document.getElementById('cart-shipping-text');
  const shippingFill = document.getElementById('cart-shipping-fill');
  const headerCount = document.getElementById('cart-header-count');
  const undoToast = document.getElementById('cart-undo-toast');
  const undoBtn = document.getElementById('cart-undo-btn');
  const undoText = document.getElementById('cart-undo-text');
  const recRow = document.getElementById('cart-rec-row');
  const promoContainer = document.getElementById('cart-promo-container');
  const promoToggle = document.getElementById('cart-promo-toggle');
  const promoForm = document.getElementById('cart-promo-form');
  const promoInput = document.getElementById('cart-promo-input');
  const promoApply = document.getElementById('cart-promo-apply');
  const promoError = document.getElementById('cart-promo-error');
  const promoChip = document.getElementById('cart-promo-chip');
  const promoChipText = document.getElementById('cart-promo-chip-text');
  const promoRemove = document.getElementById('cart-promo-remove');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const successView = document.getElementById('cart-success-view');
  const keepExploring = document.getElementById('cart-keep-exploring');
  const orderBadge = document.getElementById('cart-order-badge');
  const liveAnnouncer = document.getElementById('cart-live-announcer');

  const subtotalEl = document.getElementById('cart-subtotal-val');
  const bundleDiscountRow = document.getElementById('cart-bundle-discount-row');
  const bundleDiscountVal = document.getElementById('cart-bundle-discount-val');
  const promoDiscountRow = document.getElementById('cart-promo-discount-row');
  const promoDiscountVal = document.getElementById('cart-promo-discount-val');
  const shippingVal = document.getElementById('cart-shipping-val');
  const totalVal = document.getElementById('cart-total-val');

  const dockBadge = document.querySelector('.dock-cart-badge');
  const heroCountBadge = document.querySelector('.hero-cart-count-badge');

  // State
  let isOpen = false;
  let hasAutoOpened = false;
  let userClosedDrawer = false;
  let activePromoCode = null;
  let undoItem = null;
  let undoTimer = null;
  let hadFreeShipping = false;
  let lastTriggerEl = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function announce(message) {
    if (liveAnnouncer) {
      liveAnnouncer.textContent = '';
      setTimeout(() => {
        liveAnnouncer.textContent = message;
      }, 50);
    }
  }

  function openCart(trigger = null) {
    if (isOpen) return;
    isOpen = true;
    lastTriggerEl = trigger || document.activeElement;

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    scrollLock.lock('cart', lastTriggerEl);

    render();

    if (prefersReduced) {
      gsap.set(panel, { xPercent: 0 });
      gsap.set(overlay, { opacity: 1 });
    } else {
      gsap.killTweensOf([panel, sageBlob]);
      gsap.fromTo(panel, 
        { xPercent: 100 }, 
        { xPercent: 0, duration: 0.7, ease: 'expo.out' }
      );

      if (sageBlob) {
        gsap.fromTo(sageBlob,
          { scale: 0, opacity: 0.4 },
          { scale: 8, opacity: 0, duration: 0.85, ease: 'power2.out' }
        );
      }

      const rows = itemsContainer.querySelectorAll('.cart-item-row');
      if (rows.length > 0) {
        gsap.fromTo(rows,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.2 }
        );
      }
    }

    // Trap focus inside drawer
    panel.focus();
  }

  function closeCart() {
    if (!isOpen) return;
    isOpen = false;
    userClosedDrawer = true;

    // Guaranteed scroll unlock via manager
    scrollLock.unlock('cart');

    if (prefersReduced) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      gsap.set(panel, { xPercent: 100 });
      if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
        lastTriggerEl.focus();
      }
    } else {
      gsap.to(panel, {
        xPercent: 100,
        duration: 0.55,
        ease: 'expo.in',
        onComplete: () => {
          overlay.classList.remove('open');
          overlay.setAttribute('aria-hidden', 'true');
          if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
            lastTriggerEl.focus();
          }
        }
      });
      gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: () => {
        overlay.style.opacity = '';
      }});
    }

    // Reset success view if open
    if (successView && successView.classList.contains('visible')) {
      setTimeout(() => {
        successView.classList.remove('visible');
        const scrollBody = overlay.querySelector('.cart-body-scroll');
        const footerWrap = overlay.querySelector('.cart-footer-wrap');
        if (scrollBody) scrollBody.style.display = '';
        if (footerWrap) footerWrap.style.display = '';
      }, 500);
    }
  }

  // Guaranteed unfreeze on window resize or unload
  window.addEventListener('resize', () => {
    if (!isOpen) startScroll();
  });
  window.addEventListener('beforeunload', () => {
    startScroll();
  });

  // Listeners
  window.addEventListener('cart:open', (e) => {
    openCart(e.detail?.trigger || null);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCart);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeCart();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      closeCart();
      return;
    }
    // Focus trap
    if (e.key === 'Tab') {
      const focusable = panel.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), [tabindex="0"]');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // First-add auto open (600ms after first add, once per session, never again if user closed)
  window.addEventListener('cart:change', (e) => {
    const count = cart.count;
    const items = cart.items;

    // Bump badges
    if (heroCountBadge) {
      heroCountBadge.textContent = count;
      gsap.fromTo(heroCountBadge, { scale: 1.35 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' });
    }
    if (dockBadge) {
      dockBadge.textContent = count;
      dockBadge.style.display = count > 0 ? 'flex' : 'none';
      gsap.fromTo(dockBadge, { scale: 1.35 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' });
    }

    if (!hasAutoOpened && count > 0 && !userClosedDrawer) {
      hasAutoOpened = true;
      setTimeout(() => {
        if (!isOpen && !userClosedDrawer) {
          openCart();
        }
      }, 600);
    }

    render();
  });

  // Free Shipping leaf confetti
  function launchShippingConfetti() {
    if (prefersReduced) return;
    const bar = overlay.querySelector('.cart-shipping-bar');
    if (!bar) return;

    for (let i = 0; i < 6; i++) {
      const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      leaf.setAttribute('viewBox', '0 0 24 24');
      leaf.setAttribute('class', 'shipping-confetti-leaf');
      leaf.style.width = '14px';
      leaf.style.height = '14px';
      leaf.style.left = '50%';
      leaf.style.top = '10px';
      leaf.innerHTML = '<path d="M12 2C8 7 6 12 12 22C18 12 16 7 12 2Z"/>';

      bar.appendChild(leaf);

      const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.5;
      const dist = 30 + Math.random() * 45;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist - 15;

      gsap.fromTo(leaf,
        { scale: 0.4, opacity: 1, x: 0, y: 0, rotation: 0 },
        {
          x,
          y,
          rotation: (Math.random() - 0.5) * 360,
          scale: 1,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
          onComplete: () => leaf.remove()
        }
      );
    }
  }

  // Promo Code Toggle & Logic
  if (promoToggle && promoForm) {
    promoToggle.addEventListener('click', () => {
      promoForm.classList.toggle('expanded');
      if (promoForm.classList.contains('expanded') && promoInput) {
        promoInput.focus();
      }
    });
  }

  if (promoApply && promoInput) {
    promoApply.addEventListener('click', () => {
      applyPromo(promoInput.value);
    });
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromo(promoInput.value);
      }
    });
  }

  if (promoRemove) {
    promoRemove.addEventListener('click', () => {
      activePromoCode = null;
      if (promoChip) promoChip.style.display = 'none';
      if (promoToggle) promoToggle.style.display = '';
      if (promoForm) {
        promoForm.classList.remove('expanded');
        if (promoInput) promoInput.value = '';
      }
      announce('Promo code removed');
      render();
    });
  }

  function applyPromo(codeStr) {
    const code = (codeStr || '').trim().toUpperCase();
    if (!code) return;

    if (code === 'VERDANT10' || code === 'WELCOME') {
      activePromoCode = code;
      if (promoError) promoError.classList.remove('visible');
      if (promoForm) promoForm.classList.remove('expanded');
      if (promoToggle) promoToggle.style.display = 'none';
      if (promoChip) {
        promoChip.style.display = 'inline-flex';
        if (promoChipText) {
          promoChipText.textContent = code === 'VERDANT10' ? 'VERDANT10 (-10%)' : 'WELCOME (FREE SHIPPING)';
        }
      }
      announce(`Applied promo code ${code}`);
      render();
    } else {
      if (promoError) {
        promoError.textContent = 'Invalid promo code. Try VERDANT10 or WELCOME';
        promoError.classList.add('visible');
      }
    }
  }

  // Undo Toast Logic
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (undoItem) {
        cart.add(undoItem.product.id, undoItem.quantity);
        if (undoItem.bundle) {
          const item = cart.items.find(i => i.product.id === undoItem.product.id);
          if (item) item.bundle = true;
        }
        announce(`Restored ${undoItem.product.name} to ritual`);
        undoItem = null;
        if (undoToast) undoToast.classList.remove('visible');
        clearTimeout(undoTimer);
      }
    });
  }

  function showUndoToast(item) {
    undoItem = item;
    if (undoText) {
      undoText.textContent = `Removed ${item.product.name} from ritual.`;
    }
    if (undoToast) {
      undoToast.classList.add('visible');
      clearTimeout(undoTimer);
      undoTimer = setTimeout(() => {
        undoToast.classList.remove('visible');
        undoItem = null;
      }, 5000);
    }
  }

  // Main Render Function
  function render() {
    const items = cart.items;
    const count = cart.count;
    const pricing = calculatePricing(items, activePromoCode);

    // 1. Header count
    if (headerCount) {
      headerCount.textContent = count === 1 ? '1 item' : `${count} items`;
    }

    // 2. Free Shipping Bar
    if (shippingText && shippingFill) {
      if (pricing.hasFreeShipping || pricing.freeShippingRemaining <= 0) {
        shippingText.textContent = 'Free shipping unlocked ✓';
        shippingText.classList.add('unlocked');
        if (!prefersReduced) {
          gsap.to(shippingFill, { width: '100%', duration: 0.55, ease: 'power3.out' });
        } else {
          shippingFill.style.width = '100%';
        }

        if (!hadFreeShipping && count > 0) {
          hadFreeShipping = true;
          launchShippingConfetti();
        }
      } else {
        hadFreeShipping = false;
        shippingText.textContent = `You're $${pricing.freeShippingRemaining.toFixed(2)} away from free shipping`;
        shippingText.classList.remove('unlocked');
        const pct = Math.min(100, Math.max(0, (pricing.subtotal / 60) * 100));
        if (!prefersReduced) {
          gsap.to(shippingFill, { width: `${pct}%`, duration: 0.55, ease: 'power3.out' });
        } else {
          shippingFill.style.width = `${pct}%`;
        }
      }
    }

    // 3. Line Items or Empty State
    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <svg class="cart-empty-sprout" viewBox="0 0 80 80" fill="none">
            <path d="M40 70 C40 50 38 30 40 18" stroke="#6F8268" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M40 45 C28 42 20 32 24 24 C32 26 38 34 40 45 Z" fill="#A9B79E"/>
            <path d="M40 35 C52 32 60 22 56 14 C48 16 42 24 40 35 Z" fill="#6F8268"/>
            <circle cx="40" cy="18" r="4.5" fill="#C98F72"/>
          </svg>
          <div class="cart-empty-text">Your ritual is empty.</div>
          <p class="cart-empty-sub">Each formulation is crafted in small batches to restore cellular calm.</p>
          <button type="button" class="hero-btn-moss cart-empty-quiz-btn" style="padding: 12px 24px; font-size: 0.85rem;" data-cursor="OPEN">
            Take the skin quiz ↗
          </button>
          <a href="#shop" class="cart-empty-shop-link" style="font-family: var(--font-body); font-size: 0.85rem; color: var(--color-deep-sage); text-decoration: underline;">
            Browse the collection
          </a>
        </div>
      `;

      const quizBtn = itemsContainer.querySelector('.cart-empty-quiz-btn');
      if (quizBtn) {
        quizBtn.addEventListener('click', () => {
          closeCart();
          window.dispatchEvent(new CustomEvent('quiz:open'));
        });
      }

      const shopLink = itemsContainer.querySelector('.cart-empty-shop-link');
      if (shopLink) {
        shopLink.addEventListener('click', (e) => {
          e.preventDefault();
          closeCart();
          scrollToAnchor('#shop');
        });
      }

      if (checkoutBtn) {
        checkoutBtn.disabled = true;
      }
    } else {
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
      }

      itemsContainer.innerHTML = items.map((item) => {
        const product = item.product;
        const lineTotal = (product.price * item.quantity).toFixed(2);
        const isBundle = item.bundle === true;

        return `
          <div class="cart-item-row" data-id="${product.id}" role="listitem">
            <div class="cart-item-thumb">
              ${drawProduct(product.id, { width: 44, height: 44 })}
            </div>
            <div class="cart-item-info">
              <span class="cart-item-name">${product.name}</span>
              <span class="cart-item-meta">${product.no || 'No. 01'} // ${product.size || '30 ML'}</span>
              ${isBundle ? '<span class="cart-bundle-pill">RITUAL BUNDLE</span>' : ''}
            </div>
            <div class="cart-item-actions">
              <span class="cart-item-price">$${lineTotal}</span>
              <div class="cart-stepper-wrap">
                <button type="button" class="cart-qty-btn qty-minus" aria-label="Decrease quantity of ${product.name}">−</button>
                <span class="cart-item-qty">${item.quantity}</span>
                <button type="button" class="cart-qty-btn qty-plus" aria-label="Increase quantity of ${product.name}">+</button>
              </div>
              <button type="button" class="cart-item-remove-link" aria-label="Remove ${product.name} from ritual">Remove</button>
            </div>
          </div>
        `;
      }).join('');

      // Wire steppers and remove
      itemsContainer.querySelectorAll('.cart-item-row').forEach((row) => {
        const id = row.dataset.id;
        const targetItem = items.find(i => i.product.id === id);

        const minusBtn = row.querySelector('.qty-minus');
        const plusBtn = row.querySelector('.qty-plus');
        const removeBtn = row.querySelector('.cart-item-remove-link');

        if (minusBtn) {
          minusBtn.addEventListener('click', () => {
            if (targetItem.quantity > 1) {
              cart.remove(id, false);
              announce(`Decreased ${targetItem.product.name} quantity to ${targetItem.quantity - 1}`);
            } else {
              handleRemoveRow(row, targetItem);
            }
          });
        }

        if (plusBtn) {
          plusBtn.addEventListener('click', () => {
            cart.add(id, 1);
            row.classList.add('flash-highlight');
            setTimeout(() => row.classList.remove('flash-highlight'), 1200);
            announce(`Increased ${targetItem.product.name} quantity to ${targetItem.quantity + 1}`);
          });
        }

        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            handleRemoveRow(row, targetItem);
          });
        }
      });
    }

    // 4. Recommendation row: Pairs well with
    renderRecommendation();

    // 5. Summary Values (Pure calculation from pricing.js)
    if (subtotalEl) subtotalEl.textContent = `$${pricing.subtotal.toFixed(2)}`;

    if (bundleDiscountRow && bundleDiscountVal) {
      if (pricing.bundleDiscount > 0) {
        bundleDiscountRow.style.display = 'flex';
        bundleDiscountVal.textContent = `-$${pricing.bundleDiscount.toFixed(2)}`;
      } else {
        bundleDiscountRow.style.display = 'none';
      }
    }

    if (promoDiscountRow && promoDiscountVal) {
      if (pricing.promoDiscount > 0) {
        promoDiscountRow.style.display = 'flex';
        promoDiscountVal.textContent = `-$${pricing.promoDiscount.toFixed(2)}`;
      } else {
        promoDiscountRow.style.display = 'none';
      }
    }

    if (shippingVal) {
      shippingVal.textContent = pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`;
    }

    if (totalVal) {
      totalVal.textContent = `$${pricing.total.toFixed(2)}`;
    }
  }

  function handleRemoveRow(row, item) {
    if (!row) return;
    row.classList.add('is-removing');
    setTimeout(() => {
      cart.remove(item.product.id, true);
      showUndoToast(item);
      announce(`Removed ${item.product.name} from ritual`);
    }, 380);
  }

  function renderRecommendation() {
    if (!recRow) return;
    const inCartIds = new Set(cart.items.map(i => i.product.id));
    const missing = products.filter(p => !inCartIds.has(p.id));

    if (missing.length === 0 || cart.items.length === 0) {
      recRow.style.display = 'none';
      return;
    }

    recRow.style.display = 'flex';
    const recProduct = missing[0];

    recRow.innerHTML = `
      <div class="cart-rec-left">
        <div class="cart-rec-thumb">
          ${drawProduct(recProduct.id, { width: 32, height: 32 })}
        </div>
        <div class="cart-rec-info">
          <span class="cart-rec-label">Pairs well with</span>
          <span class="cart-rec-title">${recProduct.name} ($${recProduct.price})</span>
        </div>
      </div>
      <button type="button" class="cart-rec-add-btn" data-id="${recProduct.id}">Add +</button>
    `;

    const addBtn = recRow.querySelector('.cart-rec-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        cart.add(recProduct.id, 1);
        announce(`Added ${recProduct.name} to your ritual`);
      });
    }
  }

  // Checkout Button & Success Screen
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.items.length === 0 || checkoutBtn.disabled) return;

      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('is-loading');

      // Animate small plant growing inside checkout button
      const plantSvg = checkoutBtn.querySelector('.checkout-loader-plant');
      if (plantSvg && !prefersReduced) {
        gsap.fromTo(plantSvg,
          { scale: 0.6, rotation: -10 },
          { scale: 1.15, rotation: 10, yoyo: true, repeat: 3, duration: 0.35, ease: 'sine.inOut' }
        );
      }

      setTimeout(() => {
        checkoutBtn.classList.remove('is-loading');
        checkoutBtn.disabled = false;

        // Generate fake order number VD-2610-XXXX
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let randomCode = '';
        for (let i = 0; i < 4; i++) {
          randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (orderBadge) {
          orderBadge.textContent = `VD-2610-${randomCode}`;
        }

        // Clone current summary into success view
        const pricing = calculatePricing(cart.items, activePromoCode);
        const successSummary = document.getElementById('cart-success-summary');
        if (successSummary) {
          successSummary.innerHTML = `
            <div class="cart-summary-line">
              <span>Items Total</span>
              <span>$${pricing.subtotal.toFixed(2)}</span>
            </div>
            ${pricing.bundleDiscount > 0 ? `
              <div class="cart-summary-line clay-text">
                <span>Bundle Savings</span>
                <span>-$${pricing.bundleDiscount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${pricing.promoDiscount > 0 ? `
              <div class="cart-summary-line clay-text">
                <span>Promo Discount</span>
                <span>-$${pricing.promoDiscount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="cart-summary-line cart-total-line" style="margin-top: 6px;">
              <span>Total Paid</span>
              <span>$${pricing.total.toFixed(2)}</span>
            </div>
          `;
        }

        // Hide regular drawer scroll & footer, show success view
        const scrollBody = overlay.querySelector('.cart-body-scroll');
        const footerWrap = overlay.querySelector('.cart-footer-wrap');
        if (scrollBody) scrollBody.style.display = 'none';
        if (footerWrap) footerWrap.style.display = 'none';
        if (successView) successView.classList.add('visible');

        announce('Checkout completed. Thank you, your ritual is on its way.');
      }, 1400);
    });
  }

  if (keepExploring) {
    keepExploring.addEventListener('click', () => {
      cart.clear();
      activePromoCode = null;
      if (promoChip) promoChip.style.display = 'none';
      if (promoToggle) promoToggle.style.display = '';
      closeCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initial render
  render();
}

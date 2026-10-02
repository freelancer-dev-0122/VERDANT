// /src/js/sections/dock.js
import gsap from 'gsap';
import { scrollToAnchor, getLenis } from '../lib/scroll.js';

export function setupDock() {
  const dockWrap = document.querySelector('.verdant-dock-wrap');
  if (!dockWrap) return;

  const dockNav = dockWrap.querySelector('.verdant-dock-nav');
  const items = Array.from(dockNav.querySelectorAll('.dock-item'));
  const cartItem = dockNav.querySelector('.dock-item[data-target="cart"]');
  const cartBadge = dockNav.querySelector('.dock-cart-badge');

  // macOS-style dock magnification with quickTo
  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (!isTouch) {
    const scaleSetters = items.map((item) => {
      return gsap.quickTo(item, 'scale', { duration: 0.25, ease: 'power2.out' });
    });

    dockNav.addEventListener('mousemove', (e) => {
      const rect = dockNav.getBoundingClientRect();
      const mouseX = e.clientX;

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const dist = Math.abs(mouseX - itemCenter);
        const maxDist = 80;

        if (dist < maxDist) {
          // Hovered item scales up to 1.35, direct neighbours up to 1.15
          const factor = 1 - (dist / maxDist);
          const targetScale = 1 + factor * 0.35;
          scaleSetters[index](targetScale);
        } else {
          scaleSetters[index](1);
        }
      });
    });

    dockNav.addEventListener('mouseleave', () => {
      items.forEach((_, index) => {
        scaleSetters[index](1);
      });
    });
  }

  // Smooth scroll click handler for anchors
  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');

      if (target === 'cart') {
        window.dispatchEvent(new CustomEvent('cart:open'));
        return;
      }

      if (target) {
        scrollToAnchor(`#${target}`);
      }
    });
  });

  // Listen to cart count updates
  window.addEventListener('cart:change', (e) => {
    const count = e.detail?.count || 0;
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'flex' : 'none';
      gsap.fromTo(cartBadge, { scale: 0.5 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    }
  });

  // Hide dock on scroll-down after 200px, show on scroll-up (smooth 0.4s)
  // Always visible near top (< 200px) and near bottom
  let lastScrollY = 0;
  const lenis = getLenis();

  if (lenis) {
    lenis.on('scroll', ({ scroll, limit }) => {
      const currentScrollY = scroll;
      const isNearTop = currentScrollY < 180;
      const isNearBottom = currentScrollY > limit - 120;

      if (isNearTop || isNearBottom) {
        dockWrap.classList.remove('dock-hidden');
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Scrolling down -> hide dock
        dockWrap.classList.add('dock-hidden');
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> show dock
        dockWrap.classList.remove('dock-hidden');
      }

      lastScrollY = currentScrollY;
    });
  }

  // Active section tracking with IntersectionObserver
  const sections = ['shop', 'ingredients', 'ritual', 'journal']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          items.forEach((item) => {
            if (item.getAttribute('data-target') === id) {
              item.classList.add('active');
            } else if (item.getAttribute('data-target') !== 'cart') {
              item.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(sec => observer.observe(sec));
  }

  return {
    enter() {
      // Slide up from bottom after loader exits
      gsap.to(dockWrap, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        delay: 0.4
      });
    }
  };
}

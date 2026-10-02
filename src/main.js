import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScrollEngine } from './js/lib/scroll.js';
import { setTone } from './js/lib/tone.js';
import { initCursor } from './js/lib/cursor.js';
import { initMagneticElements } from './js/lib/magnetic.js';
import { runLoader } from './js/sections/loader.js';
import { setupHero } from './js/sections/hero.js';
import { setupPhilosophy } from './js/sections/philosophy.js';
import { setupShop } from './js/sections/shop.js';
import { setupIngredients } from './js/sections/ingredients.js';
import { setupRitual } from './js/sections/ritual.js';
import { setupDock } from './js/sections/dock.js';
import { setupCart } from './js/sections/cart.js';
import { setupQuiz } from './js/sections/quiz.js';
import { setupJournal } from './js/sections/journal.js';
import { setupTestimonials } from './js/sections/testimonials.js';
import { setupFooter } from './js/sections/footer.js';

gsap.registerPlugin(ScrollTrigger);

async function initVerdant() {
  // 1. Initialize Lenis driven strictly by GSAP ticker
  initScrollEngine();

  // 2. Set default tone (bone)
  setTone('bone', true);

  // 3. Initialize custom morphing cursor & magnetic spring buttons
  initCursor();
  initMagneticElements('[data-magnetic]');

  // 4. Setup sections
  const heroEl = document.getElementById('hero');
  const philosophyEl = document.getElementById('philosophy');
  const shopEl = document.getElementById('shop');
  const ingredientsEl = document.getElementById('ingredients');
  const ritualEl = document.getElementById('ritual');
  const journalEl = document.getElementById('journal');
  const testimonialsEl = document.getElementById('testimonials');
  const footerEl = document.getElementById('footer');

  const heroController = setupHero(heroEl);
  setupPhilosophy(philosophyEl);
  setupShop(shopEl);
  setupIngredients(ingredientsEl);
  setupRitual(ritualEl);
  setupJournal(journalEl);
  setupTestimonials(testimonialsEl);
  setupFooter(footerEl);

  const dockController = setupDock();
  setupCart();
  setupQuiz();

  // Re-run magnetic elements to bind newly added buttons across sections, cart and quiz
  initMagneticElements('[data-magnetic]');

  // Handle Account link click with gentle notification
  const accountLink = document.getElementById('account-link');
  if (accountLink) {
    accountLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Botanical Studio Account: Guest Session active. Formulations and rituals are saved to your current visit.');
    });
  }

  // Handle hero bottom scroll badge click
  const scrollBadge = document.getElementById('scroll-badge');
  if (scrollBadge) {
    scrollBadge.addEventListener('click', () => {
      const philosophySec = document.getElementById('philosophy');
      if (philosophySec) {
        philosophySec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 5. Setup ScrollTrigger tone triggers for anchor sections
  setupToneScrollTriggers();

  // 6. Run Seedling Loader
  await runLoader();

  // 7. Post-loader entrance animations: hero & dock enter strictly after loader exits
  if (heroController) {
    heroController.enter();
  }
  if (dockController) {
    dockController.enter();
  }

  // 8. Refresh ScrollTrigger after loader exits, mounting, and after fonts are ready
  if (document.fonts) {
    await document.fonts.ready;
  }
  ScrollTrigger.refresh();

  // 9. Debounced ScrollTrigger refresh on window resize, cart change, and ritual updates
  let resizeRefreshTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeRefreshTimer);
    resizeRefreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  });

  window.addEventListener('cart:change', () => {
    setTimeout(() => ScrollTrigger.refresh(), 150);
  });

  window.addEventListener('ritual:ready', () => {
    setTimeout(() => ScrollTrigger.refresh(), 250);
  });
}

function setupToneScrollTriggers() {
  const sections = [
    { id: 'hero', tone: 'sage' },
    { id: 'philosophy', tone: 'moss' },
    { id: 'shop', tone: 'paper' },
    { id: 'ingredients', tone: 'bone' },
    { id: 'ritual', tone: 'sage' },
    { id: 'journal', tone: 'bone' },
    { id: 'testimonials', tone: 'sage' },
    { id: 'footer', tone: 'moss' }
  ];

  sections.forEach(({ id, tone }) => {
    const el = document.getElementById(id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => setTone(tone),
      onEnterBack: () => setTone(tone)
    });
  });
}

// Boot application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVerdant);
} else {
  initVerdant();
}

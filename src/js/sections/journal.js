// /src/js/sections/journal.js
// PART B: THE JOURNAL (#journal, tone bone, padding 140px top, 120px bottom, max-width 1320px)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setTone } from '../lib/tone.js';
import { botanicals } from '../lib/botanicals.js';
import { scrollLock } from '../lib/scrollLock.js';

export const journalArticles = [
  {
    id: 'twelve-ingredients',
    title: 'Why we stop at twelve ingredients',
    excerpt: 'The rigorous discipline of formulation restraint, eliminating synthetic fillers for cellular affinity.',
    category: 'INGREDIENTS',
    readTime: '4 min read',
    tone: 'sage',
    colClass: 'col-large',
    botanical: 'eucalyptus',
    paragraphs: [
      'In conventional skincare labs, formulations often swell with forty or fifty compounding agents—emulsifiers designed for perpetual shelf life, synthetic fragrances engineered to mask oxidation, and micronized polymers that offer an artificial illusion of smoothness. At Verdant, we approach the apothecary beaker from an opposite premise: every molecule present must serve a cellular purpose.',
      'By holding our formulation threshold strictly to twelve botanicals and bio-ferments, each ingredient can exist at its clinically active concentration rather than as a symbolic dust on the label. We source wild tremella mushroom directly from coastal fog belts and cold-press olive squalane under nitrogen to safeguard its double bonds.',
      'When you introduce fewer variables to sensitive skin, the dermal barrier does not spend metabolic energy filtering foreign carrier chemicals. It recognizes plant sterols and ceramides immediately, drawing moisture into lipid bilayers without inflammation or receptor fatigue.',
      'Restraint is not a compromise; it is the highest form of biochemical precision. When twelve plants work in uninterrupted resonance, skin returns to its innate, unforced equilibrium.'
    ]
  },
  {
    id: 'slow-science-aloe',
    title: 'The slow science of aloe',
    excerpt: 'Hand-filleted inner leaf gel preserved without heat to retain long-chain acemannan polysaccharides.',
    category: 'RITUAL',
    readTime: '5 min read',
    tone: 'deep-sage',
    colClass: 'col-medium',
    botanical: 'fern',
    paragraphs: [
      'Commercial aloe vera powder is commonly spray-dried at extreme temperatures, destroying the fragile tertiary structure of its most healing molecule: acemannan. While this makes mass transport inexpensive, the resulting rehydrated liquid retains little more biological value than tap water.',
      'Our studio partners with a small organic grower in southern Andalusia where mature leaves are harvested at dawn by hand. Within six hours of cutting, the rind is carefully removed to expose the translucent inner parenchymal fillet, which is cold-milled and raw-filtered through unbleached cotton.',
      'This cold extraction leaves the soothing polysaccharides entirely intact. Applied to skin post-cleansing, it creates an invisible, breathable moisture mesh that calms erythema and speeds cellular matrix repair.',
      'Patience in botanical processing cannot be accelerated by industrial shortcuts. The slow pace of our cold-filleting ensures that every drop retains the cooling, living vital energy of the plant.'
    ]
  },
  {
    id: 'refill-jar-travels',
    title: 'How a refill jar travels',
    excerpt: 'Heavy recycled amber glass, monomaterial aluminum lids, and carbon-neutral closed-loop pouch returns.',
    category: 'SUSTAINABILITY',
    readTime: '3 min read',
    tone: 'clay',
    colClass: 'col-half-1',
    botanical: 'olive',
    paragraphs: [
      'The single greatest carbon footprint in luxury beauty does not stem from growing the plants—it is the continuous manufacture and disposal of heavy cosmetic packaging. Our answer was to design a vessel intended to remain on your bathroom shelf for decades.',
      'Every Verdant glass jar is cast from 90% post-consumer recycled glass in northern Italy, weighted with a thick solid base that grounds the daily ritual. Once your formulation is empty, you do not replace the jar; you receive a lightweight, compostable cellulose pouch containing a fresh batch.',
      'These refill pouches require 84% less fuel to transport than heavy jars. When poured into the sterilized studio vessel, the product remains hermetically fresh while zero virgin plastic enters the municipal waste stream.',
      'True luxury in the modern world is not disposable ostentation. It is the mindful reverence of durable craftsmanship that honors both your space and the earth.'
    ]
  },
  {
    id: 'layering-without-guesswork',
    title: 'Layering without the guesswork',
    excerpt: 'Molecular weight progression: water-soluble botanical essences before lipid-rich recovery emulsions.',
    category: 'SKIN',
    readTime: '6 min read',
    tone: 'bone',
    colClass: 'col-half-2',
    botanical: 'monstera',
    paragraphs: [
      'Skincare layering has become needlessly complicated, with twenty-step routines that overwhelm the stratum corneum and pill upon contact. The rule of skin absorption, however, is grounded in pure physics: light water-based molecules must always precede heavier lipid matrices.',
      'Begin your ritual by misting with Petal Mist to saturate intercellular spaces with hydrosols. While the skin remains slightly damp, apply three drops of Dew Serum; its lightweight tremella humectants will grab the free water and anchor it deep into upper epidermal tiers.',
      'Only once the serum has fully absorbed should you seal the barrier with Moss Cream. The elderberry wax and botanical lipids form a protective outer blanket that locks in hydration and shields against daily transepidermal water loss.',
      'Listen to your skin’s changing rhythms with the turning seasons. On humid mornings, two drops of serum alone may suffice; during arid winters, an extra scoop of cream honors your barrier’s call for quiet restoration.'
    ]
  }
];

export function setupJournal(sectionEl) {
  if (!sectionEl) return;

  const overlay = document.getElementById('journal-reading-overlay');
  const overlayCloseBtn = overlay?.querySelector('.journal-overlay-close-btn');
  const overlayCategory = overlay?.querySelector('.journal-article-category');
  const overlayTitle = overlay?.querySelector('.journal-article-title');
  const overlayMeta = overlay?.querySelector('.journal-article-meta');
  const overlayBody = overlay?.querySelector('.journal-article-body');

  let activeArticle = null;
  let lastTriggerEl = null;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Staggered reveal of journal cards on scroll
  const cards = sectionEl.querySelectorAll('.journal-card');
  if (cards.length > 0) {
    if (!prefersReduced) {
      gsap.fromTo(cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top 70%',
            once: true
          }
        }
      );
    }
  }

  // Open reading overlay
  function openArticle(article, triggerEl = null) {
    if (!overlay || !article) return;
    activeArticle = article;
    lastTriggerEl = triggerEl || document.activeElement;

    if (overlayCategory) overlayCategory.textContent = article.category;
    if (overlayTitle) overlayTitle.textContent = article.title;
    if (overlayMeta) overlayMeta.textContent = `${article.readTime} • Written by Verdant Botanical Studio`;
    if (overlayBody) {
      overlayBody.innerHTML = article.paragraphs.map(p => `<p>${p}</p>`).join('');
    }

    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    scrollLock.lock('journal', lastTriggerEl);

    if (prefersReduced) {
      gsap.set(overlay, { opacity: 1 });
    } else {
      gsap.fromTo(overlay,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
      );
    }

    if (overlayCloseBtn) overlayCloseBtn.focus();
  }

  function closeArticle() {
    if (!overlay || !overlay.classList.contains('is-active')) return;

    scrollLock.unlock('journal');

    if (prefersReduced) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      gsap.set(overlay, { opacity: 0 });
    } else {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          overlay.classList.remove('is-active');
          overlay.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }

  // Card click events
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const article = journalArticles.find(a => a.id === id);
      if (article) {
        openArticle(article, card);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = card.dataset.id;
        const article = journalArticles.find(a => a.id === id);
        if (article) {
          openArticle(article, card);
        }
      }
    });
  });

  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener('click', closeArticle);
  }

  // Close on Escape or click outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-active')) {
      closeArticle();
    }
  });

  window.addEventListener('resize', () => {
    if (!overlay?.classList.contains('is-active')) startScroll();
  });
  window.addEventListener('beforeunload', () => {
    startScroll();
  });

  // "All stories ↗" smooth scroll
  const allLink = sectionEl.querySelector('.journal-all-link');
  if (allLink) {
    allLink.addEventListener('click', (e) => {
      e.preventDefault();
      const firstCard = sectionEl.querySelector('.journal-card');
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

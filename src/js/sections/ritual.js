// /src/js/sections/ritual.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from '../../data/products.js';
import { drawProduct } from '../lib/botanicals.js';
import { setTone } from '../lib/tone.js';
import { splitTextIntoMaskedWords, revealMaskedWords, prefersReducedMotion } from '../lib/textSplitter.js';

gsap.registerPlugin(ScrollTrigger);

// Default ritual routines
const defaultRitualData = {
  am: [
    {
      product: products.find(p => p.id === 'clay-cleanser'),
      title: '01. Purifying Cleanser',
      instruction: 'Massage onto damp skin using circular upward movements to melt away nocturnal perspiration.',
      wait: '30 sec'
    },
    {
      product: products.find(p => p.id === 'dew-serum'),
      title: '02. Cellular Hydration',
      instruction: 'Press 3 drops into freshly cleansed skin until completely absorbed for deep moisture bounce.',
      wait: '45 sec'
    },
    {
      product: products.find(p => p.id === 'moss-cream'),
      title: '03. Barrier Shield',
      instruction: 'Smooth a pea-sized amount over face and neck to cushion cells against daily environmental stressors.',
      wait: '60 sec'
    },
    {
      product: products.find(p => p.id === 'petal-mist'),
      title: '04. Botanical Vapor',
      instruction: 'Mist 3 gentle pumps from 20cm away to seal botanical extracts and awaken natural morning dew.',
      wait: 'absorbed'
    }
  ],
  pm: [
    {
      product: products.find(p => p.id === 'clay-cleanser'),
      title: '01. Evening Purify',
      instruction: 'Rinse away daily urban buildup, sunscreen, and micro-particles with colloidal oat milk.',
      wait: '45 sec'
    },
    {
      product: products.find(p => p.id === 'dew-serum'),
      title: '02. Cellular Infusion',
      instruction: 'Warm 4 drops between palms and gently press into skin to replenish water reservoirs.',
      wait: '45 sec'
    },
    {
      product: products.find(p => p.id === 'moss-cream'),
      title: '03. Restorative Cocoon',
      instruction: 'Massage richly over facial contours to support overnight barrier repair with arctic lichens.',
      wait: 'overnight'
    }
  ]
};

export function setupRitual(section) {
  if (!section) return;

  // State object
  const state = {
    mode: 'am', // 'am' | 'pm'
    personalizedResult: null,
    completedSteps: new Set()
  };

  const toggleWrap = section.querySelector('.ritual-toggle-pill');
  const toggleIndicator = section.querySelector('.ritual-toggle-indicator');
  const toggleBtns = section.querySelectorAll('.ritual-toggle-btn');
  const stepsContainer = section.querySelector('.ritual-steps-container');
  const progressText = section.querySelector('.ritual-progress-text');
  const progressBarFill = section.querySelector('.ritual-progress-bar-fill');
  const timelineSvg = section.querySelector('.ritual-timeline-svg');
  const timelineStem = section.querySelector('.timeline-stem-fill');
  const timelineBud = section.querySelector('.timeline-stem-bud');
  const startQuizBtn = section.querySelector('.ritual-start-quiz-btn');
  const customBadge = section.querySelector('.ritual-custom-badge');
  const retakeBtn = section.querySelector('.ritual-retake-btn');

  // Tone trigger: entering calls setTone('sage')
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => setTone('sage'),
    onEnterBack: () => setTone('sage')
  });

  // Headline masked reveal on enter
  const heading = section.querySelector('.ritual-title');
  if (heading) {
    const words = splitTextIntoMaskedWords(heading);
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      once: true,
      onEnter: () => revealMaskedWords(words, { duration: 1.1, stagger: 0.08 })
    });
  }

  // Scrubbed timeline vertical stem drawing
  if (timelineStem && timelineBud && !prefersReducedMotion) {
    const totalLength = 800;
    gsap.set(timelineStem, { strokeDasharray: totalLength, strokeDashoffset: totalLength });

    ScrollTrigger.create({
      trigger: stepsContainer,
      start: 'top 70%',
      end: 'bottom 70%',
      scrub: 1,
      onUpdate: (self) => {
        const offset = totalLength * (1 - self.progress);
        timelineStem.style.strokeDashoffset = offset;
        const currentY = self.progress * 420;
        timelineBud.setAttribute('cy', currentY + 10);
      }
    });
  }

  // Toggle Morning / Evening
  toggleBtns.forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === state.mode) return;
      state.mode = mode;

      // Update toggle indicator
      toggleBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('aria-pressed', 'true');
      if (toggleIndicator) {
        toggleIndicator.style.transform = mode === 'pm' ? 'translateX(100%)' : 'translateX(0%)';
      }

      // Celestial blob morph & tone shift (CSS variable only)
      section.classList.toggle('pm-active', mode === 'pm');
      if (mode === 'pm') {
        section.style.setProperty('--ritual-tone-bg', 'var(--color-deep-sage)');
      } else {
        section.style.setProperty('--ritual-tone-bg', 'var(--color-sage)');
      }

      renderSteps(true);
    });
  });

  // Start quiz button
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('quiz:open', { detail: { source: startQuizBtn } }));
    });
  }

  if (retakeBtn) {
    retakeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('quiz:open', { detail: { source: retakeBtn } }));
    });
  }

  // Listen for "ritual:ready" from quiz completion
  window.addEventListener('ritual:ready', (e) => {
    state.personalizedResult = e.detail;
    state.completedSteps.clear();

    if (customBadge) {
      customBadge.classList.add('visible');
    }
    if (startQuizBtn) {
      startQuizBtn.style.display = 'none';
    }

    // Flip reveal into personalized ritual
    if (!prefersReducedMotion) {
      gsap.to(stepsContainer, {
        scale: 0.96,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          renderSteps(false);
          gsap.to(stepsContainer, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' });
          ScrollTrigger.refresh();
        }
      });
    } else {
      renderSteps(false);
      ScrollTrigger.refresh();
    }
  });

  // Initial render
  renderSteps(false);

  function getActiveSteps() {
    if (state.personalizedResult) {
      return state.personalizedResult.steps[state.mode] || [];
    }
    return defaultRitualData[state.mode] || [];
  }

  function renderSteps(animate = false) {
    const steps = getActiveSteps();
    const total = steps.length;
    let completedCount = 0;

    const html = steps.map((step, idx) => {
      const stepKey = `${state.mode}-${idx}`;
      const isDone = state.completedSteps.has(stepKey);
      if (isDone) completedCount++;

      const prod = step.product;
      return `
        <div class="ritual-step-row ${isDone ? 'is-completed' : ''}" data-step-key="${stepKey}">
          <div class="step-node-dot">0${idx + 1}</div>
          <div class="step-thumb-wrap">
            ${drawProduct(prod.id, { width: 52, height: 52 })}
          </div>
          <div class="step-text-content">
            <div class="step-title-row">
              <span class="step-product-name">${step.title || prod.name}</span>
              <span class="step-wait-chip">${step.wait}</span>
            </div>
            <p class="step-instruction">${step.instruction}</p>
          </div>
          <button type="button" class="step-check-btn" aria-label="Mark step as done">
            <svg class="step-check-svg" viewBox="0 0 24 24">
              <path class="step-check-path" d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    if (animate && !prefersReducedMotion) {
      gsap.to(stepsContainer, {
        opacity: 0,
        y: 12,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          stepsContainer.innerHTML = html;
          bindStepCheckboxes();
          gsap.to(stepsContainer, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          updateProgressUI(completedCount, total);
          ScrollTrigger.refresh();
        }
      });
    } else {
      stepsContainer.innerHTML = html;
      bindStepCheckboxes();
      updateProgressUI(completedCount, total);
    }
  }

  function bindStepCheckboxes() {
    const rows = stepsContainer.querySelectorAll('.ritual-step-row');
    rows.forEach((row) => {
      const btn = row.querySelector('.step-check-btn');
      const stepKey = row.dataset.stepKey;

      btn.addEventListener('click', () => {
        if (state.completedSteps.has(stepKey)) {
          state.completedSteps.delete(stepKey);
          row.classList.remove('is-completed');
        } else {
          state.completedSteps.add(stepKey);
          row.classList.add('is-completed');
        }

        const steps = getActiveSteps();
        const done = steps.filter((_, idx) => state.completedSteps.has(`${state.mode}-${idx}`)).length;
        updateProgressUI(done, steps.length);
      });
    });
  }

  function updateProgressUI(done, total) {
    if (progressText) {
      progressText.textContent = `${done} / ${total} steps completed`;
    }
    if (progressBarFill) {
      const pct = total > 0 ? (done / total) * 100 : 0;
      progressBarFill.style.width = `${pct}%`;
    }
  }
}

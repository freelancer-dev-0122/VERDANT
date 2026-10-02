// /src/js/sections/quiz.js
import gsap from 'gsap';
import { QUESTION_DEFINITIONS, computeRitual } from '../lib/ritual.js';
import { botanicals, drawProduct } from '../lib/botanicals.js';
import { stopScroll, startScroll, scrollToAnchor } from '../lib/scroll.js';
import { scrollLock } from '../lib/scrollLock.js';
import { cart } from '../../data/products.js';
import { splitTextIntoMaskedWords, revealMaskedWords, prefersReducedMotion } from '../lib/textSplitter.js';

export function setupQuiz() {
  const overlay = document.querySelector('.verdant-quiz-overlay');
  if (!overlay) return;

  // Single plain JS state object
  const state = {
    isOpen: false,
    currentIndex: 0,
    answers: {
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      q5: null
    },
    computedResult: null,
    activeResultTab: 'am', // 'am' | 'pm'
    triggerElement: null
  };

  const closeBtn = overlay.querySelector('.quiz-close-button');
  const progressLabel = overlay.querySelector('.quiz-progress-counter');
  const mobileVineFill = overlay.querySelector('.quiz-mobile-vine-fill');
  const plantStem = overlay.querySelector('.quiz-plant-stem');
  const plantLeaves = overlay.querySelectorAll('.quiz-plant-node-leaf');
  const bloomFlower = overlay.querySelector('.quiz-bloom-flower');
  const questionContainer = overlay.querySelector('.quiz-content-viewport');
  const readingScreen = overlay.querySelector('.quiz-reading-screen');
  const readingStatus = overlay.querySelector('.reading-status-text');
  const resultView = overlay.querySelector('.quiz-result-view');

  function openQuiz(sourceEl = null) {
    if (state.isOpen) return;
    state.isOpen = true;
    state.triggerElement = sourceEl || document.activeElement;

    // Scroll lock guaranteed with reference counter
    scrollLock.lock('quiz', state.triggerElement);

    overlay.classList.add('is-active');

    // Trigger circular clip-path expansion from source position
    const origin = getClipOrigin(sourceEl);

    if (!prefersReducedMotion) {
      gsap.fromTo(overlay,
        { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`, opacity: 1 },
        { clipPath: `circle(160% at ${origin.x}px ${origin.y}px)`, duration: 0.9, ease: 'expo.inOut' }
      );
    } else {
      gsap.to(overlay, { opacity: 1, duration: 0.3 });
    }

    // Trap focus inside
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      closeBtn.focus();
    }, 100);

    // If result already computed, show result; otherwise show current question
    if (state.computedResult) {
      showResultScreen(false);
    } else {
      renderQuestion(state.currentIndex, false);
    }
  }

  function closeQuiz() {
    if (!state.isOpen) return;
    state.isOpen = false;

    const origin = getClipOrigin(state.triggerElement);

    const onFinish = () => {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      scrollLock.unlock('quiz'); // Guaranteed unlock via manager
    };

    if (!prefersReducedMotion) {
      gsap.to(overlay, {
        clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
        duration: 0.75,
        ease: 'expo.inOut',
        onComplete: onFinish
      });
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.25, onComplete: onFinish });
    }
  }

  function getClipOrigin(el) {
    if (el && typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect();
      return { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) };
    }
    return { x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight / 2) };
  }

  // Open & Close triggers
  window.addEventListener('quiz:open', (e) => {
    openQuiz(e.detail?.source);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeQuiz);
  }

  // Keyboard navigation & Esc to close
  window.addEventListener('keydown', (e) => {
    if (!state.isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeQuiz();
      return;
    }

    // Question keyboard shortcuts (1-4 select, Backspace goes back)
    if (!state.computedResult && !readingScreen.classList.contains('active')) {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const cards = overlay.querySelectorAll('.quiz-answer-card');
        if (cards[idx]) {
          cards[idx].click();
        }
      } else if (e.key === 'Backspace') {
        if (state.currentIndex > 0) {
          state.currentIndex--;
          renderQuestion(state.currentIndex, true);
        }
      }
    }
  });

  // -------------------------------------------------------------
  // RENDER QUESTION
  // -------------------------------------------------------------
  function renderQuestion(index, animate = true) {
    const qData = QUESTION_DEFINITIONS[index];
    if (!qData) return;

    // Update Top Row Progress
    if (progressLabel) {
      progressLabel.textContent = `Question ${qData.number} / 05`;
    }
    if (mobileVineFill) {
      mobileVineFill.style.width = `${((index + 1) / 5) * 100}%`;
    }

    // Update Left Rail Growing Plant
    updatePlantProgress(index);

    // Hide other views
    readingScreen.classList.remove('active');
    resultView.classList.remove('active');

    const currentAnswerId = state.answers[`q${index + 1}`];

    const questionHtml = `
      <div class="quiz-question-card" role="dialog" aria-labelledby="quiz-q-title">
        <h2 class="quiz-question-title" id="quiz-q-title">
          ${qData.title} <span class="quiz-question-accent">${qData.accentWord}</span>
        </h2>

        <div class="quiz-answers-grid" role="radiogroup" aria-label="${qData.title} ${qData.accentWord}">
          ${qData.answers.map((ans, aIdx) => {
            const isSel = currentAnswerId === ans.id;
            const artBuilder = botanicals[ans.art] || botanicals.singlePetal;
            return `
              <div class="quiz-answer-card ${isSel ? 'is-selected' : ''}" 
                   role="radio" 
                   aria-checked="${isSel ? 'true' : 'false'}" 
                   tabindex="0"
                   data-answer-id="${ans.id}"
                   data-index="${aIdx}">
                <div class="quiz-answer-thumb">
                  ${artBuilder({ width: 32, height: 32 })}
                </div>
                <div class="quiz-answer-body">
                  <span class="quiz-answer-title">${ans.title}</span>
                  <span class="quiz-answer-hint">${ans.hint}</span>
                </div>
                <div class="quiz-answer-check">
                  <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="quiz-controls-row">
          ${index > 0 ? `<button type="button" class="quiz-back-btn">← Back to previous</button>` : `<span></span>`}
          <button type="button" class="quiz-skip-btn">Skip this question →</button>
        </div>
      </div>
    `;

    if (!animate || prefersReducedMotion) {
      questionContainer.innerHTML = questionHtml;
      bindQuestionEvents(index);
      return;
    }

    // Discrete Swap Animation: fade & slide outgoing 40px for 0.3s
    gsap.to(questionContainer, {
      opacity: 0,
      y: -24,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        questionContainer.innerHTML = questionHtml;
        bindQuestionEvents(index);

        // Incoming characters rise with stagger
        const titleEl = questionContainer.querySelector('.quiz-question-title');
        if (titleEl) {
          const words = splitTextIntoMaskedWords(titleEl);
          revealMaskedWords(words, { duration: 0.65, stagger: 0.04 });
        }

        gsap.fromTo(questionContainer,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        );

        // Animate answer cards entrance
        gsap.from('.quiz-answer-card', {
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.out',
          delay: 0.15
        });
      }
    });
  }

  function bindQuestionEvents(index) {
    const cards = questionContainer.querySelectorAll('.quiz-answer-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const ansId = card.dataset.answerId;
        state.answers[`q${index + 1}`] = ansId;

        // Visual selection state
        cards.forEach(c => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('is-selected');
        card.setAttribute('aria-checked', 'true');

        // Auto-advance after 450ms (instant if reduced motion)
        const delay = prefersReducedMotion ? 0 : 450;
        setTimeout(() => {
          if (index < 4) {
            state.currentIndex = index + 1;
            renderQuestion(state.currentIndex, true);
          } else {
            // All 5 answered -> trigger Reading skin moment
            startReadingSkinMoment();
          }
        }, delay);
      });

      // Keyboard selection (Enter or Space)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    const backBtn = questionContainer.querySelector('.quiz-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (state.currentIndex > 0) {
          state.currentIndex--;
          renderQuestion(state.currentIndex, true);
        }
      });
    }

    const skipBtn = questionContainer.querySelector('.quiz-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (index < 4) {
          state.currentIndex = index + 1;
          renderQuestion(state.currentIndex, true);
        } else {
          startReadingSkinMoment();
        }
      });
    }
  }

  function updatePlantProgress(stepIndex) {
    if (!plantStem) return;
    const progress = (stepIndex + 1) / 5;
    const totalLength = 400;
    const offset = totalLength * (1 - progress);
    plantStem.style.strokeDashoffset = offset;

    // Unfurl leaves up to stepIndex
    plantLeaves.forEach((leaf, idx) => {
      leaf.classList.toggle('active', idx <= stepIndex);
    });

    if (bloomFlower) {
      bloomFlower.classList.remove('bloomed');
    }
  }

  // -------------------------------------------------------------
  // READING YOUR SKIN MOMENT (1.6s)
  // -------------------------------------------------------------
  function startReadingSkinMoment() {
    questionContainer.innerHTML = '';
    readingScreen.classList.add('active');
    resultView.classList.remove('active');

    // Bloom final flower on left rail
    if (bloomFlower) {
      bloomFlower.classList.add('bloomed');
    }

    // Compute ritual matching result
    state.computedResult = computeRitual(state.answers);

    // Text cycling: "Reading your answers" -> "Choosing your plants" -> "Building your ritual"
    const phrases = [
      'Reading your answers...',
      'Choosing your active botanicals...',
      'Formulating your studio ritual...'
    ];

    let pIdx = 0;
    readingStatus.textContent = phrases[0];

    const interval = setInterval(() => {
      pIdx++;
      if (pIdx < phrases.length) {
        gsap.to(readingStatus, {
          opacity: 0,
          y: -8,
          duration: 0.15,
          onComplete: () => {
            readingStatus.textContent = phrases[pIdx];
            gsap.to(readingStatus, { opacity: 1, y: 0, duration: 0.25 });
          }
        });
      }
    }, 500);

    const finishTimeout = setTimeout(() => {
      clearInterval(interval);
      showResultScreen(true);
    }, 1600);

    // Skippable on click
    readingScreen.onclick = () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
      showResultScreen(true);
    };
  }

  // -------------------------------------------------------------
  // PART C: THE RESULT SCREEN
  // -------------------------------------------------------------
  function showResultScreen(animate = true) {
    readingScreen.classList.remove('active');
    resultView.classList.add('active');

    const res = state.computedResult || computeRitual(state.answers);
    state.computedResult = res;

    // Dispatch "ritual:ready" to sync with #ritual section
    window.dispatchEvent(new CustomEvent('ritual:ready', { detail: res }));

    if (progressLabel) {
      progressLabel.textContent = 'Your Formulated Ritual';
    }

    const topIng = res.topIngredients[0];

    resultView.innerHTML = `
      <!-- LEFT: Blob, Featured Flower, Title, Match Ring -->
      <div class="result-left-col">
        <div class="result-blob-stage">
          <div class="result-organic-blob tone-${topIng.tone}"></div>
          <div class="result-featured-art">
            ${botanicals[topIng.art] ? botanicals[topIng.art]({ width: 140, height: 140 }) : botanicals.singlePetal({ width: 140, height: 140 })}
          </div>
        </div>

        <h3 class="result-title">${res.title}</h3>

        <div class="result-match-row">
          <svg class="result-match-ring-svg" viewBox="0 0 64 64">
            <circle class="match-ring-track" cx="32" cy="32" r="28"/>
            <circle class="match-ring-circle" cx="32" cy="32" r="28"/>
          </svg>
          <div class="result-match-text">
            <span>${res.matchScore}% Match</span>
          </div>
        </div>

        <p class="result-reasoning">${res.note}</p>
      </div>

      <!-- RIGHT: Steps Timeline, Ingredients, Pricing, Add Bundle -->
      <div class="result-right-card">
        <!-- Morning / Evening Tab Toggle -->
        <div class="ritual-toggle-pill" style="align-self: flex-start; margin-bottom: 8px;">
          <div class="ritual-toggle-indicator result-toggle-indicator" style="transform: ${state.activeResultTab === 'pm' ? 'translateX(100%)' : 'translateX(0%)'}"></div>
          <button type="button" class="ritual-toggle-btn result-tab-btn ${state.activeResultTab === 'am' ? 'active' : ''}" data-tab="am">Morning (${res.steps.am.length})</button>
          <button type="button" class="ritual-toggle-btn result-tab-btn ${state.activeResultTab === 'pm' ? 'active' : ''}" data-tab="pm">Evening (${res.steps.pm.length})</button>
        </div>

        <!-- Steps Timeline List -->
        <div class="result-steps-timeline">
          ${renderResultSteps(res.steps[state.activeResultTab])}
        </div>

        <!-- Top Ingredients Chips -->
        <div class="result-ingredients-row">
          <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-deep-sage);">Active extracts:</span>
          ${res.topIngredients.map(ing => `
            <button type="button" class="result-ing-chip" data-ingredient-id="${ing.id}" data-cursor="EXPLORE">
              ${ing.name}
            </button>
          `).join('')}
        </div>

        <!-- Pricing Summary -->
        <div class="result-pricing-box">
          <div class="result-price-line">
            <span>Ritual Formulations (${res.products.length} items)</span>
            <span>$${res.subtotal}</span>
          </div>
          <div class="result-price-line result-discount-line">
            <span>Ritual Studio Bundle (-10%)</span>
            <span>-$${res.discount}</span>
          </div>
          <div class="result-price-line result-total-line">
            <span>Total Complete Ritual</span>
            <span style="color: var(--color-moss);">$${res.total}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="result-actions-row">
          <button type="button" class="result-btn-add-bundle" data-cursor="ADD">
            <span>Add the full ritual ($${res.total}) ↗</span>
          </button>
          <button type="button" class="result-btn-retake">Retake the quiz</button>
        </div>
      </div>
    `;

    bindResultEvents();

    if (animate && !prefersReducedMotion) {
      // Circular Match Ring Stroke Animation
      const ringCircle = resultView.querySelector('.match-ring-circle');
      if (ringCircle) {
        const circumference = 2 * Math.PI * 28; // ~175.9
        const targetOffset = circumference - (res.matchScore / 100) * circumference;
        gsap.fromTo(ringCircle,
          { strokeDashoffset: circumference },
          { strokeDashoffset: targetOffset, duration: 1.2, ease: 'power2.out', delay: 0.2 }
        );
      }

      gsap.from('.result-left-col, .result-right-card', {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power3.out'
      });
    }
  }

  function renderResultSteps(steps = []) {
    return steps.map((s, idx) => `
      <div class="result-step-item">
        <span class="result-step-dot">0${idx + 1}</span>
        <div style="width: 32px; height: 32px; flex-shrink: 0;">
          ${drawProduct(s.product.id, { width: 32, height: 32 })}
        </div>
        <div class="result-step-info">
          <span class="result-step-name">${s.product.name}</span>
          <span class="result-step-sub">${s.instruction} (${s.wait})</span>
        </div>
      </div>
    `).join('');
  }

  function bindResultEvents() {
    // Tab toggles (AM / PM)
    const tabBtns = resultView.querySelectorAll('.result-tab-btn');
    const indicator = resultView.querySelector('.result-toggle-indicator');
    const timeline = resultView.querySelector('.result-steps-timeline');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === state.activeResultTab) return;
        state.activeResultTab = tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (indicator) {
          indicator.style.transform = tab === 'pm' ? 'translateX(100%)' : 'translateX(0%)';
        }

        const res = state.computedResult;
        if (timeline && res) {
          timeline.innerHTML = renderResultSteps(res.steps[tab]);
        }
      });
    });

    // Ingredient chips click -> close overlay & focus in explorer
    const ingChips = resultView.querySelectorAll('.result-ing-chip');
    ingChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.ingredientId;
        closeQuiz();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ingredient:focus', { detail: { id } }));
        }, 500);
      });
    });

    // Add Full Ritual Bundle
    const addBundleBtn = resultView.querySelector('.result-btn-add-bundle');
    if (addBundleBtn) {
      addBundleBtn.addEventListener('click', () => {
        const res = state.computedResult;
        if (!res) return;

        addBundleBtn.textContent = 'Adding ritual bundle...';

        // Add each product to cart with 120ms stagger
        res.products.forEach((prod, idx) => {
          setTimeout(() => {
            cart.add(prod.id, 1);
          }, idx * 120);
        });

        setTimeout(() => {
          closeQuiz();
        }, res.products.length * 120 + 350);
      });
    }

    // Retake the quiz
    const retakeBtn = resultView.querySelector('.result-btn-retake');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        state.currentIndex = 0;
        state.answers = { q1: null, q2: null, q3: null, q4: null, q5: null };
        state.computedResult = null;
        renderQuestion(0, true);
      });
    }
  }
}

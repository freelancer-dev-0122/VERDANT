// /src/js/sections/ingredients.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ingredients } from '../../data/ingredients.js';
import { products } from '../../data/products.js';
import { botanicals, drawProduct } from '../lib/botanicals.js';
import { setTone } from '../lib/tone.js';
import { scrollToAnchor } from '../lib/scroll.js';
import { splitTextIntoMaskedWords, revealMaskedWords, prefersReducedMotion } from '../lib/textSplitter.js';

gsap.registerPlugin(ScrollTrigger);

export function setupIngredients(section) {
  if (!section) return;

  // Single plain JS state object (no localStorage)
  const state = {
    activeIndex: 0,
    filters: new Set(),
    wheelAngle: -90, // initial rotation placing node 0 at 12 o'clock (-90 deg)
    isDragging: false,
    autoplayTimer: null,
    autoplayProgressTween: null,
    isHoveredOrInteracted: false,
    isInViewport: false
  };

  const wheelStage = section.querySelector('.ingredients-wheel-stage');
  const wheelTrack = section.querySelector('.wheel-rotating-track');
  const marker = section.querySelector('.wheel-marker-top');
  const centerBlob = section.querySelector('.wheel-center-blob');
  const centerArt = section.querySelector('.wheel-center-art');
  const progressArc = section.querySelector('.wheel-progress-arc-path');
  const detailCard = section.querySelector('.ingredient-detail-card');
  const detailWrap = section.querySelector('.detail-content-wrap');
  const filterPills = section.querySelectorAll('.concern-filter-pill');
  const clearFilterBtn = section.querySelector('.ingredients-clear-filter');
  const srLive = section.querySelector('.ingredients-sr-status');
  const backdropSprigs = section.querySelector('.wheel-botanicals-backdrop');

  // Insert 8 background floating sprigs
  if (backdropSprigs) {
    const sprigDefs = [
      { type: 'eucalyptus', top: '5%', left: '8%', depth: 0.12, rot: -20, scale: 0.6 },
      { type: 'oliveTwig', top: '12%', right: '10%', depth: 0.18, rot: 30, scale: 0.7 },
      { type: 'fern', bottom: '15%', left: '10%', depth: 0.14, rot: 15, scale: 0.65 },
      { type: 'rosemarySprig', bottom: '8%', right: '12%', depth: 0.22, rot: -35, scale: 0.75 },
      { type: 'singlePetal', top: '45%', left: '2%', depth: 0.24, rot: 40, scale: 0.8 },
      { type: 'monsteraPiece', top: '48%', right: '4%', depth: 0.1, rot: -15, scale: 0.55 },
      { type: 'singlePetal', bottom: '2%', left: '42%', depth: 0.2, rot: -25, scale: 0.7 },
      { type: 'oliveTwig', top: '2%', left: '48%', depth: 0.15, rot: 10, scale: 0.65 }
    ];

    sprigDefs.forEach((def) => {
      const el = document.createElement('div');
      el.className = 'wheel-sprig-bg';
      el.dataset.depth = def.depth;
      el.style.top = def.top || 'auto';
      el.style.bottom = def.bottom || 'auto';
      el.style.left = def.left || 'auto';
      el.style.right = def.right || 'auto';
      el.style.transform = `rotate(${def.rot}deg) scale(${def.scale})`;

      const builder = botanicals[def.type] || botanicals.singlePetal;
      el.innerHTML = builder({ width: 70, height: 90 });
      backdropSprigs.appendChild(el);
    });

    // Parallax background sprigs with mouse
    const bgSprigs = Array.from(backdropSprigs.querySelectorAll('.wheel-sprig-bg'));
    const parallaxSetters = bgSprigs.map((sp) => {
      const depth = parseFloat(sp.dataset.depth) || 0.15;
      return {
        xTo: gsap.quickTo(sp, 'x', { duration: 0.6, ease: 'power2.out' }),
        yTo: gsap.quickTo(sp, 'y', { duration: 0.6, ease: 'power2.out' }),
        depth
      };
    });

    window.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return;
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      parallaxSetters.forEach((item) => {
        item.xTo(nx * 24 * (item.depth / 0.15));
        item.yTo(ny * 24 * (item.depth / 0.15));
      });
    }, { passive: true });
  }

  // Populate 8 Wheel Nodes on the rotating track
  const nodeElements = [];
  const nodeCount = ingredients.length;
  const radius = 240; // baseline radius (scaled fluidly in CSS/DOM)

  wheelTrack.innerHTML = '';
  ingredients.forEach((ing, i) => {
    const angleDeg = (i * 360) / nodeCount; // 0, 45, 90, 135, 180, 225, 270, 315
    const angleRad = (angleDeg * Math.PI) / 180;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `wheel-node-item tone-${ing.tone} ${i === 0 ? 'is-selected' : ''}`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `${ing.name}, ${ing.role}`);
    btn.dataset.index = i;
    btn.dataset.id = ing.id;
    btn.dataset.baseAngle = angleDeg;

    // Node placement on circular ring
    btn.style.left = `calc(50% + ${Math.cos(angleRad) * 44}%)`;
    btn.style.top = `calc(50% + ${Math.sin(angleRad) * 44}%)`;

    const artFn = botanicals[ing.art] || botanicals.singlePetal;
    btn.innerHTML = `
      <div class="wheel-node-inner">
        <div class="wheel-node-art">
          ${artFn({ width: 44, height: 44 })}
        </div>
        <span class="wheel-node-label">${ing.name}</span>
      </div>
      <span class="wheel-node-dot"></span>
    `;

    wheelTrack.appendChild(btn);
    nodeElements.push(btn);
  });

  // Center blob morph loop
  if (centerBlob) {
    const blobFrames = [
      '60% 40% 55% 45% / 45% 55% 45% 55%',
      '42% 58% 45% 55% / 55% 45% 58% 42%',
      '55% 45% 65% 35% / 40% 60% 40% 60%'
    ];
    let bfIdx = 0;
    gsap.to(centerBlob, {
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      onRepeat: () => {
        bfIdx = (bfIdx + 1) % blobFrames.length;
        centerBlob.style.borderRadius = blobFrames[bfIdx];
      }
    });
  }

  // Heading masked word reveal on enter
  const heading = section.querySelector('.ingredients-title');
  if (heading) {
    const words = splitTextIntoMaskedWords(heading);
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      once: true,
      onEnter: () => revealMaskedWords(words, { duration: 1.1, stagger: 0.08 })
    });
  }

  // Section entrance animation
  const ringsSvg = section.querySelector('.wheel-rings-svg circle');
  ScrollTrigger.create({
    trigger: section,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      // Ring draws in
      if (ringsSvg) {
        gsap.fromTo(ringsSvg, 
          { strokeDasharray: 1400, strokeDashoffset: 1400 },
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' }
        );
      }
      // Nodes pop in with elastic.out
      gsap.from(nodeElements, {
        scale: 0,
        opacity: 0,
        stagger: 0.06,
        duration: 0.9,
        ease: 'elastic.out(1.2, 0.5)'
      });
      // Center hub grows
      gsap.from('.wheel-center-hub', {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
      // Detail panel fades up
      gsap.from(detailCard, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
      });
    }
  });

  // Tone management: entering calls setTone('bone')
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => setTone('bone'),
    onEnterBack: () => setTone('bone')
  });

  // Track viewport presence for autoplay & lag saving
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => { state.isInViewport = true; startAutoplayCountdown(); },
    onLeave: () => { state.isInViewport = false; pauseAutoplayCountdown(); },
    onEnterBack: () => { state.isInViewport = true; startAutoplayCountdown(); },
    onLeaveBack: () => { state.isInViewport = false; pauseAutoplayCountdown(); }
  });

  // Initial wheel angle & orientation
  setWheelRotation(-90, false);
  renderDetailPanel(0, false);

  // -------------------------------------------------------------
  // ROTATION & COUNTER-ROTATION ENGINE
  // -------------------------------------------------------------
  function setWheelRotation(angleDeg, animate = true, duration = 1) {
    state.wheelAngle = angleDeg;

    if (!animate || prefersReducedMotion) {
      gsap.set(wheelTrack, { rotation: angleDeg });
      nodeElements.forEach((node) => {
        const inner = node.querySelector('.wheel-node-inner');
        if (inner) gsap.set(inner, { rotation: -angleDeg });
      });
    } else {
      gsap.to(wheelTrack, {
        rotation: angleDeg,
        duration,
        ease: 'expo.inOut',
        onUpdate: () => {
          const curRot = gsap.getProperty(wheelTrack, 'rotation');
          nodeElements.forEach((node) => {
            const inner = node.querySelector('.wheel-node-inner');
            if (inner) gsap.set(inner, { rotation: -curRot });
          });
        }
      });
    }
  }

  // Calculate shortest angle to bring node index to 12 o'clock (-90 degrees)
  function rotateToIngredient(index, animate = true) {
    if (index < 0 || index >= nodeCount) return;

    const targetNodeAngle = (index * 360) / nodeCount;
    // Current normalized angle
    const currentTrackAngle = state.wheelAngle;
    // Target track angle such that targetNodeAngle + targetTrackAngle = -90 (mod 360)
    let desiredAngle = -90 - targetNodeAngle;

    // Shortest angular path
    const diff = (desiredAngle - currentTrackAngle) % 360;
    const shortestDiff = ((diff + 540) % 360) - 180;
    const finalAngle = currentTrackAngle + shortestDiff;

    setWheelRotation(finalAngle, animate, animate ? 1.0 : 0);
    setActiveIngredient(index, animate);
  }

  // Soft tick on marker
  function playTickAnimation() {
    if (prefersReducedMotion) return;
    gsap.fromTo(marker, { scale: 1.35 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
  }

  // -------------------------------------------------------------
  // DETAIL PANEL RENDERING (Discrete swap with circular clip-path)
  // -------------------------------------------------------------
  function renderDetailPanel(index, animate = true) {
    const ing = ingredients[index];
    if (!ing) return;

    if (srLive) {
      srLive.textContent = `${ing.name}, ${ing.latin}. Role: ${ing.role}. Purity: ${ing.percent}%. Sourced from ${ing.origin}.`;
    }

    // Tone tint mapping for panel background
    const toneBgs = {
      sage: 'rgba(169, 183, 158, 0.22)',
      clay: 'rgba(201, 143, 114, 0.22)',
      bone: 'rgba(247, 243, 234, 0.96)'
    };
    detailCard.style.setProperty('--panel-bg', toneBgs[ing.tone] || 'var(--color-paper)');

    // Center Hub Featured Art swap
    const artBuilder = botanicals[ing.art] || botanicals.singlePetal;
    if (centerArt) {
      if (animate && !prefersReducedMotion) {
        gsap.to(centerArt, {
          scale: 0.7,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            centerArt.innerHTML = artBuilder({ width: 150, height: 150 });
            gsap.to(centerArt, { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.5)' });
          }
        });
      } else {
        centerArt.innerHTML = artBuilder({ width: 150, height: 150 });
      }
    }

    // Associated Products
    const associatedProducts = products.filter(p => ing.foundIn.includes(p.id));

    const htmlContent = `
      <div class="detail-top-meta">
        <span class="detail-counter">0${index + 1} / 08</span>
        <span class="detail-origin">
          <svg class="detail-pin-svg" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Sourced from ${ing.origin}
        </span>
      </div>

      <h3 class="detail-name">${ing.name}</h3>
      <div class="detail-latin">${ing.latin}</div>

      <div class="detail-tags-row">
        <span class="detail-role-pill">${ing.role}</span>
        ${ing.concerns.map(c => `<span class="detail-concern-tag">${c}</span>`).join('')}
      </div>

      <p class="detail-blurb">${ing.blurb}</p>

      <div class="detail-metrics-row">
        <div class="purity-ring-wrap">
          <svg class="purity-ring-svg" viewBox="0 0 76 76">
            <circle class="purity-ring-track" cx="38" cy="38" r="34"/>
            <circle class="purity-ring-circle" cx="38" cy="38" r="34"/>
          </svg>
          <div class="purity-ring-center">
            <span class="purity-num">${ing.percent}%</span>
            <span class="purity-label">PURITY</span>
          </div>
        </div>

        <div class="detail-fact-box">
          <span class="detail-fact-heading">Botanical Field Note</span>
          <p class="detail-fact-text">${ing.fact}</p>
        </div>
      </div>

      <div class="detail-found-in-wrap">
        <span class="detail-found-label">Formulated in:</span>
        <div class="detail-products-list">
          ${associatedProducts.map(prod => `
            <button type="button" class="detail-product-chip" data-product-id="${prod.id}" data-cursor="VIEW">
              <span class="detail-prod-thumb">${drawProduct(prod.id, { width: 22, height: 22 })}</span>
              <span>${prod.name} (${prod.no})</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    if (!animate || prefersReducedMotion) {
      detailWrap.innerHTML = htmlContent;
      bindDetailEvents();
      return;
    }

    // Discrete Transition: fade out old content 0.2s, reveal incoming via circular clip-path
    gsap.to(detailWrap, {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        detailWrap.innerHTML = htmlContent;
        bindDetailEvents();

        // Animate circular clip-path reveal (0.7s, power3.out)
        gsap.fromTo(detailWrap,
          { clipPath: 'circle(0% at 30% 20%)', opacity: 1 },
          { clipPath: 'circle(150% at 30% 20%)', duration: 0.7, ease: 'power3.out' }
        );

        // Name characters rise with stagger
        const nameEl = detailWrap.querySelector('.detail-name');
        if (nameEl) {
          const words = splitTextIntoMaskedWords(nameEl);
          revealMaskedWords(words, { duration: 0.65, stagger: 0.04 });
        }

        // Purity Ring Stroke Animation
        const ringCircle = detailWrap.querySelector('.purity-ring-circle');
        if (ringCircle) {
          const circumference = 2 * Math.PI * 34; // ~213.6
          const targetOffset = circumference - (ing.percent / 100) * circumference;
          gsap.fromTo(ringCircle,
            { strokeDashoffset: circumference },
            { strokeDashoffset: targetOffset, duration: 1.1, ease: 'power2.out', delay: 0.1 }
          );
        }
      }
    });

    function bindDetailEvents() {
      // Clicking a product chip smooth-scrolls to #shop and targets that product's card
      const prodChips = detailWrap.querySelectorAll('.detail-product-chip');
      prodChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const pId = chip.dataset.productId;
          const targetCard = document.querySelector(`.product-card[data-id="${pId}"]`) || document.getElementById('shop');
          if (targetCard) {
            scrollToAnchor(targetCard, { offset: -90, duration: 1.4 });
          }
        });
      });
    }
  }

  function setActiveIngredient(index, animate = true) {
    if (state.activeIndex === index && nodeElements[index].classList.contains('is-selected')) {
      return;
    }
    state.activeIndex = index;

    nodeElements.forEach((node, i) => {
      const isSel = i === index;
      node.classList.toggle('is-selected', isSel);
      node.setAttribute('aria-checked', isSel ? 'true' : 'false');
    });

    playTickAnimation();
    renderDetailPanel(index, animate);

    // Screen reader announcement
    if (srLive) {
      srLive.textContent = `Selected ingredient: ${ingredients[index].name}, ${ingredients[index].role}`;
    }
  }

  // -------------------------------------------------------------
  // INTERACTION: CLICK ON NODE
  // -------------------------------------------------------------
  nodeElements.forEach((node) => {
    node.addEventListener('click', () => {
      const idx = parseInt(node.dataset.index, 10);
      userInteracted();
      rotateToIngredient(idx, true);
    });
  });

  // -------------------------------------------------------------
  // INTERACTION: POINTER DRAG WITH VELOCITY INERTIA & MAGNETIC SNAP
  // -------------------------------------------------------------
  let startAngle = 0;
  let startTrackAngle = 0;
  let lastAngles = [];
  let isDragging = false;

  function getAngleFromEvent(e) {
    const rect = wheelStage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    return (rad * 180) / Math.PI;
  }

  wheelStage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.concern-filter-pill')) return;
    userInteracted();
    isDragging = true;
    wheelStage.setPointerCapture(e.pointerId);
    startAngle = getAngleFromEvent(e);
    startTrackAngle = state.wheelAngle;
    lastAngles = [{ angle: startAngle, time: Date.now() }];
    gsap.killTweensOf(wheelTrack);
  });

  wheelStage.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const currentAngle = getAngleFromEvent(e);
    const delta = currentAngle - startAngle;
    const newTrackAngle = startTrackAngle + delta;

    setWheelRotation(newTrackAngle, false);

    lastAngles.push({ angle: currentAngle, time: Date.now() });
    if (lastAngles.length > 5) lastAngles.shift();
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    try { wheelStage.releasePointerCapture(e.pointerId); } catch (_) {}

    // Calculate angular velocity for inertia
    let velocity = 0;
    if (lastAngles.length >= 2) {
      const first = lastAngles[0];
      const last = lastAngles[lastAngles.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt > 0.02) {
        velocity = (last.angle - first.angle) / dt;
      }
    }
    // Cap velocity
    velocity = Math.max(-600, Math.min(600, velocity));

    // Coast distance with inertia
    const coastDelta = velocity * 0.28;
    const coastTarget = state.wheelAngle + coastDelta;

    // Find nearest node to 12 o'clock (-90 degrees)
    // node i position: coastTarget + (i * 360 / 8) === -90 (mod 360)
    // node i angle = (i * 45)
    // We want: (nodeAngle + coastTarget) to be closest to -90
    // => nodeAngle closest to -90 - coastTarget
    const targetOffset = ((-90 - coastTarget) % 360 + 360) % 360;
    let closestIndex = Math.round(targetOffset / (360 / nodeCount)) % nodeCount;

    // If active filters exist, snap to closest matching ingredient
    if (state.filters.size > 0) {
      closestIndex = getClosestMatchingIndex(closestIndex);
    }

    rotateToIngredient(closestIndex, true);
  }

  wheelStage.addEventListener('pointerup', endDrag);
  wheelStage.addEventListener('pointercancel', endDrag);

  // -------------------------------------------------------------
  // KEYBOARD ACCESSIBILITY (Radiogroup navigation)
  // -------------------------------------------------------------
  wheelStage.addEventListener('keydown', (e) => {
    let nextIndex = state.activeIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (state.activeIndex + 1) % nodeCount;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (state.activeIndex - 1 + nodeCount) % nodeCount;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = nodeCount - 1;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      rotateToIngredient(state.activeIndex, true);
      return;
    } else {
      return;
    }

    userInteracted();
    nodeElements[nextIndex].focus();
    rotateToIngredient(nextIndex, true);
  });

  // -------------------------------------------------------------
  // CONCERN FILTERS (HYDRATION / CALM / GLOW / BARRIER)
  // -------------------------------------------------------------
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      userInteracted();
      const concern = pill.dataset.concern;

      if (state.filters.has(concern)) {
        state.filters.delete(concern);
        pill.classList.remove('active');
      } else {
        state.filters.add(concern);
        pill.classList.add('active');
      }

      applyFilters();
    });
  });

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', () => {
      userInteracted();
      state.filters.clear();
      filterPills.forEach(p => p.classList.remove('active'));
      applyFilters();
    });
  }

  function applyFilters() {
    const hasFilters = state.filters.size > 0;
    if (clearFilterBtn) {
      clearFilterBtn.classList.toggle('visible', hasFilters);
    }

    nodeElements.forEach((node, i) => {
      const ing = ingredients[i];
      if (!hasFilters) {
        node.classList.remove('dimmed');
      } else {
        const matches = Array.from(state.filters).some(c => ing.concerns.includes(c));
        node.classList.toggle('dimmed', !matches);
      }
    });

    if (hasFilters) {
      // Rotate to nearest matching ingredient if current one does not match
      const curIng = ingredients[state.activeIndex];
      const curMatches = Array.from(state.filters).some(c => curIng.concerns.includes(c));
      if (!curMatches) {
        const matchIdx = getClosestMatchingIndex(state.activeIndex);
        rotateToIngredient(matchIdx, true);
      }
    }
  }

  function getClosestMatchingIndex(fromIndex) {
    if (state.filters.size === 0) return fromIndex;
    let bestDist = Infinity;
    let bestIdx = fromIndex;

    ingredients.forEach((ing, i) => {
      const matches = Array.from(state.filters).some(c => ing.concerns.includes(c));
      if (matches) {
        const dist = Math.min(
          Math.abs(i - fromIndex),
          nodeCount - Math.abs(i - fromIndex)
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
    });

    return bestIdx;
  }

  // -------------------------------------------------------------
  // AUTOPLAY ENGINE (6s idle threshold, advances every 5s)
  // -------------------------------------------------------------
  function userInteracted() {
    state.isHoveredOrInteracted = true;
    pauseAutoplayCountdown();
    // Pause for 10s after interaction, then resume
    clearTimeout(state.interactionTimeout);
    state.interactionTimeout = setTimeout(() => {
      state.isHoveredOrInteracted = false;
      startAutoplayCountdown();
    }, 10000);
  }

  function startAutoplayCountdown() {
    if (prefersReducedMotion || !state.isInViewport || state.isHoveredOrInteracted) {
      return;
    }

    pauseAutoplayCountdown();

    if (progressArc) {
      const circumference = 740;
      state.autoplayProgressTween = gsap.fromTo(progressArc,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: 0,
          duration: 5,
          ease: 'linear',
          onComplete: () => {
            // Advance to next ingredient
            let nextIdx = (state.activeIndex + 1) % nodeCount;
            if (state.filters.size > 0) {
              nextIdx = getClosestMatchingIndex(nextIdx);
            }
            rotateToIngredient(nextIdx, true);
            startAutoplayCountdown();
          }
        }
      );
    }
  }

  function pauseAutoplayCountdown() {
    if (state.autoplayProgressTween) {
      state.autoplayProgressTween.kill();
      state.autoplayProgressTween = null;
    }
    if (progressArc) {
      progressArc.style.strokeDashoffset = '740';
    }
  }

  wheelStage.addEventListener('mouseenter', userInteracted);
  wheelStage.addEventListener('mouseleave', () => {
    // Leave delay
  });

  // -------------------------------------------------------------
  // EXTERNAL EVENT LISTENERS: "ingredient:focus" & Collection Links
  // -------------------------------------------------------------
  window.addEventListener('ingredient:focus', (e) => {
    const id = e.detail?.id;
    if (!id) return;
    const targetIdx = ingredients.findIndex(ing => ing.id === id);
    if (targetIdx !== -1) {
      userInteracted();
      scrollToAnchor(section, { offset: -90, duration: 1.4 });
      rotateToIngredient(targetIdx, true);
    }
  });

  // Listen to any "See ingredients" link clicks across the site
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.product-link-ingredients, [data-goto-ingredient]');
    if (link) {
      e.preventDefault();
      // Find parent product card to get product id
      const card = link.closest('.product-card');
      const prodId = card ? card.dataset.id : link.dataset.gotoIngredient;
      const matchingIng = ingredients.find(ing => ing.foundIn.includes(prodId));

      if (matchingIng) {
        const targetIdx = ingredients.indexOf(matchingIng);
        userInteracted();
        scrollToAnchor(section, { offset: -90, duration: 1.4 });
        setTimeout(() => {
          rotateToIngredient(targetIdx, true);
        }, 500);
      } else {
        scrollToAnchor(section, { offset: -90, duration: 1.4 });
      }
    }
  });
}

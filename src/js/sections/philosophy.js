// /src/js/sections/philosophy.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { botanicals } from '../lib/botanicals.js';
import { setTone } from '../lib/tone.js';
import { splitTextIntoMaskedWords, revealMaskedWords, prefersReducedMotion } from '../lib/textSplitter.js';

gsap.registerPlugin(ScrollTrigger);

export function setupPhilosophy(section) {
  if (!section) return;

  // Insert botanical badge illustrations for the 3 principles
  const badgeContainers = section.querySelectorAll('.principle-blob-badge');
  const badgeIllustrators = [
    botanicals.rosemarySprig,
    botanicals.eucalyptus,
    botanicals.oliveTwig
  ];

  badgeContainers.forEach((badge, idx) => {
    const fn = badgeIllustrators[idx] || botanicals.singlePetal;
    badge.innerHTML = fn({ width: 34, height: 34 });
  });

  // Words reveal for the headline on enter
  const heading = section.querySelector('.philosophy-heading');
  let headingWords = [];
  if (heading) {
    headingWords = splitTextIntoMaskedWords(heading);
  }

  // Section tone trigger: entering calls setTone('moss'), leaving back to hero calls setTone('sage')
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 45%',
    onEnter: () => setTone('moss'),
    onEnterBack: () => setTone('moss'),
    onLeaveBack: () => setTone('sage')
  });

  // Intro reveal trigger
  ScrollTrigger.create({
    trigger: heading,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      revealMaskedWords(headingWords, { duration: 1.1, stagger: 0.08 });
    }
  });

  // THE GROWING STEM ANIMATION
  const stage = section.querySelector('.philosophy-stage');
  const stemPath = section.querySelector('.stem-draw-path');
  const stemBud = section.querySelector('.stem-bud');
  const leafPairs = section.querySelectorAll('.stem-leaf-pair');
  const principles = section.querySelectorAll('.principle-item');

  if (stage && stemPath && stemBud) {
    const totalLength = stemPath.getTotalLength ? stemPath.getTotalLength() : 900;

    if (prefersReducedMotion) {
      // Reduced motion: fully drawn immediately
      gsap.set(stemPath, { strokeDasharray: totalLength, strokeDashoffset: 0 });
      gsap.set(stemBud, { opacity: 0 });
      principles.forEach(p => gsap.set(p, { opacity: 1, y: 0 }));
      leafPairs.forEach(l => gsap.set(l, { scale: 1, opacity: 1 }));
    } else {
      // Set initial path state
      gsap.set(stemPath, {
        strokeDasharray: totalLength,
        strokeDashoffset: totalLength
      });

      // Coordinates at stem start (length 0)
      const startPoint = stemPath.getPointAtLength(0);
      gsap.set(stemBud, { attr: { cx: startPoint.x, cy: startPoint.y } });

      // Track 3 milestone points along the stem (e.g., 25%, 55%, 85%)
      const milestones = [
        { progress: 0.22, triggered: false, index: 0 },
        { progress: 0.54, triggered: false, index: 1 },
        { progress: 0.86, triggered: false, index: 2 }
      ];

      // Scrubbed stem drawing with ScrollTrigger
      ScrollTrigger.create({
        trigger: stage,
        start: 'top 60%',
        end: 'bottom 70%',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const currentLength = progress * totalLength;
          stemPath.style.strokeDashoffset = totalLength - currentLength;

          if (currentLength > 0 && currentLength <= totalLength) {
            const point = stemPath.getPointAtLength(currentLength);
            stemBud.setAttribute('cx', point.x);
            stemBud.setAttribute('cy', point.y);
          }

          // Check milestone unfurl triggers (reversible on scroll up)
          milestones.forEach((m) => {
            const pair = leafPairs[m.index];
            const principle = principles[m.index];

            if (progress >= m.progress && !m.triggered) {
              m.triggered = true;

              // 1. Leaf pair unfurls from base with elastic.out
              if (pair) {
                gsap.to(pair, {
                  scale: 1,
                  opacity: 1,
                  duration: 0.8,
                  ease: 'elastic.out(1.2, 0.4)',
                  overwrite: 'auto'
                });
              }

              // 2. Principle appears: translateY 40px -> 0 and opacity
              if (principle) {
                gsap.to(principle, {
                  y: 0,
                  opacity: 1,
                  duration: 0.9,
                  ease: 'power3.out',
                  overwrite: 'auto'
                });

                // Heading chars rise
                const pTitle = principle.querySelector('.principle-title');
                if (pTitle && !principle.dataset.split) {
                  principle.dataset.split = 'true';
                  const titleWords = splitTextIntoMaskedWords(pTitle);
                  revealMaskedWords(titleWords, { duration: 0.85, stagger: 0.05 });
                }
              }
            } else if (progress < m.progress && m.triggered) {
              m.triggered = false;

              if (pair) {
                gsap.to(pair, {
                  scale: 0,
                  opacity: 0,
                  duration: 0.4,
                  ease: 'power2.in',
                  overwrite: 'auto'
                });
              }

              if (principle) {
                gsap.to(principle, {
                  y: 40,
                  opacity: 0,
                  duration: 0.4,
                  ease: 'power2.in',
                  overwrite: 'auto'
                });
              }
            }
          });
        }
      });
    }
  }

  // STATS ODOMETER DIGITS (Numbers render their FINAL value by default, animation plays on top)
  const statsRow = section.querySelector('.philosophy-stats-row');
  if (statsRow) {
    const statItems = [
      { el: statsRow.querySelector('[data-stat="plastic"]'), endVal: 0, prefix: '', suffix: '' },
      { el: statsRow.querySelector('[data-stat="natural"]'), endVal: 98, prefix: '', suffix: '%' },
      { el: statsRow.querySelector('[data-stat="ingredients"]'), endVal: 12, prefix: '', suffix: '' }
    ];

    ScrollTrigger.create({
      trigger: statsRow,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        statItems.forEach(({ el, endVal, suffix }) => {
          if (!el) return;
          const numSpan = el.querySelector('.stat-val');
          if (!numSpan) return;

          const counter = { val: 0 };
          gsap.to(counter, {
            val: endVal,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              numSpan.textContent = Math.round(counter.val);
            }
          });
        });
      }
    });
  }
}

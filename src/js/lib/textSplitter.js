// /src/js/lib/textSplitter.js
import gsap from 'gsap';

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Splits text inside element into wrapped words and characters for masked reveal animations.
 * Ensures line-height 1.1 and padding-bottom 0.16em with equal negative margin so descenders are never clipped.
 */
export function splitTextIntoMaskedWords(element) {
  if (!element) return [];

  const text = element.innerText.trim();
  const words = text.split(/\s+/);

  element.innerHTML = '';
  element.classList.add('split-masked-container');
  element.style.lineHeight = '1.1';

  const wordSpans = [];

  words.forEach((word, i) => {
    const maskWrapper = document.createElement('span');
    maskWrapper.className = 'split-mask-wrapper';
    maskWrapper.style.display = 'inline-block';
    maskWrapper.style.overflow = 'hidden';
    maskWrapper.style.verticalAlign = 'top';
    maskWrapper.style.paddingBottom = '0.16em';
    maskWrapper.style.marginBottom = '-0.16em';

    const wordInner = document.createElement('span');
    wordInner.className = 'split-word-inner';
    wordInner.style.display = 'inline-block';
    wordInner.textContent = word;

    maskWrapper.appendChild(wordInner);
    element.appendChild(maskWrapper);
    wordSpans.push(wordInner);

    if (i < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });

  return wordSpans;
}

/**
 * Animate masked words into view with soft stagger
 */
export function revealMaskedWords(words, options = {}) {
  if (prefersReducedMotion) {
    gsap.set(words, { y: 0, opacity: 1 });
    return Promise.resolve();
  }

  gsap.set(words, { y: '115%', opacity: 0 });

  return gsap.to(words, {
    y: '0%',
    opacity: 1,
    duration: options.duration || 1.1,
    stagger: options.stagger || 0.06,
    ease: options.ease || 'power3.out',
    delay: options.delay || 0
  });
}

// /src/js/lib/tone.js
import gsap from 'gsap';
import { PALETTE } from './botanicals.js';

export const TONES = {
  bone: {
    bg: PALETTE.bone,
    fg: PALETTE.moss,
    cursorBlend: 'multiply',
    dockBg: 'rgba(247, 243, 234, 0.92)',
    dockFg: PALETTE.moss
  },
  sage: {
    bg: PALETTE.sage,
    fg: PALETTE.moss,
    cursorBlend: 'multiply',
    dockBg: 'rgba(247, 243, 234, 0.92)',
    dockFg: PALETTE.moss
  },
  clay: {
    bg: PALETTE.clay,
    fg: PALETTE.moss,
    cursorBlend: 'multiply',
    dockBg: 'rgba(247, 243, 234, 0.92)',
    dockFg: PALETTE.moss
  },
  moss: {
    bg: PALETTE.moss,
    fg: PALETTE.paper,
    cursorBlend: 'screen',
    dockBg: 'rgba(46, 59, 44, 0.94)',
    dockFg: PALETTE.paper
  }
};

let currentTone = 'bone';
let activeToneTween = null;

export function getTone() {
  return currentTone;
}

/**
 * setTone('bone' | 'sage' | 'clay' | 'moss')
 * Tweens CSS variables --bg and --fg on document (0.9s, power2.inOut).
 * Debounces rapid calls and guarantees the last call wins without color fights.
 */
export function setTone(toneName, immediate = false) {
  const target = TONES[toneName];
  if (!target) return;

  if (activeToneTween) {
    activeToneTween.kill();
    activeToneTween = null;
  }

  currentTone = toneName;
  document.body.setAttribute('data-tone', toneName);

  // Instantly apply non-color properties to prevent delayed flashes
  document.documentElement.style.setProperty('--cursor-blend', target.cursorBlend);
  document.documentElement.style.setProperty('--dock-bg', target.dockBg);
  document.documentElement.style.setProperty('--dock-fg', target.dockFg);
  window.dispatchEvent(new CustomEvent('tone:change', { detail: { tone: toneName, ...target } }));

  if (immediate) {
    document.documentElement.style.setProperty('--bg', target.bg);
    document.documentElement.style.setProperty('--fg', target.fg);
    return;
  }

  const currentBg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || PALETTE.bone;
  const currentFg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || PALETTE.moss;

  const colorObj = {
    bg: currentBg,
    fg: currentFg
  };

  activeToneTween = gsap.to(colorObj, {
    bg: target.bg,
    fg: target.fg,
    duration: 0.8,
    ease: 'power2.out',
    onUpdate: () => {
      document.documentElement.style.setProperty('--bg', colorObj.bg);
      document.documentElement.style.setProperty('--fg', colorObj.fg);
    },
    onComplete: () => {
      document.documentElement.style.setProperty('--bg', target.bg);
      document.documentElement.style.setProperty('--fg', target.fg);
      activeToneTween = null;
    }
  });
}

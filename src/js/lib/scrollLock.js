// /src/js/lib/scrollLock.js
// Centralized scroll-lock and overlay manager with reference counting,
// scrollbar width compensation, page inertia, and bulletproof unlock paths.

import { stopScroll, startScroll } from './scroll.js';

class ScrollLockManager {
  constructor() {
    this.activeLocks = new Set();
    this.previousPaddingRight = '';
    this.scrollbarWidth = 0;
    this.lastTriggerElements = new Map();

    this._initFailsafes();
  }

  _calculateScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  /**
   * Lock scroll for a specific overlay ID.
   * @param {string} id - Unique identifier of the overlay (e.g. 'cart', 'quiz', 'journal')
   * @param {HTMLElement|null} triggerEl - The element that triggered the overlay
   */
  lock(id, triggerEl = null) {
    if (triggerEl) {
      this.lastTriggerElements.set(id, triggerEl);
    }

    const wasEmpty = this.activeLocks.size === 0;
    this.activeLocks.add(id);

    if (wasEmpty) {
      this.scrollbarWidth = Math.max(0, this._calculateScrollbarWidth());
      this.previousPaddingRight = document.body.style.paddingRight || '';

      if (this.scrollbarWidth > 0) {
        document.body.style.paddingRight = `${this.scrollbarWidth}px`;
      }

      document.body.classList.add('has-overlay-open');
      stopScroll();

      // Make background elements inert to assistive tech and pointer events
      this._setInert(true);
    }
  }

  /**
   * Unlock scroll for a specific overlay ID.
   * @param {string} id - Unique identifier of the overlay
   */
  unlock(id) {
    this.activeLocks.delete(id);

    // Restore focus to trigger element if available
    const trigger = this.lastTriggerElements.get(id);
    if (trigger && typeof trigger.focus === 'function') {
      try {
        trigger.focus();
      } catch (_) {}
    }
    this.lastTriggerElements.delete(id);

    if (this.activeLocks.size === 0) {
      this._releaseAll();
    }
  }

  /**
   * Unconditionally unlocks and releases all locks (failsafe for route changes, resize, unload).
   */
  forceUnlockAll() {
    this.activeLocks.clear();
    this.lastTriggerElements.clear();
    this._releaseAll();
  }

  _releaseAll() {
    document.body.classList.remove('has-overlay-open');
    document.body.style.paddingRight = this.previousPaddingRight;
    this._setInert(false);
    startScroll();
  }

  _setInert(isInert) {
    const mainContent = document.querySelector('main');
    const heroHeader = document.querySelector('header.hero-section');
    const dockNav = document.querySelector('.verdant-dock-wrap');
    const footerEl = document.querySelector('footer');

    [mainContent, heroHeader, dockNav, footerEl].forEach(el => {
      if (!el) return;
      if (isInert) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    });
  }

  isLocked() {
    return this.activeLocks.size > 0;
  }

  _initFailsafes() {
    if (typeof window === 'undefined') return;

    // Guaranteed unlock on window resize or orientation change
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.activeLocks.size === 0) {
          this._releaseAll();
        }
      }, 150);
    });

    window.addEventListener('orientationchange', () => {
      if (this.activeLocks.size === 0) {
        this._releaseAll();
      }
    });

    // Hash or route changes
    window.addEventListener('hashchange', () => {
      if (this.activeLocks.size === 0) {
        this._releaseAll();
      }
    });

    window.addEventListener('popstate', () => {
      this.forceUnlockAll();
    });

    // Page unloads
    window.addEventListener('beforeunload', () => {
      this.forceUnlockAll();
    });

    // Visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.activeLocks.size === 0) {
        this._releaseAll();
      }
    });
  }
}

export const scrollLock = new ScrollLockManager();

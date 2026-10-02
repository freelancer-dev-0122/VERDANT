# VERDANT — Slow Botanical Skincare Studio

A premium, tactile, Awwwards-level skincare brand website built with Vite, vanilla JavaScript, GSAP, Lenis, and custom CSS design tokens. Designed to feel like a slow, mindful ritual in an artisanal botanical dispensary.

---

## ✨ Features & Architecture

### 1. Design System & Palette
- **Strict Curated Palette**:
  - `bone`: `#EFE9DD`
  - `paper`: `#F7F3EA`
  - `sage`: `#A9B79E`
  - `deep sage`: `#6F8268`
  - `clay`: `#C98F72`
  - `moss`: `#2E3B2C`
- **Flat Forms**: No generic gradients; soft highlights on glass and labels are rendered as flat translucent shapes (`rgba`/opacity).
- **Clay Accents Only**: Clay is preserved strictly for mindful accents (stickers, dots, and the italic emphasis word).
- **Paper Grain Overlay**: Continuous SVG fractal noise overlay (6% opacity, pointer-events none).
- **Typography**:
  - Headlines: *Bricolage Grotesque* (300 to 500 weight)
  - Accents: *Instrument Serif* (italic)
  - Body & Labels: *Figtree*
- **Fluid Layout**: Viewport-scaled fluid typography using `clamp()` and 28px–999px organic border radii.

### 2. Global Tone System (`/src/js/lib/tone.js`)
- CSS variables `--bg`, `--fg`, `--dock-bg`, `--dock-fg`, and `--cursor-blend` on body.
- Helper `setTone('bone' | 'sage' | 'clay' | 'moss')` tweens body background and text colors smoothly over 0.9s (`power2.inOut`).
- Sections dynamically update page tones upon scroll:
  - Hero: `sage`
  - Shop: `bone`
  - Ingredients: `sage`
  - Ritual: `clay`
  - Journal: `moss` (cursor switches blend-mode to `screen` and dock adapts to dark moss mode).

### 3. Scroll Engine (`/src/js/lib/scroll.js`)
- Single Lenis instance driven strictly by the GSAP ticker:
  ```javascript
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- `html { overflow-x: clip }` with zero `scroll-behavior: smooth` conflicts.
- Auto-sleep on tab blur/hidden via `document.visibilitychange`.
- Seamless smooth scrolling to anchors with custom exponential easing.

### 4. Seedling Loader (`/src/js/sections/loader.js`)
- No percentage counters or generic progress bars.
- Botanical seedling choreography:
  1. Clay seed drops in with soft `bounce.out`.
  2. Stem draws upward via `stroke-dashoffset`.
  3. Two leaves unfurl with `elastic.out`.
  4. Instrument Serif "verdant" fades up.
  5. The sage bud expands as a circular clip-path across the full viewport, becoming the hero canvas.
- Page scroll is locked during loading (`lenis.stop()`) and unlocked upon exit (`lenis.start()`).

### 5. Hero Stage (`/src/js/sections/hero.js`)
- **Organic Blob**: 62vh center stage continuously morphing between 4 organic shapes (8-value border-radius loop).
- **Floating Products Composite**:
  - *Dew Serum* (No.01) centered with translucent dropper pipette.
  - *Moss Cream* jar behind left at 70% scale.
  - *Petal Mist* spray bottle to the right.
  - Independent gentle bobbing and subtle scale pulses.
- **Orbit Ring**: 1px moss ring with a clay dot orbiting slowly.
- **Parallax Botanicals**: 9 SVG botanical sprigs (eucalyptus, fern, olive, monstera, rosemary, single petal) at varying depths tracking cursor movement.
- **Interactive Burst**: Clicking the central blob triggers a gentle outward spring burst of the botanicals and spins the orbit ring.
- **Masked Headline Reveal**: Safe descender padding preventing clipping on `line-height: 1.1`.
- **Rotating Badge**: SVG text-path circular badge with "SCROLL TO EXPLORE".

### 6. Section A: Philosophy (`/src/js/sections/philosophy.js`)
- Tone `moss`: entering tweens background to moss (`#2E3B2C`), leaving back to hero returns to sage.
- Giant Bricolage headline *"Rooted in restraint."* with masked word reveal and clay accent.
- Scrubbed growing SVG stem with a clay bud tracking the line end via `getPointAtLength`.
- 3 milestone leaf pairs that unfurl with `elastic.out` as the bud passes them.
- 3 alternating principles with outlined numbers, botanical blob badges, and char rise reveals.
- Stats row with odometer counter overlay rendering final values (`0`, `98%`, `12`) by default.

### 7. Section B: The Collection (`/src/js/sections/shop.js`)
- 4 stacked sticky cards (`top = 96px + index * 28px`, `min(78svh, 640px)`).
- Previous cards scale to 0.94 and gain a 14% moss tint overlay as the next card stacks over them.
- Active card tone sync: dynamic tone shifts between sage, clay, bone, and sage behind the deck.
- Left column: tone-matched morphing organic blob, large SVG product illustration, and parallax botanical sprigs on cursor hover.
- Right column: meta badge, Bricolage headline, tagline, 3 key ingredient chips, 3 animated checkmark benefits, interactive skin-type selector (Dry / Combination / Oily), and price.
- Add to Ritual: curved flight arc (`MotionPathPlugin`) from button to the dock basket, dock & hero badge bounce, "Added ✓" toggle for 1.4s, and a 6-leaf clay confetti burst.
- Sticky 4-dot deck progress indicator for rapid navigation.
- Closing strip with returns guarantee and skin quiz pill.

### 8. Section: The Ingredient Explorer (`/src/js/sections/ingredients.js`)
- Tone `bone`: entering calls `setTone('bone')` with smooth background tweening.
- Headline *"Eight plants. That's the list."* with masked reveal and clay accent.
- Concern filters: `HYDRATION`, `CALM`, `GLOW`, `BARRIER` multi-select pills that dim non-matching nodes to 30% and snap the wheel to the nearest match.
- Left column (The Wheel):
  - 8 organic blob nodes on a circular track with counter-rotation so botanical art and labels always stay upright.
  - Interactive pointer-drag with inertia (`power3.out`), pointer capture, and magnetic node snapping.
  - Fixed 12 o'clock moss triangle marker with tick scale pulse.
  - Keyboard accessible (`role="radiogroup"`, Arrow keys, Home/End, Enter/Space, clay focus rings, `aria-live` status).
  - Center hub: morphing sage blob, rotating SVG text badge (*"ONE PLANT AT A TIME"*), and 160px floating featured art with slow bob.
  - 8 floating background botanical sprigs with cursor parallax.
  - Autoplay engine: advances every 5s after 6s idle, paused for 10s on user interaction or hover.
- Right column (The Detail Panel):
  - Paper card with dynamic tone-tinted background shift.
  - Discrete content swap: 0.2s fade-out followed by a 0.7s circular clip-path reveal from node origin.
  - Metric purity ring with stroke draw and odometer percentage readout.
  - Botanical field note and associated product chips that smooth-scroll to their respective card in `#shop`.
  - External event support: dispatches and responds to `"ingredient:focus"` from collection links.

### 9. Section: The Ritual (`/src/js/sections/ritual.js`)
- Tone `sage`: entering calls `setTone('sage')` with smooth background tweening.
- Headline *"A routine you'll actually keep."* with masked word reveal and clay italic accent.
- Morning / Evening segmented sliding toggle:
  - AM routine: cleanse, serum, cream, mist.
  - PM routine: cleanse, serum, cream.
  - Decorative celestial blob in the top-right corner that morphs between rising sun (clay) and moon (bone), with subtle section tone shift (`--ritual-tone-bg`: sage for AM, deep sage for PM).
- Vertical timeline with scrubbed vertical SVG line and clay bud following the tip.
- Interactive step rows: numbered dot, product thumbnail via `drawProduct`, instruction, wait chip, and interactive checkmark button that increments the completed steps counter (`"2 / 4 steps completed"`) and fills the progress bar.
- Listens for `"ritual:ready"`: seamlessly replaces default routine with personalized ritual steps and active ingredients via a 3D flip reveal, displaying a *"Your Personal Formulation"* clay pill with a *"Retake quiz"* link.

### 10. The Fullscreen Quiz Overlay (`/src/js/sections/quiz.js` & `/src/js/lib/ritual.js`)
- Opened by `"quiz:open"` from hero, shop closing strip, ritual section, or dock.
- Fullscreen layer (100svh, z-index 10010) on bone (`#EFE9DD`) with expanding circular clip-path from trigger position (`0.9s, expo.inOut`).
- Scroll lock with Lenis stop/start and scrollbar width compensation to eliminate layout shifts.
- Accessible focus trapping (`aria-modal`, `role="dialog"`), returning focus to the trigger on close.
- Left rail (desktop): growing plant SVG illustration whose stem draws upward by 20% per question with unfurling leaf pairs, culminating in a blooming clay flower. (Horizontal vine on mobile).
- 5 discrete questions with masked headline entrance, 2x2 answer cards with soft hover lifts, cursor blob highlights, and drawn checkmark selections.
- Keyboard support: Arrow keys, numbers 1-4, Enter, Backspace, and Escape.
- Pure matching logic (`/src/js/lib/ritual.js`): weighted scoring calculating skin type, primary concerns, step counts, top 3 ingredients, fragrance preference, and match percentage (72%–98%).
- "Reading your skin" moment (1.6s) with spinning text badge cycling botanical phrases (skippable on click).
- Result screen:
  - Left column: tone-matched morphing blob with bloomed flower art, ritual title, match percentage ring, and rationale.
  - Right card: Morning / Evening routine timeline, top 3 active extract chips (clicking closes overlay and focuses ingredient in `#ingredients`), bundled price summary with 10% discount, and *"Add the full ritual ↗"* button featuring 120ms staggered fly-to-cart animations.

### 11. Floating Dock Nav (`/src/js/sections/dock.js`)
- Fixed bottom-center dock with backdrop blur and hairline border.
- macOS-style cursor magnification: hovered icon scales to 1.35x and neighbors scale to 1.15x via GSAP `quickTo`.
- Smooth scroll to sections `#shop`, `#ingredients`, `#ritual`, `#journal`.
- Active section tracking with clay indicator dot.
- Auto-hides on downward scroll past 200px, smoothly reveals on upward scroll, and remains visible at top/bottom thresholds.

### 12. Cart Drawer (`/src/js/sections/cart.js` & `/src/js/lib/pricing.js`)
- Fixed right-side drawer (width `min(440px, 100vw)`, `100svh`, paper background, radius `40px 0 0 40px`, z-index 10005) with 45% bone backdrop.
- Opens via `"cart:open"` or 600ms automatically after the first add-to-cart of a session (only once per session, never re-opens automatically if closed).
- Opening animation: drawer slides in (`x 100%` to `0`, 0.7s, `expo.out`) while a sage blob grows behind it, line items stagger in (`power3.out`).
- Guaranteed scroll lock via `lenis.stop()` on open and `lenis.start()` on every close path (close button, Escape, backdrop click, checkout completion, window resize, beforeunload).
- Focus trapping (`role="dialog"`, `aria-modal="true"`), returning focus to trigger element on close.
- Free shipping progress bar: updates toward $60 threshold with clay fill animation (`power3.out`), tiny leaf riding its tip, and a 6-leaf confetti burst upon crossing the threshold.
- Line items: product art via `drawProduct`, "No.01 // 30 ML", quantity stepper, line price, remove link. Row entry flashes clay underline; removal collapses row height (0.4s) with a 5-second Undo toast. Bundle items display a clay `"RITUAL BUNDLE"` pill.
- Empty state: drawn botanical sprout, italic Instrument Serif line *"Your ritual is empty."*, *"Take the skin quiz ↗"* button, and collection link.
- "Pairs well with" mini row: dynamically shows missing product with instant Add pill.
- Promo codes: collapsible input with `"VERDANT10"` (10% off subtotal) and `"WELCOME"` (free shipping), inline clay error, and removable active promo chip.
- Pricing engine (`/src/js/lib/pricing.js`): single pure function calculating subtotal, bundle discounts, promo discounts, shipping ($6 or free above $60 / WELCOME), and total with dev assertion verification.
- Checkout button: full-width moss pill playing a 1.4s growing plant animation before swapping to a success bloom screen with order number `"VD-2610-XXXX"`, order summary, demo notice, and *"Keep exploring"* link.
- Dock badge and hero cart count update and bump (`scale: 1.35, elastic.out`) on every cart event.

### 13. Section: The Journal (`/src/js/sections/journal.js`)
- Tone `bone`: entering calls `setTone('bone')`.
- Headline *"Notes from the studio."* with masked reveal and *"studio"* in Instrument Serif italic clay.
- 12-column editorial grid of 4 cards:
  - 7-col large card (`col-large`)
  - 5-col medium card (`col-medium`)
  - Two 6-col half cards (`col-half-1`, `col-half-2`)
- Each card features a flat botanical art blob that morphs border-radius and scales 1.05 on hover, card lifts 8px, arrow rotates 45deg, and clay underline wipes in.
- Staggered card entrance via ScrollTrigger.
- Fullscreen reading overlay: scroll lock with Lenis stop/start, focus trap, and clean 4-paragraph believable studio articles for all 4 stories.

### 14. Section: Testimonials (`/src/js/sections/testimonials.js`)
- Tone `sage`: entering calls `setTone('sage')`.
- Small label *"KIND WORDS"* and headline *"Skin that feels like itself."* with *"itself"* in italic clay.
- Draggable Card Stack: 5 review cards stacked with slight rotations (-4deg, 3deg, -2deg, 5deg) and scaling.
- Pointer drag with physics (`touch-action: pan-y`): dragging beyond 120px flings the card off with inertia and rotation, shifting remaining cards up with a spring (`0.6s, power3.out`).
- Next/Previous buttons and keyboard arrow key navigation.
- 7-second auto-advance timer while visible (pauses on hover, drag, and focus; disabled for `prefers-reduced-motion`).
- 5 drawn clay stars, Instrument Serif italic quotes, author names, skin types, and mini product thumbnails via `drawProduct`.
- Rating breakdown column: large `"4.9"` rating from 2,300+ reviews, 5-row bar breakdown with animated widths on enter, and `"100% WOULD REPURCHASE"` clay badge.

### 15. Section: The Footer (`/src/js/sections/footer.js`)
- Tone `moss`: entering calls `setTone('moss')`.
- Growing Garden Stage: wide ground line featuring 7 botanical sprigs (ferns, eucalyptus, olive, rosemary) that grow and scale from their base with scroll scrub.
- Interactive sprig deflection: sprigs lean away from the cursor within 160px radius (`quickTo`, max 14deg).
- Idle sway: continuous subtle organic movement powered by the shared GSAP ticker (automatically sleeps when footer is offscreen).
- Clay blossoms unfurl on sprigs as scroll finishes.
- Giant Bricolage headline *"Grow slowly with us."* with words reveal, skin quiz pill, and collection link.
- Hairline-separated 4-column grid: Shop, Learn, Help, and Newsletter subscription with email validation, inline clay error, and *"Welcome to the garden."* success state.
- Bottom bar: copyright, B Corp / Vegan / Carbon Neutral badges, and magnetic *"BACK TO TOP ↑"* button with Lenis smooth scroll (`1.6s, expo.inOut`).

---

## 📁 Project Structure

```
VERDANT/
├── index.html                # Main HTML entry with semantic structure
├── package.json              # Vite, GSAP, and Lenis configurations
├── README.md                 # Project documentation
└── src/
    ├── main.js               # Application coordinator & bootstrapper
    ├── data/
    │   ├── products.js       # 4 skincare formulations & reactive cart store
    │   └── ingredients.js    # 8 botanical extracts with purity, origins & roles
    ├── js/
    │   ├── lib/
    │   │   ├── botanicals.js   # 6 SVG sprig builders & 4 product illustrators
    │   │   ├── cursor.js       # Organic morphing dual-layer cursor
    │   │   ├── magnetic.js     # Springy magnetic button controller
    │   │   ├── ritual.js       # Pure deterministic skincare matching logic
    │   │   ├── scroll.js       # Unified Lenis + GSAP scroll engine
    │   │   ├── textSplitter.js # Descender-safe masked word splitter
    │   │   └── tone.js         # Global tone tweening engine
    │   └── sections/
    │       ├── loader.js       # Seedling germination animation & reveal
    │       ├── hero.js         # Hero blob, floating products & parallax
    │       ├── philosophy.js   # Growing stem, leaf unfurl & principles
    │       ├── shop.js         # Stacked sticky cards & fly-to-cart arc
    │       ├── ingredients.js  # Interactive rotating wheel & detail panel
    │       ├── ritual.js       # Routine timeline, AM/PM toggle & ticks
    │       ├── dock.js         # macOS dock with magnification & anchor sync
    │       ├── cart.js         # Studio basket drawer & reactivity
    │       └── quiz.js         # Fullscreen expanding circle quiz overlay
    └── styles/
        ├── variables.css     # Design tokens, color palette, fluid scales
        ├── base.css          # CSS reset, typography, grain texture
        ├── cursor.css        # Custom cursor styles & blend modes
        ├── loader.css        # Seedling loader stage styles
        ├── hero.css          # Hero layout, blob animation & responsive viewports
        ├── philosophy.css    # Philosophy stem, principles & stats
        ├── shop.css          # Stacked sticky cards & collection deck
        ├── ingredients.css   # Rotating wheel & botanical detail card
        ├── ritual.css        # Routine timeline & fullscreen quiz overlay
        ├── dock.css          # Floating dock nav styling
        ├── cart.css          # Studio basket drawer
        ├── quiz.css          # Auxiliary modal styles
        └── sections.css      # Placeholder anchor sections
```

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Deploy to Netlify
1. Connect repository in the Netlify Dashboard or use Netlify CLI (`netlify deploy`).
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Optional `netlify.toml`:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   ```

---

## 💼 Upwork & Contra Portfolio Summary

> **VERDANT — Slow Botanical Skincare Studio**
>
> Designed and engineered an Awwwards-caliber digital experience for VERDANT, an artisanal botanical skincare studio rooted in intentional restraint. Built completely with Vanilla JavaScript, Vite, GSAP, and Lenis smooth scroll, the project challenges conventional e-commerce templates with tactile, slow-living digital craftsmanship. Key architectural highlights include:
> - **Choreographed Seedling Germination Loader**: An organic seed-drop, stem-draw, and leaf-unfurl animation that expands into the hero canvas, supported by a 6-second failsafe recovery timer.
> - **Growing-Stem Interactive Scroll**: A vertical SVG timeline whose organic stem and bud scrub synchronously with user scroll, unfurling leaf pairs at formulation milestones.
> - **Draggable 8-Extract Ingredient Wheel**: A pointer-driven interactive circular carousel with real-time counter-rotation, magnetic snapping, and discrete circular clip-path detail reveals.
> - **Deterministic Botanical Skin Diagnostic Quiz**: A 5-step interactive questionnaire featuring a vertical growing plant tracker and pure weighted scoring engine delivering custom AM/PM rituals and bundled formulations.
> - **Tactile Cart Drawer with Live Pricing Engine**: A slide-over paper basket with automated session triggers, free-shipping threshold bar with leaf confetti, undo toasts, promo code validation, and a simulated botanical checkout sequence.
>
> **Tech Stack**: Vanilla JavaScript (ES6+), GSAP (ScrollTrigger, MotionPathPlugin), Lenis Smooth Scroll, Custom CSS Design Tokens, Semantic HTML5, Schema.org JSON-LD. Fully responsive across desktop, tablet, mobile (70vw adaptive blob), and landscape phone orientations with zero layout shift (CLS < 0.05).

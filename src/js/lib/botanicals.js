// /src/js/lib/botanicals.js
// Reusable inline-SVG builders for 6 botanical sprigs & 4 skincare products
// Strict palette: bone #EFE9DD, paper #F7F3EA, sage #A9B79E, deep sage #6F8268, clay #C98F72, moss #2E3B2C
// Flat shapes with soft translucent highlights (no gradients).

export const PALETTE = {
  bone: '#EFE9DD',
  paper: '#F7F3EA',
  sage: '#A9B79E',
  deepSage: '#6F8268',
  clay: '#C98F72',
  moss: '#2E3B2C'
};

/**
 * 6 Reusable leaf & sprig illustrations:
 * eucalyptus, fern, olive twig, monstera piece, rosemary sprig, single petal
 */
export const botanicals = {
  eucalyptus({ width = 120, height = 180, primary = PALETTE.deepSage, secondary = PALETTE.sage, vein = PALETTE.moss, className = '' } = {}) {
    return `
      <svg class="botanical-svg ${className}" width="${width}" height="${height}" viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Main Stem -->
        <path d="M60 175 C58 120 62 60 55 5" stroke="${vein}" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Eucalyptus Leaves (round-oval pairs) -->
        <!-- Leaf Pair 1 (Bottom) -->
        <ellipse cx="40" cy="145" rx="24" ry="16" transform="rotate(-25 40 145)" fill="${primary}"/>
        <path d="M40 145 Q50 140 58 147" stroke="${vein}" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="80" cy="138" rx="25" ry="17" transform="rotate(20 80 138)" fill="${secondary}"/>
        <path d="M60 140 Q70 138 80 138" stroke="${vein}" stroke-width="1.2" stroke-linecap="round"/>
        <!-- Translucent highlight shape -->
        <path d="M30 140 C34 135 48 135 52 142 C45 145 35 145 30 140 Z" fill="${PALETTE.paper}" opacity="0.32"/>

        <!-- Leaf Pair 2 (Middle) -->
        <ellipse cx="38" cy="95" rx="22" ry="15" transform="rotate(-30 38 95)" fill="${secondary}"/>
        <path d="M38 95 Q48 93 58 97" stroke="${vein}" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="82" cy="88" rx="23" ry="15" transform="rotate(25 82 88)" fill="${primary}"/>
        <path d="M60 92 Q72 90 82 88" stroke="${vein}" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M72 82 C78 78 88 80 92 86 C85 89 77 88 72 82 Z" fill="${PALETTE.paper}" opacity="0.32"/>

        <!-- Leaf Pair 3 (Top) -->
        <ellipse cx="43" cy="50" rx="18" ry="12" transform="rotate(-20 43 50)" fill="${primary}"/>
        <ellipse cx="76" cy="45" rx="19" ry="13" transform="rotate(22 76 45)" fill="${secondary}"/>
        <!-- Terminal Leaf -->
        <ellipse cx="55" cy="16" rx="14" ry="10" transform="rotate(-10 55 16)" fill="${primary}"/>
      </svg>
    `.trim();
  },

  fern({ width = 110, height = 200, primary = PALETTE.deepSage, secondary = PALETTE.sage, vein = PALETTE.moss, className = '' } = {}) {
    return `
      <svg class="botanical-svg ${className}" width="${width}" height="${height}" viewBox="0 0 110 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Arching Rachis -->
        <path d="M30 195 C45 130 65 65 85 10" stroke="${vein}" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Fern Pinnae -->
        <path d="M36 170 C20 168 10 160 5 152 C15 150 25 158 38 165" fill="${primary}"/>
        <path d="M42 162 C60 156 75 152 84 148 C76 142 60 148 45 157" fill="${secondary}"/>

        <path d="M44 135 C24 130 14 122 10 114 C20 112 32 120 46 129" fill="${secondary}"/>
        <path d="M50 126 C70 120 86 116 94 110 C86 105 70 112 52 121" fill="${primary}"/>

        <path d="M52 100 C34 94 25 86 20 78 C30 77 42 84 54 94" fill="${primary}"/>
        <path d="M58 92 C76 86 90 80 96 72 C89 69 74 76 60 86" fill="${secondary}"/>

        <path d="M60 65 C45 58 38 52 35 44 C44 44 53 50 63 60" fill="${secondary}"/>
        <path d="M66 58 C80 50 90 42 92 34 C85 34 74 41 68 52" fill="${primary}"/>

        <!-- Tip Frond -->
        <path d="M72 32 C65 24 62 16 62 10 C70 10 78 16 82 24" fill="${secondary}"/>
        <path d="M78 24 C82 18 85 12 85 8 C88 12 87 20 84 26" fill="${primary}"/>
      </svg>
    `.trim();
  },

  oliveTwig({ width = 130, height = 170, primary = PALETTE.deepSage, secondary = PALETTE.sage, fruit = PALETTE.moss, className = '' } = {}) {
    return `
      <svg class="botanical-svg ${className}" width="${width}" height="${height}" viewBox="0 0 130 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Stem -->
        <path d="M20 165 C45 125 70 80 110 20" stroke="${PALETTE.moss}" stroke-width="2" stroke-linecap="round"/>
        <!-- Leaves -->
        <path d="M35 140 C18 135 10 120 12 110 C24 115 35 128 38 136 Z" fill="${secondary}"/>
        <path d="M45 125 C62 112 78 114 85 118 C78 128 62 130 48 128 Z" fill="${primary}"/>
        <!-- Olive 1 -->
        <ellipse cx="44" cy="140" rx="9" ry="12" transform="rotate(-15 44 140)" fill="${fruit}"/>
        <ellipse cx="42" cy="138" rx="3" ry="5" transform="rotate(-15 42 138)" fill="${PALETTE.paper}" opacity="0.3"/>

        <!-- Middle leaves -->
        <path d="M62 95 C45 88 38 72 40 64 C52 70 62 82 66 92 Z" fill="${primary}"/>
        <path d="M72 82 C90 70 106 72 114 78 C106 88 90 89 75 85 Z" fill="${secondary}"/>
        <!-- Olive 2 -->
        <ellipse cx="78" cy="94" rx="8" ry="11" transform="rotate(20 78 94)" fill="${fruit}"/>
        <ellipse cx="76" cy="92" rx="2.5" ry="4.5" transform="rotate(20 76 92)" fill="${PALETTE.paper}" opacity="0.3"/>

        <!-- Terminal leaves -->
        <path d="M92 50 C80 40 76 26 80 18 C90 24 96 36 96 46 Z" fill="${secondary}"/>
        <path d="M102 38 C115 25 125 24 128 26 C125 35 116 42 104 42 Z" fill="${primary}"/>
      </svg>
    `.trim();
  },

  monsteraPiece({ width = 140, height = 160, primary = PALETTE.deepSage, vein = PALETTE.moss, className = '' } = {}) {
    return `
      <svg class="botanical-svg ${className}" width="${width}" height="${height}" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Stem -->
        <path d="M70 155 C70 120 70 80 70 15" stroke="${vein}" stroke-width="3" stroke-linecap="round"/>
        <!-- Large lobed monstera profile -->
        <path d="M70 20 
                 C85 24 105 32 118 48 
                 C110 54 98 56 94 62 
                 C115 65 128 78 128 92 
                 C115 95 102 96 98 104 
                 C112 110 118 124 112 135 
                 C95 142 80 145 70 145 
                 C60 145 45 142 28 135 
                 C22 124 28 110 42 104 
                 C38 96 25 95 12 92 
                 C12 78 25 65 46 62 
                 C42 56 30 54 22 48 
                 C35 32 55 24 70 20 Z" 
              fill="${primary}"/>
        <!-- Cutout slits (fenestrations) inside leaf -->
        <ellipse cx="52" cy="78" rx="4" ry="12" transform="rotate(-30 52 78)" fill="${PALETTE.bone}"/>
        <ellipse cx="88" cy="78" rx="4" ry="12" transform="rotate(30 88 78)" fill="${PALETTE.bone}"/>
        <!-- Veins -->
        <path d="M70 60 Q85 55 105 50" stroke="${vein}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M70 60 Q55 55 35 50" stroke="${vein}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M70 95 Q90 92 112 92" stroke="${vein}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M70 95 Q50 92 28 92" stroke="${vein}" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Highlight -->
        <path d="M72 35 C78 45 78 85 74 120 C71 85 70 45 72 35 Z" fill="${PALETTE.paper}" opacity="0.25"/>
      </svg>
    `.trim();
  },

  rosemarySprig({ width = 70, height = 190, primary = PALETTE.deepSage, secondary = PALETTE.sage, vein = PALETTE.moss, className = '' } = {}) {
    return `
      <svg class="botanical-svg ${className}" width="${width}" height="${height}" viewBox="0 0 70 190" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 185 C36 120 34 60 35 10" stroke="${vein}" stroke-width="2" stroke-linecap="round"/>
        <!-- Linear rosemary needle clusters -->
        <!-- Tier 1 -->
        <path d="M35 165 C22 160 12 150 10 142 C16 142 28 152 35 162" fill="${primary}"/>
        <path d="M35 163 C48 158 58 148 60 140 C54 140 42 150 35 160" fill="${secondary}"/>

        <!-- Tier 2 -->
        <path d="M35 135 C18 128 8 116 6 108 C14 108 26 120 35 132" fill="${secondary}"/>
        <path d="M35 133 C52 126 62 114 64 106 C56 106 44 118 35 130" fill="${primary}"/>

        <!-- Tier 3 -->
        <path d="M35 105 C20 96 12 84 10 76 C18 76 28 88 35 102" fill="${primary}"/>
        <path d="M35 103 C50 94 58 82 60 74 C52 74 42 86 35 100" fill="${secondary}"/>

        <!-- Tier 4 -->
        <path d="M35 75 C22 66 16 54 15 46 C22 46 30 58 35 72" fill="${secondary}"/>
        <path d="M35 73 C48 64 54 52 55 44 C48 44 40 56 35 70" fill="${primary}"/>

        <!-- Top Cluster -->
        <path d="M35 45 C28 35 24 24 24 16 C30 18 34 28 35 42" fill="${primary}"/>
        <path d="M35 43 C42 33 46 22 46 14 C40 16 36 26 35 40" fill="${secondary}"/>
        <path d="M35 25 C33 15 34 8 35 4 C36 8 37 15 35 25" fill="${primary}"/>
      </svg>
    `.trim();
  },

  singlePetal({ width = 60, height = 75, fill = PALETTE.clay, accent = PALETTE.paper, className = '' } = {}) {
    return `
      <svg class="botanical-svg ${className}" width="${width}" height="${height}" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Soft organic petal shape -->
        <path d="M30 5 C45 5 55 25 55 45 C55 62 42 72 30 72 C18 72 5 62 5 45 C5 25 15 5 30 5 Z" fill="${fill}"/>
        <!-- Subtle center vein -->
        <path d="M30 68 C30 50 30 25 30 12" stroke="${PALETTE.moss}" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
        <!-- Soft translucent highlight -->
        <path d="M22 18 C30 14 38 18 42 28 C36 34 26 32 22 18 Z" fill="${accent}" opacity="0.35"/>
      </svg>
    `.trim();
  }
};

/**
 * drawProduct(id) returns an inline SVG of each product with:
 * - Flat fills & rounded forms
 * - Soft translucent highlights (flat translucent shapes)
 * - Paper label reading "verdant", the product name and size
 */
export function drawProduct(id, { width = 280, height = 360, className = '' } = {}) {
  switch (id) {
    case 'dew-serum':
      // Dropper bottle for the serum
      return `
        <svg class="product-svg dew-serum-svg ${className}" width="${width}" height="${height}" viewBox="0 0 240 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Dropper Rubber Bulb (Clay/Moss) -->
          <path d="M102 24 C102 12 138 12 138 24 L138 48 C138 52 102 52 102 48 Z" fill="${PALETTE.clay}"/>
          <path d="M105 20 C108 15 132 15 135 20" stroke="${PALETTE.paper}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

          <!-- Dropper Collar / Ring (Deep Sage) -->
          <rect x="94" y="48" width="52" height="18" rx="6" fill="${PALETTE.deepSage}"/>
          <rect x="98" y="52" width="44" height="4" rx="2" fill="${PALETTE.paper}" opacity="0.2"/>

          <!-- Dropper Neck (Glass) -->
          <rect x="100" y="66" width="40" height="14" rx="3" fill="${PALETTE.sage}"/>

          <!-- Main Glass Bottle Body (Rounded Sage Glass) -->
          <rect x="55" y="80" width="130" height="235" rx="38" fill="${PALETTE.sage}"/>

          <!-- Inner liquid level silhouette -->
          <path d="M60 120 C60 100 180 100 180 120 L180 280 C180 305 160 310 120 310 C80 310 60 305 60 280 Z" fill="${PALETTE.deepSage}" opacity="0.85"/>

          <!-- Dropper Pipette Glass Tube inside bottle -->
          <rect x="116" y="80" width="8" height="190" rx="4" fill="${PALETTE.paper}" opacity="0.35"/>
          <path d="M117 270 L120 285 L123 270 Z" fill="${PALETTE.paper}" opacity="0.4"/>

          <!-- Paper Label with clean rounded corners -->
          <rect x="70" y="145" width="100" height="125" rx="14" fill="${PALETTE.paper}"/>
          <rect x="74" y="149" width="92" height="117" rx="10" stroke="${PALETTE.bone}" stroke-width="1"/>

          <!-- Label Typography -->
          <!-- Verdant Wordmark -->
          <text x="120" y="172" text-anchor="middle" font-family="'Instrument Serif', serif" font-style="italic" font-size="16" fill="${PALETTE.moss}" letter-spacing="1">verdant</text>
          <line x1="88" y1="180" x2="152" y2="180" stroke="${PALETTE.clay}" stroke-width="1" opacity="0.8"/>
          <!-- Product Name -->
          <text x="120" y="202" text-anchor="middle" font-family="'Bricolage Grotesque', sans-serif" font-weight="500" font-size="13" fill="${PALETTE.moss}">DEW SERUM</text>
          <text x="120" y="218" text-anchor="middle" font-family="'Figtree', sans-serif" font-weight="400" font-size="9" fill="${PALETTE.deepSage}" letter-spacing="0.5">Hydration No.01</text>
          <!-- Size & Accent -->
          <circle cx="120" cy="235" r="3" fill="${PALETTE.clay}"/>
          <text x="120" y="254" text-anchor="middle" font-family="'Figtree', sans-serif" font-weight="500" font-size="9" fill="${PALETTE.moss}">30 ML</text>

          <!-- Flat translucent highlights (giving soft botanical studio glass tactility) -->
          <path d="M64 96 C64 88 74 84 88 84 L88 296 C74 296 64 286 64 275 Z" fill="${PALETTE.paper}" opacity="0.28"/>
          <rect x="168" y="96" width="6" height="185" rx="3" fill="${PALETTE.paper}" opacity="0.18"/>

          <!-- Bottom curved base shadow -->
          <ellipse cx="120" cy="316" rx="55" ry="6" fill="${PALETTE.moss}" opacity="0.16"/>
        </svg>
      `.trim();

    case 'moss-cream':
      // Low round jar with screw cap
      return `
        <svg class="product-svg moss-cream-svg ${className}" width="${width}" height="${height}" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Jar Lid (Deep Sage / Moss wood finish) -->
          <rect x="45" y="55" width="170" height="42" rx="16" fill="${PALETTE.moss}"/>
          <rect x="49" y="59" width="162" height="6" rx="3" fill="${PALETTE.paper}" opacity="0.2"/>
          <line x1="55" y1="82" x2="205" y2="82" stroke="${PALETTE.deepSage}" stroke-width="1.5" stroke-dasharray="4 4"/>

          <!-- Jar Neck / Thread -->
          <rect x="58" y="95" width="144" height="10" rx="3" fill="${PALETTE.clay}" opacity="0.6"/>

          <!-- Jar Glass Body (Heavy base low jar) -->
          <rect x="35" y="102" width="190" height="120" rx="28" fill="${PALETTE.deepSage}"/>
          <!-- Inner Cream Volume -->
          <rect x="46" y="112" width="168" height="98" rx="20" fill="${PALETTE.moss}"/>

          <!-- Front Paper Label -->
          <rect x="65" y="122" width="130" height="76" rx="12" fill="${PALETTE.paper}"/>
          <text x="130" y="144" text-anchor="middle" font-family="'Instrument Serif', serif" font-style="italic" font-size="15" fill="${PALETTE.moss}" letter-spacing="1">verdant</text>
          <text x="130" y="164" text-anchor="middle" font-family="'Bricolage Grotesque', sans-serif" font-weight="500" font-size="12" fill="${PALETTE.moss}">MOSS CREAM</text>
          <text x="130" y="179" text-anchor="middle" font-family="'Figtree', sans-serif" font-size="8.5" fill="${PALETTE.deepSage}">Barrier Recovery • 50 ML</text>
          <circle cx="130" cy="189" r="2" fill="${PALETTE.clay}"/>

          <!-- Soft highlight shapes -->
          <path d="M42 116 C42 108 52 105 64 105 L64 210 C52 210 42 202 42 195 Z" fill="${PALETTE.paper}" opacity="0.24"/>
          <rect x="210" y="116" width="6" height="90" rx="3" fill="${PALETTE.paper}" opacity="0.14"/>

          <!-- Base Shadow -->
          <ellipse cx="130" cy="226" rx="75" ry="7" fill="${PALETTE.moss}" opacity="0.16"/>
        </svg>
      `.trim();

    case 'clay-cleanser':
      // Elegant soft squeeze tube
      return `
        <svg class="product-svg clay-cleanser-svg ${className}" width="${width}" height="${height}" viewBox="0 0 220 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Top Crimp (Sealed edge) -->
          <rect x="52" y="30" width="116" height="12" rx="4" fill="${PALETTE.clay}"/>
          <line x1="56" y1="36" x2="164" y2="36" stroke="${PALETTE.bone}" stroke-width="1.2" stroke-dasharray="3 3"/>

          <!-- Squeeze Tube Body (Organic tapered shape) -->
          <path d="M54 42 
                   C54 90 62 200 68 250 
                   C70 260 84 266 110 266 
                   C136 266 150 260 152 250 
                   C158 200 166 90 166 42 Z" 
                fill="${PALETTE.bone}"/>

          <!-- Paper Label area -->
          <rect x="74" y="90" width="72" height="110" rx="10" fill="${PALETTE.paper}"/>
          <text x="110" y="118" text-anchor="middle" font-family="'Instrument Serif', serif" font-style="italic" font-size="15" fill="${PALETTE.moss}">verdant</text>
          <line x1="88" y1="126" x2="132" y2="126" stroke="${PALETTE.clay}" stroke-width="1"/>
          <text x="110" y="146" text-anchor="middle" font-family="'Bricolage Grotesque', sans-serif" font-weight="500" font-size="11" fill="${PALETTE.moss}">CLAY CLEANSER</text>
          <text x="110" y="162" text-anchor="middle" font-family="'Figtree', sans-serif" font-size="8" fill="${PALETTE.deepSage}">Purifying Emulsion</text>
          <text x="110" y="184" text-anchor="middle" font-family="'Figtree', sans-serif" font-weight="500" font-size="8.5" fill="${PALETTE.clay}">120 ML</text>

          <!-- Flip Cap Base (Moss) -->
          <rect x="86" y="266" width="48" height="28" rx="8" fill="${PALETTE.moss}"/>
          <rect x="92" y="290" width="36" height="6" rx="3" fill="${PALETTE.deepSage}"/>

          <!-- Tube Highlight -->
          <path d="M64 50 C66 100 74 210 78 245 C73 240 68 150 64 50 Z" fill="${PALETTE.paper}" opacity="0.38"/>

          <!-- Base shadow -->
          <ellipse cx="110" cy="302" rx="32" ry="5" fill="${PALETTE.moss}" opacity="0.16"/>
        </svg>
      `.trim();

    case 'petal-mist':
      // Mist spray bottle with fine atomizer
      return `
        <svg class="product-svg petal-mist-svg ${className}" width="${width}" height="${height}" viewBox="0 0 240 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Clear Overcap (translucent) -->
          <rect x="96" y="22" width="48" height="42" rx="10" fill="${PALETTE.paper}" opacity="0.5"/>
          <rect x="100" y="26" width="8" height="34" rx="4" fill="${PALETTE.paper}" opacity="0.5"/>

          <!-- Atomizer Spray Head -->
          <rect x="100" y="32" width="40" height="28" rx="6" fill="${PALETTE.moss}"/>
          <!-- Spray nozzle hole -->
          <circle cx="106" cy="46" r="2.5" fill="${PALETTE.clay}"/>

          <!-- Pump Collar (Metal/Deep Sage) -->
          <rect x="92" y="64" width="56" height="16" rx="5" fill="${PALETTE.deepSage}"/>
          <rect x="96" y="67" width="48" height="3" rx="1.5" fill="${PALETTE.paper}" opacity="0.25"/>

          <!-- Bottle Shoulder & Main Glass Body -->
          <path d="M96 80 L144 80 C162 80 175 92 175 110 L175 275 C175 296 160 308 120 308 C80 308 65 296 65 275 L65 110 C65 92 78 80 96 80 Z" fill="${PALETTE.sage}"/>

          <!-- Mist Internal Dip Tube -->
          <line x1="120" y1="78" x2="120" y2="295" stroke="${PALETTE.paper}" stroke-width="2.5" stroke-linecap="round" opacity="0.45"/>

          <!-- Paper Label -->
          <rect x="75" y="140" width="90" height="120" rx="14" fill="${PALETTE.paper}"/>
          <text x="120" y="166" text-anchor="middle" font-family="'Instrument Serif', serif" font-style="italic" font-size="15" fill="${PALETTE.moss}">verdant</text>
          <line x1="94" y1="174" x2="146" y2="174" stroke="${PALETTE.clay}" stroke-width="1"/>
          <text x="120" y="196" text-anchor="middle" font-family="'Bricolage Grotesque', sans-serif" font-weight="500" font-size="12" fill="${PALETTE.moss}">PETAL MIST</text>
          <text x="120" y="212" text-anchor="middle" font-family="'Figtree', sans-serif" font-size="8.5" fill="${PALETTE.deepSage}">Botanical Essence</text>
          <circle cx="120" cy="226" r="2.5" fill="${PALETTE.clay}"/>
          <text x="120" y="244" text-anchor="middle" font-family="'Figtree', sans-serif" font-weight="500" font-size="9" fill="${PALETTE.moss}">100 ML</text>

          <!-- Flat translucent side highlight -->
          <path d="M72 108 C72 96 82 90 92 88 L92 296 C82 294 72 284 72 272 Z" fill="${PALETTE.paper}" opacity="0.3"/>
          <rect x="162" y="108" width="5" height="170" rx="2.5" fill="${PALETTE.paper}" opacity="0.18"/>

          <!-- Base Shadow -->
          <ellipse cx="120" cy="314" rx="50" ry="6" fill="${PALETTE.moss}" opacity="0.16"/>
        </svg>
      `.trim();

    default:
      return '';
  }
}

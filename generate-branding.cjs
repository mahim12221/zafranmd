const fs = require('fs');

/**
 * ULTRA-PREMIUM, MINIMALIST & TIMELESS BRAND IDENTITY FOR KERIYO
 * 
 * Philosophy:
 * - A pure, iconic mark based on clean intersecting geometric lines.
 * - Monogram 'K':
 *   - Solid high-tech vertical stem (pure white or charcoal depending on background).
 *   - Two angled diagonal precision wings forming a sharp, stylish, aerodynamic 'K'.
 *   - High-energy electric orange accent on the dynamic intersection.
 * - No awkward chunky shapes, no weird polygon mess.
 * - Extremely balanced, modern, tech-luxury aesthetic.
 */

// 1. Icon / Favicon Mark (120x120)
const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="emblemBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="kOrange" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Dark luxury rounded squircle base -->
  <rect x="5" y="5" width="110" height="110" rx="26" fill="url(#emblemBg)" stroke="#27272a" stroke-width="2" />

  <!-- Clean, Iconic Geometric K -->
  <g transform="translate(32, 25)">
    <!-- Vertical Bar: Clean, sleek rounded pill -->
    <rect x="0" y="0" width="11" height="70" rx="5.5" fill="#ffffff" />
    
    <!-- Top Diagonal Wing: Precision angled blade -->
    <path d="M22 35 L48 10 C50 8 54 9.5 54 12.5 L54 18 C54 20 53 22 51.5 23.5 L31 43 Z" fill="url(#kOrange)" />

    <!-- Bottom Diagonal Wing: Crisp parallel return -->
    <path d="M22 35 L51.5 64.5 C53 66 54 68 54 70 L54 75.5 C54 78.5 50 80 48 78 L22 52 Z" fill="#ffffff" />

    <!-- Kinetic tech dot -->
    <circle cx="27" cy="43.5" r="4.5" fill="url(#kOrange)" stroke="#09090b" stroke-width="2" />
  </g>
</svg>`;

// 2. Main Storefront & Navigation Logo (320x64)
const horizontalLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" fill="none">
  <defs>
    <linearGradient id="hLogoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="hOrangeGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Left Iconic Mark (48x48) -->
  <g transform="translate(6, 8)">
    <rect x="0" y="0" width="48" height="48" rx="13" fill="url(#hLogoBg)" stroke="#27272a" stroke-width="1.5" />
    
    <g transform="translate(13, 10)">
      <!-- Vertical Stem -->
      <rect x="0" y="0" width="4.8" height="28" rx="2.4" fill="#ffffff" />
      
      <!-- Top Wing -->
      <path d="M9 14 L20.5 3.5 C21.5 2.5 23.5 3.2 23.5 4.6 L23.5 7.2 C23.5 8.1 23 9 22.3 9.7 L13 18 Z" fill="url(#hOrangeGrad)" />

      <!-- Bottom Wing -->
      <path d="M9 14 L22.3 26.3 C23 27 23.5 27.9 23.5 28.8 L23.5 31.4 C23.5 32.8 21.5 33.5 20.5 32.5 L9 21 Z" fill="#ffffff" />

      <!-- Dot Accent -->
      <circle cx="11.5" cy="17.5" r="2" fill="url(#hOrangeGrad)" stroke="#09090b" stroke-width="1" />
    </g>
  </g>

  <!-- Wordmark Section -->
  <g transform="translate(68, 12)">
    <!-- Bold, Clean Brand Name -->
    <text x="0" y="27" font-family="'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="28" font-weight="900" letter-spacing="3.8" fill="#09090b">KERIYO</text>
    
    <!-- Radiant Orange Pulse Dot -->
    <circle cx="136" cy="22" r="3.5" fill="#ff7828" />

    <!-- Subtitle -->
    <text x="1" y="41" font-family="'Plus Jakarta Sans', 'Outfit', -apple-system, sans-serif" font-size="8.5" font-weight="700" letter-spacing="3" fill="#71717a">SMART GADGETS &amp; GEAR</text>
  </g>
</svg>`;

// 3. Admin Logo SVG (260x52)
const adminLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 52" fill="none">
  <defs>
    <linearGradient id="adminBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="adminOrangeGrad" x1="0" y1="0" x2="25" y2="25" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Left Icon Mark (40x40) -->
  <g transform="translate(4, 6)">
    <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#adminBg)" stroke="#27272a" stroke-width="1.2" />
    
    <g transform="translate(11, 8)">
      <rect x="0" y="0" width="4" height="24" rx="2" fill="#ffffff" />
      <path d="M7.5 12 L17 2.8 C18 1.8 19.5 2.5 19.5 3.8 L19.5 6 C19.5 6.8 19 7.6 18.5 8.1 L11 15 Z" fill="url(#adminOrangeGrad)" />
      <path d="M7.5 12 L18.5 21.9 C19 22.4 19.5 23.2 19.5 24 L19.5 26.2 C19.5 27.5 18 28.2 17 27.2 L7.5 18 Z" fill="#ffffff" />
      <circle cx="9.5" cy="15" r="1.6" fill="url(#adminOrangeGrad)" stroke="#09090b" stroke-width="0.8" />
    </g>
  </g>

  <!-- Typography -->
  <g transform="translate(56, 10)">
    <text x="0" y="24" font-family="'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif" font-size="24" font-weight="900" letter-spacing="3.2" fill="#09090b">KERIYO</text>
    <circle cx="118" cy="20" r="3" fill="#ff7828" />
    <text x="1" y="36" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" font-weight="800" letter-spacing="2.5" fill="#71717a">ADMINISTRATION</text>
  </g>
</svg>`;

// Write generated files
fs.writeFileSync('frontend/src/assets/logo.svg', horizontalLogoSvg);
fs.writeFileSync('frontend/public/logo.svg', horizontalLogoSvg);
fs.writeFileSync('frontend/public/favicon.svg', emblemSvg);
fs.writeFileSync('frontend/public/keriyo-logo.svg', horizontalLogoSvg);
fs.writeFileSync('frontend/public/keriyo-emblem.svg', emblemSvg);
fs.writeFileSync('frontend/public/kaviro-logo.svg', horizontalLogoSvg);
fs.writeFileSync('frontend/public/kaviro-emblem.svg', emblemSvg);
fs.writeFileSync('admin/src/assets/logo.svg', adminLogoSvg);

console.log('Successfully updated Keriyo K monogram and branding files.');

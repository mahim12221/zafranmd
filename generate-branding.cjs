const fs = require('fs');

// 1. Sleek Standalone Brand Icon / Favicon / Sticker Center
const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="shieldBg" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#181920" />
      <stop offset="50%" stop-color="#0e0f14" />
      <stop offset="100%" stop-color="#070709" />
    </linearGradient>
    <linearGradient id="kOrange" x1="30" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="50%" stop-color="#f95700" />
      <stop offset="100%" stop-color="#d93800" />
    </linearGradient>
    <linearGradient id="kGold" x1="40" y1="20" x2="90" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffb74d" />
      <stop offset="100%" stop-color="#ff7828" />
    </linearGradient>
    <linearGradient id="kSilver" x1="20" y1="20" x2="50" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <linearGradient id="rimGlow" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" stop-opacity="0.6" />
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#ff5500" stop-opacity="0.4" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Premium Squircle Container -->
  <rect x="6" y="6" width="108" height="108" rx="30" fill="url(#shieldBg)" />
  <rect x="6" y="6" width="108" height="108" rx="30" stroke="url(#rimGlow)" stroke-width="2.5" />

  <!-- Subtle Tech Grid Accent -->
  <circle cx="60" cy="60" r="44" stroke="#ffffff" stroke-opacity="0.05" stroke-dasharray="3 5" />
  
  <!-- The Iconic Geometric "K" Monogram -->
  <!-- Left Pillar (Clean Tech Stem) -->
  <rect x="32" y="30" width="12" height="60" rx="6" fill="url(#kSilver)" />
  <rect x="35" y="34" width="4" height="16" rx="2" fill="#ffffff" opacity="0.6" />

  <!-- Upper Diagonal Wing (Dynamic Arrow / Blade) -->
  <path d="M48 57 L72 32 C74.5 29.5 78.5 29.5 81 32 L83 34 C85.5 36.5 85.5 40.5 83 43 L62 64 Z" fill="url(#kGold)" filter="url(#softGlow)" />
  <path d="M52 57 L74 35 C75.5 33.5 78 33.5 79.5 35 L80 35.5 C81.5 37 81.5 39.5 80 41 L63 60 Z" fill="#fff" opacity="0.25" />

  <!-- Lower Diagonal Wing (Power Stabilizer) -->
  <path d="M50 63 L74 87 C76.5 89.5 80.5 89.5 83 87 L85 85 C87.5 82.5 87.5 78.5 85 76 L65 56 Z" fill="url(#kOrange)" />

  <!-- Tech Diamond Node at Center Core -->
  <polygon points="56,60 62,54 68,60 62,66" fill="#ffffff" filter="url(#softGlow)" />
  <circle cx="62" cy="60" r="1.5" fill="#ff7828" />
</svg>`;

// 2. Full Horizontal Brand Logo (For Header / Navigation)
const horizontalLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 68" fill="none">
  <defs>
    <linearGradient id="hKOrange" x1="10" y1="10" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="hKGold" x1="20" y1="10" x2="55" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffb74d" />
      <stop offset="100%" stop-color="#ff7828" />
    </linearGradient>
    <linearGradient id="hKSilver" x1="10" y1="10" x2="35" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="hShieldBg" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1c1d24" />
      <stop offset="100%" stop-color="#090a0f" />
    </linearGradient>
    <linearGradient id="hGlow" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#ff7828" stop-opacity="0.1" />
    </linearGradient>
  </defs>

  <!-- Left Emblem Mark (Scaled for perfect lockup) -->
  <g transform="translate(6, 6)">
    <!-- Squircle Background -->
    <rect x="0" y="0" width="56" height="56" rx="16" fill="url(#hShieldBg)" />
    <rect x="0" y="0" width="56" height="56" rx="16" stroke="url(#hGlow)" stroke-width="1.8" />
    
    <!-- K Stem -->
    <rect x="13" y="13" width="6.5" height="30" rx="3.25" fill="#f4f4f5" />
    <rect x="14.5" y="15" width="2" height="9" rx="1" fill="#ffffff" opacity="0.8" />

    <!-- K Upper Blade -->
    <path d="M22 28.5 L34.5 15.5 C36 14 38.5 14 40 15.5 L40.8 16.3 C42.3 17.8 42.3 20.3 40.8 21.8 L30 32.5 Z" fill="url(#hKGold)" />

    <!-- K Lower Blade -->
    <path d="M23 31.5 L35 43.5 C36.5 45 39 45 40.5 43.5 L41.2 42.8 C42.7 41.3 42.7 38.8 41.2 37.3 L31 27.5 Z" fill="url(#hKOrange)" />

    <!-- Core Tech Diamond -->
    <polygon points="26,30 29.5,26.5 33,30 29.5,33.5" fill="#ffffff" />
    <circle cx="29.5" cy="30" r="1" fill="#ff7828" />
  </g>

  <!-- Brand Wordmark Typography: Custom high-precision vector letters -->
  <g transform="translate(76, 12)">
    <!-- KAVIRO Text in modern geometric styling -->
    <text x="0" y="31" font-family="'Outfit', system-ui, -apple-system, sans-serif" font-size="31" font-weight="900" letter-spacing="4.5" fill="#09090b">KAVIRO</text>
    
    <!-- Radiant Accent Dot on letter O or end -->
    <circle cx="204" cy="27.5" r="4.5" fill="#ff7828" />
    <circle cx="204" cy="27.5" r="2" fill="#ffffff" />

    <!-- Subtitle / Category Descriptor -->
    <text x="1.5" y="45" font-family="'Outfit', system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" letter-spacing="3.2" fill="#71717a">SMART GADGETS &amp; GEAR</text>
  </g>
</svg>`;

// 3. Circular Sticker Badge / Packaging Seal (Perfect for round stickers, box seals, packaging tape)
const stickerBadgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <defs>
    <radialGradient id="stickerDark" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1c1d25" />
      <stop offset="70%" stop-color="#0c0d12" />
      <stop offset="100%" stop-color="#050507" />
    </radialGradient>
    <linearGradient id="goldRing" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff9800" />
      <stop offset="25%" stop-color="#ffd54f" />
      <stop offset="50%" stop-color="#ff6d00" />
      <stop offset="75%" stop-color="#ffa726" />
      <stop offset="100%" stop-color="#e65100" />
    </linearGradient>
    <linearGradient id="stKOrange" x1="150" y1="150" x2="350" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="stKGold" x1="200" y1="150" x2="350" y2="250" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffb74d" />
      <stop offset="100%" stop-color="#ff7828" />
    </linearGradient>
    <!-- Text Path for Circular Typography -->
    <path id="textCircleTop" d="M 90,250 A 160,160 0 1,1 410,250" fill="none" />
    <path id="textCircleBottom" d="M 410,250 A 160,160 0 0,1 90,250" fill="none" />
  </defs>

  <!-- Outer Die-Cut / Bleed Guide Area -->
  <circle cx="250" cy="250" r="242" fill="url(#stickerDark)" />
  <circle cx="250" cy="250" r="242" stroke="url(#goldRing)" stroke-width="6" />

  <!-- Fine Notched Precision Ring (Tech / Watch Bezel Vibe) -->
  <circle cx="250" cy="250" r="226" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="4 8" />
  <circle cx="250" cy="250" r="214" stroke="url(#goldRing)" stroke-width="1.5" stroke-opacity="0.7" />

  <!-- Circular Curved Packaging Text -->
  <text fill="#ffffff" font-family="'Outfit', system-ui, sans-serif" font-size="20" font-weight="900" letter-spacing="6">
    <textPath href="#textCircleTop" startOffset="50%" text-anchor="middle">
      ★ KAVIRO • SMART GADGETS ★
    </textPath>
  </text>

  <text fill="#ff9800" font-family="'Outfit', system-ui, sans-serif" font-size="16" font-weight="800" letter-spacing="4.5">
    <textPath href="#textCircleBottom" startOffset="50%" text-anchor="middle">
      • AUTHENTIC EDC GEAR • ESTD 2024 •
    </textPath>
  </text>

  <!-- Center Core Badge Background -->
  <circle cx="250" cy="250" r="125" fill="#12131a" stroke="url(#goldRing)" stroke-width="3" />
  <circle cx="250" cy="250" r="120" stroke="#ffffff" stroke-opacity="0.08" stroke-dasharray="2 4" />

  <!-- Center K Monogram (Large scale for crystal clear 300DPI print) -->
  <g transform="translate(145, 145) scale(1.75)">
    <!-- K Stem -->
    <rect x="24" y="20" width="10" height="50" rx="5" fill="#f8fafc" />
    <rect x="26.5" y="24" width="3" height="15" rx="1.5" fill="#ffffff" opacity="0.9" />

    <!-- K Upper Blade -->
    <path d="M37 43 L56 22 C58.5 19.5 62.5 19.5 65 22 L66.5 23.5 C69 26 69 30 66.5 32.5 L50 49 Z" fill="url(#stKGold)" />

    <!-- K Lower Blade -->
    <path d="M38 48 L58 68 C60.5 70.5 64.5 70.5 67 68 L68.5 66.5 C71 64 71 60 68.5 57.5 L51 40 Z" fill="url(#stKOrange)" />

    <!-- Core Tech Diamond -->
    <polygon points="44,45.5 49.5,40 55,45.5 49.5,51" fill="#ffffff" />
    <circle cx="49.5" cy="45.5" r="1.8" fill="#ff7828" />
  </g>

  <!-- Stars on flanks -->
  <polygon points="76,250 82,238 94,238 84,246 88,258 76,251 64,258 68,246 58,238 70,238" fill="#ff9800" />
  <polygon points="424,250 430,238 442,238 432,246 436,258 424,251 412,258 416,246 406,238 418,238" fill="#ff9800" />
</svg>`;

// 4. Rectangular Packaging Box Label / Barcode Tag (For product box packaging)
const boxLabelSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" fill="none">
  <defs>
    <linearGradient id="boxBg" x1="0" y1="0" x2="800" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f1015" />
      <stop offset="100%" stop-color="#050508" />
    </linearGradient>
    <linearGradient id="orangeLine" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="50%" stop-color="#ffb74d" />
      <stop offset="100%" stop-color="#ff5500" />
    </linearGradient>
  </defs>

  <!-- Outer Box Frame -->
  <rect x="10" y="10" width="780" height="480" rx="28" fill="url(#boxBg)" stroke="#27272a" stroke-width="4" />
  
  <!-- Top Accent Bar -->
  <path d="M 38 10 L 762 10" stroke="url(#orangeLine)" stroke-width="6" stroke-linecap="round" />

  <!-- Brand Lockup -->
  <g transform="translate(50, 45)">
    <!-- Mini emblem -->
    <rect x="0" y="0" width="60" height="60" rx="16" fill="#1c1d25" stroke="#ff7828" stroke-width="2" />
    <rect x="15" y="15" width="7" height="30" rx="3.5" fill="#ffffff" />
    <path d="M24 29 L37 16 C38.5 14.5 41 14.5 42.5 16 L43 16.5 C44.5 18 44.5 20.5 43 22 L32 33 Z" fill="#ffb74d" />
    <path d="M25 32 L38 45 C39.5 46.5 42 46.5 43.5 45 L44 44.5 C45.5 43 45.5 40.5 44 39 L33 28 Z" fill="#ff7828" />

    <text x="80" y="36" font-family="'Outfit', system-ui, sans-serif" font-size="34" font-weight="900" letter-spacing="5" fill="#ffffff">KAVIRO</text>
    <text x="82" y="54" font-family="'Outfit', system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="3.5" fill="#ff7828">PREMIUM SMART GADGETS &amp; EDC GEAR</text>
  </g>

  <!-- Security / Genuine Badge -->
  <g transform="translate(610, 45)">
    <rect x="0" y="0" width="140" height="60" rx="14" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
    <text x="70" y="26" text-anchor="middle" font-family="'Outfit', system-ui, sans-serif" font-size="10" font-weight="900" letter-spacing="1.5" fill="#22c55e">✓ 100% GENUINE</text>
    <text x="70" y="44" text-anchor="middle" font-family="'Outfit', system-ui, sans-serif" font-size="9" font-weight="700" letter-spacing="1" fill="#a1a1aa">QC INSPECTED</text>
  </g>

  <!-- Divider line -->
  <line x1="50" y1="130" x2="750" y2="130" stroke="#27272a" stroke-width="1.5" />

  <!-- Middle Specification Box -->
  <g transform="translate(50, 160)">
    <text x="0" y="0" font-family="'Outfit', system-ui, sans-serif" font-size="14" font-weight="800" letter-spacing="2" fill="#71717a">PRODUCT PACKAGING SPECIFICATION</text>
    
    <rect x="0" y="15" width="460" height="150" rx="16" fill="#121318" stroke="#27272a" />
    <text x="25" y="50" font-family="'Outfit', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Brand: <tspan fill="#ff7828">Kaviro Innovations</tspan></text>
    <text x="25" y="80" font-family="'Outfit', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Category: <tspan fill="#d4d4d8">High-Precision Smart Gadget / EDC Gear</tspan></text>
    <text x="25" y="110" font-family="'Outfit', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Batch / Model ID: <tspan fill="#d4d4d8">KVR-2026-X1</tspan></text>
    <text x="25" y="140" font-family="'Outfit', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Warranty: <tspan fill="#22c55e">Official Replacement Warranty Included</tspan></text>
  </g>

  <!-- Right Side QR Code & Serial Area -->
  <g transform="translate(540, 175)">
    <rect x="0" y="0" width="210" height="150" rx="16" fill="#ffffff" />
    <!-- Stylized Barcode -->
    <g transform="translate(25, 20)">
      <rect x="0" y="0" width="4" height="60" fill="#000" />
      <rect x="7" y="0" width="2" height="60" fill="#000" />
      <rect x="12" y="0" width="6" height="60" fill="#000" />
      <rect x="22" y="0" width="3" height="60" fill="#000" />
      <rect x="28" y="0" width="7" height="60" fill="#000" />
      <rect x="38" y="0" width="2" height="60" fill="#000" />
      <rect x="44" y="0" width="5" height="60" fill="#000" />
      <rect x="52" y="0" width="3" height="60" fill="#000" />
      <rect x="59" y="0" width="8" height="60" fill="#000" />
      <rect x="71" y="0" width="3" height="60" fill="#000" />
      <rect x="77" y="0" width="5" height="60" fill="#000" />
      <rect x="85" y="0" width="2" height="60" fill="#000" />
      <rect x="91" y="0" width="6" height="60" fill="#000" />
      <rect x="100" y="0" width="4" height="60" fill="#000" />
      <rect x="108" y="0" width="8" height="60" fill="#000" />
      <rect x="120" y="0" width="2" height="60" fill="#000" />
      <rect x="126" y="0" width="5" height="60" fill="#000" />
      <rect x="135" y="0" width="7" height="60" fill="#000" />
      <rect x="146" y="0" width="3" height="60" fill="#000" />
      <rect x="153" y="0" width="7" height="60" fill="#000" />
      <text x="80" y="80" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#000000">8 930128 472910</text>
      <text x="80" y="98" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="9" font-weight="800" fill="#71717a">SCAN FOR AUTHENTICITY</text>
    </g>
  </g>

  <!-- Bottom Brand Seal & Socials -->
  <line x1="50" y1="350" x2="750" y2="350" stroke="#27272a" stroke-width="1.5" />
  
  <g transform="translate(50, 380)">
    <text x="0" y="20" font-family="'Outfit', system-ui, sans-serif" font-size="12" font-weight="700" fill="#a1a1aa">Designed &amp; Curated for Tech Enthusiasts Across Bangladesh.</text>
    <text x="0" y="42" font-family="'Outfit', system-ui, sans-serif" font-size="11" font-weight="600" fill="#71717a">Official Store: kaviro.onrender.com • All Rights Reserved</text>
  </g>

  <g transform="translate(610, 385)">
    <rect x="0" y="0" width="140" height="36" rx="10" fill="#ff7828" />
    <text x="70" y="23" text-anchor="middle" font-family="'Outfit', system-ui, sans-serif" font-size="11" font-weight="900" letter-spacing="1.5" fill="#ffffff">SEALED BY KAVIRO</text>
  </g>
</svg>`;

// Write all assets to frontend/src/assets and frontend/public
fs.writeFileSync('frontend/src/assets/logo.svg', horizontalLogoSvg);
fs.writeFileSync('frontend/public/favicon.svg', emblemSvg);
fs.writeFileSync('frontend/public/kaviro-logo.svg', horizontalLogoSvg);
fs.writeFileSync('frontend/public/kaviro-emblem.svg', emblemSvg);
fs.writeFileSync('frontend/public/kaviro-sticker-badge.svg', stickerBadgeSvg);
fs.writeFileSync('frontend/public/kaviro-box-label.svg', boxLabelSvg);

console.log('Successfully generated all Kaviro brand SVG assets!');

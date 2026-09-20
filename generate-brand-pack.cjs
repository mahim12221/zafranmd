const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'brand-assets');

// ==========================================
// 1. LOGO PACK (Horizontal & Vertical Lockups)
// ==========================================

// 1.1 Horizontal Logo - Dark / Black Background (For Dark Packaging & Website Nav)
const logoHorizontalDark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="kOrange" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="kDarkBadge" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>

  <!-- Background for dark presentation -->
  <rect width="480" height="120" rx="16" fill="#09090b"/>

  <!-- Iconic Monogram Lockup (86x86) -->
  <g transform="translate(24, 17)">
    <rect width="86" height="86" rx="24" fill="url(#kDarkBadge)" stroke="#27272a" stroke-width="2"/>
    
    <!-- Monogram K -->
    <g transform="translate(22, 17)">
      <!-- Vertical Stem -->
      <rect x="0" y="0" width="8.5" height="52" rx="4.25" fill="#ffffff"/>
      <!-- Upper Blade -->
      <path d="M16 26 L36.5 6 C38.5 4 42.5 5.5 42.5 8.5 L42.5 13.5 C42.5 15.5 41.5 17 40 18.5 L23 33 Z" fill="url(#kOrange)"/>
      <!-- Lower Blade -->
      <path d="M16 26 L39.5 49.5 C41 51 42 53 42 55 L42 60 C42 63 38 64.5 36 62.5 L16 42.5 Z" fill="#ffffff"/>
      <!-- Accent Tech Dot -->
      <circle cx="21" cy="32.5" r="3.5" fill="url(#kOrange)" stroke="#09090b" stroke-width="1.5"/>
    </g>
  </g>

  <!-- Brand Typography -->
  <g transform="translate(132, 30)">
    <text x="0" y="42" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" letter-spacing="5" fill="#ffffff">KERIYO</text>
    <circle cx="216" cy="34" r="5" fill="#ff7828"/>
    <text x="2" y="65" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12.5" font-weight="700" letter-spacing="4.5" fill="#a1a1aa">SMART GADGETS &amp; EDC GEAR</text>
  </g>
</svg>`;

// 1.2 Horizontal Logo - Transparent / Light Background (For White Paper, Invoices, Delivery Slips)
const logoHorizontalLight = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="kOrangeLight" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Clean Minimalist Lockup -->
  <g transform="translate(24, 17)">
    <rect width="86" height="86" rx="24" fill="#09090b"/>
    <g transform="translate(22, 17)">
      <rect x="0" y="0" width="8.5" height="52" rx="4.25" fill="#ffffff"/>
      <path d="M16 26 L36.5 6 C38.5 4 42.5 5.5 42.5 8.5 L42.5 13.5 C42.5 15.5 41.5 17 40 18.5 L23 33 Z" fill="url(#kOrangeLight)"/>
      <path d="M16 26 L39.5 49.5 C41 51 42 53 42 55 L42 60 C42 63 38 64.5 36 62.5 L16 42.5 Z" fill="#ffffff"/>
      <circle cx="21" cy="32.5" r="3.5" fill="url(#kOrangeLight)" stroke="#09090b" stroke-width="1.5"/>
    </g>
  </g>

  <!-- Typography on Light Background -->
  <g transform="translate(132, 30)">
    <text x="0" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="5" fill="#09090b">KERIYO</text>
    <circle cx="216" cy="34" r="5" fill="#ff7828"/>
    <text x="2" y="65" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12.5" font-weight="700" letter-spacing="4.5" fill="#52525b">SMART GADGETS &amp; EDC GEAR</text>
  </g>
</svg>`;

// 1.3 Stacked / Vertical Center Logo (For Apparel, Box Tops & Social Media Display)
const logoVerticalCentered = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="kOrangeVert" x1="0" y1="0" x2="70" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="kVertBg" x1="0" y1="0" x2="360" y2="360" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>

  <rect width="360" height="360" rx="36" fill="url(#kVertBg)"/>
  <rect x="2" y="2" width="356" height="356" rx="34" stroke="#27272a" stroke-width="2"/>

  <!-- Centered Emblem -->
  <g transform="translate(124, 60)">
    <rect width="112" height="112" rx="30" fill="#09090b" stroke="#3f3f46" stroke-width="2"/>
    <g transform="translate(29, 21)">
      <rect x="0" y="0" width="11" height="70" rx="5.5" fill="#ffffff"/>
      <path d="M22 35 L48 10 C50 8 54 9.5 54 12.5 L54 18 C54 20 53 22 51.5 23.5 L31 43 Z" fill="url(#kOrangeVert)"/>
      <path d="M22 35 L51.5 64.5 C53 66 54 68 54 70 L54 75.5 C54 78.5 50 80 48 78 L22 52 Z" fill="#ffffff"/>
      <circle cx="27" cy="43.5" r="4.5" fill="url(#kOrangeVert)" stroke="#09090b" stroke-width="2"/>
    </g>
  </g>

  <!-- Centered Typography -->
  <g transform="translate(180, 230)" text-anchor="middle">
    <text x="0" y="20" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="38" font-weight="900" letter-spacing="7" fill="#ffffff">KERIYO</text>
    <circle cx="96" cy="12" r="4.5" fill="#ff7828"/>
    <text x="0" y="48" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="4" fill="#a1a1aa">TACTILE &amp; SMART GADGETS</text>
    <text x="0" y="70" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="2" fill="#ff7828">EST. 2026 • GENUINE QUALITY</text>
  </g>
</svg>`;

// ==========================================
// 2. STICKER PACK (Ready-to-Print Vectors)
// ==========================================

// 2.1 Round Hologram / Matte Black Packaging Seal Sticker (Diameter 400px)
const stickerRoundSeal = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="sealDark" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="50%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#1c1917" />
    </linearGradient>
    <linearGradient id="sealOrange" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <!-- Circular Text Path -->
    <path id="circleTextPath" d="M 200, 200 m -140, 0 a 140,140 0 1,1 280,0 a 140,140 0 1,1 -280,0" />
    <path id="circleTextPathBottom" d="M 200, 200 m -140, 0 a 140,140 0 0,0 280,0" />
  </defs>

  <!-- Outer Cut Line Guide -->
  <circle cx="200" cy="200" r="196" fill="url(#sealDark)" stroke="#27272a" stroke-width="2"/>
  
  <!-- Dashed Precision Tech Ring -->
  <circle cx="200" cy="200" r="182" stroke="#ff7828" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
  <circle cx="200" cy="200" r="172" stroke="#3f3f46" stroke-width="1"/>

  <!-- Circular Outer Branding Text -->
  <text font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="4.5" fill="#e4e4e7">
    <textPath href="#circleTextPath" startOffset="50%" text-anchor="middle">
      ★ KERIYO SMART GEAR ★ AUTHENTIC EDC GADGETS
    </textPath>
  </text>

  <!-- Inner Core Center -->
  <circle cx="200" cy="200" r="110" fill="#09090b" stroke="#27272a" stroke-width="2"/>

  <!-- Monogram in Center -->
  <g transform="translate(160, 125)">
    <rect x="0" y="0" width="12" height="74" rx="6" fill="#ffffff"/>
    <path d="M23 37 L50 11 C52 9 57 10.5 57 13.5 L57 19.5 C57 21.5 56 23.5 54.5 25 L32.5 45.5 Z" fill="url(#sealOrange)"/>
    <path d="M23 37 L54.5 68.5 C56 70 57 72 57 74 L57 80 C57 83 52 84.5 50 82.5 L23 55.5 Z" fill="#ffffff"/>
    <circle cx="28.5" cy="46" r="4.5" fill="url(#sealOrange)" stroke="#09090b" stroke-width="2"/>
  </g>

  <!-- Bottom Badge Text -->
  <text x="200" y="242" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" letter-spacing="4" fill="#ffffff" text-anchor="middle">KERIYO</text>
  <text x="200" y="260" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="800" letter-spacing="2" fill="#ff7828" text-anchor="middle">SEALED &amp; VERIFIED</text>
</svg>`;

// 2.2 Tamper-Evident Box Seal Strip Sticker (Rectangle 420x90px)
const stickerBoxSealStrip = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 90" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="stripBg" x1="0" y1="0" x2="420" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <linearGradient id="stripOrange" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <rect width="420" height="90" rx="8" fill="url(#stripBg)" stroke="#27272a" stroke-width="1.5"/>

  <!-- Security Stitch Pattern Edges -->
  <rect x="0" y="0" width="8" height="90" fill="url(#stripOrange)" rx="2"/>
  <rect x="412" y="0" width="8" height="90" fill="url(#stripOrange)" rx="2"/>

  <!-- Left Icon -->
  <g transform="translate(24, 20)">
    <rect width="50" height="50" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
    <g transform="translate(13, 10)">
      <rect x="0" y="0" width="5" height="30" rx="2.5" fill="#ffffff"/>
      <path d="M10 15 L21 4 C22 3 24 3.5 24 5 L24 8 C24 9 23.5 10 22.5 10.8 L13 19 Z" fill="#ff7828"/>
      <path d="M10 15 L22.5 27.5 C23.5 28.5 24 29.5 24 30.5 L24 33.5 C24 35 22 35.8 21 34.8 L10 23.8 Z" fill="#ffffff"/>
      <circle cx="12.5" cy="19" r="2.2" fill="#ff7828" stroke="#09090b" stroke-width="1"/>
    </g>
  </g>

  <!-- Middle Warning & Brand Text -->
  <g transform="translate(90, 24)">
    <div xmlns="http://www.w3.org/1999/xhtml"></div>
    <text x="0" y="19" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#ffffff">KERIYO</text>
    <text x="85" y="19" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="800" letter-spacing="2" fill="#ff7828">SECURITY SEAL</text>
    <text x="0" y="38" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="0.8" fill="#a1a1aa">DO NOT ACCEPT IF THIS TAMPER TAPE IS BROKEN OR DAMAGED</text>
  </g>

  <!-- Right Barcode / Serial Simulation -->
  <g transform="translate(340, 25)">
    <rect x="0" y="0" width="2" height="35" fill="#71717a"/>
    <rect x="4" y="0" width="4" height="35" fill="#ffffff"/>
    <rect x="11" y="0" width="1" height="35" fill="#71717a"/>
    <rect x="15" y="0" width="3" height="35" fill="#ffffff"/>
    <rect x="21" y="0" width="5" height="35" fill="#71717a"/>
    <rect x="29" y="0" width="2" height="35" fill="#ffffff"/>
    <rect x="34" y="0" width="4" height="35" fill="#71717a"/>
    <text x="18" y="47" font-family="monospace" font-size="7" fill="#71717a" text-anchor="middle">KY-GENUINE</text>
  </g>
</svg>`;

// 2.3 Die-Cut Aesthetic Gear Badge Sticker (For Laptops, Gadgets, Cases - 320x180px)
const stickerDiecutBadge = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="dieCutGrad" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#27272a" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>

  <!-- Die-Cut Capsule Badge Shape -->
  <rect x="6" y="6" width="308" height="168" rx="28" fill="url(#dieCutGrad)" stroke="#ff7828" stroke-width="2.5"/>
  <rect x="12" y="12" width="296" height="156" rx="22" stroke="#3f3f46" stroke-width="1" stroke-dasharray="5 3"/>

  <!-- Left Emblem -->
  <g transform="translate(35, 45)">
    <rect width="64" height="64" rx="18" fill="#09090b" stroke="#52525b" stroke-width="1.5"/>
    <g transform="translate(17, 13)">
      <rect x="0" y="0" width="6" height="38" rx="3" fill="#ffffff"/>
      <path d="M12 19 L26 5 C27.5 3.5 30 4.5 30 6.5 L30 9.5 C30 10.8 29.5 12 28.5 13 L17 24.5 Z" fill="#ff7828"/>
      <path d="M12 19 L28.5 35.5 C29.5 36.5 30 37.8 30 39 L30 42 C30 44 27.5 45 26 43.5 L12 29.5 Z" fill="#ffffff"/>
      <circle cx="15.5" cy="24" r="2.8" fill="#ff7828" stroke="#09090b" stroke-width="1.2"/>
    </g>
  </g>

  <!-- Right Content -->
  <g transform="translate(118, 55)">
    <text x="0" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="4" fill="#ffffff">KERIYO</text>
    <circle cx="140" cy="18" r="4" fill="#ff7828"/>
    <text x="1" y="44" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="2" fill="#d4d4d8">SMART EDC LABS</text>
    <text x="1" y="58" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="600" letter-spacing="1.2" fill="#ff7828">PRECISION MECHANICS</text>
  </g>
</svg>`;

// ==========================================
// 3. PRODUCT COVER / PACKAGING BOX DESIGN
// ==========================================

// 3.1 Luxury Retail Box Front Cover (500x700px Aspect - 5:7 Portrait Packaging)
const productBoxCoverFront = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="boxBg" x1="0" y1="0" x2="500" y2="700" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="60%" stop-color="#09090b" />
      <stop offset="100%" stop-color="#111113" />
    </linearGradient>
    <linearGradient id="boxOrange" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Base Rigid Box Cover Face -->
  <rect width="500" height="700" rx="20" fill="url(#boxBg)"/>
  
  <!-- Subtle Luxury Inner Border Foil Stamping Line -->
  <rect x="20" y="20" width="460" height="660" rx="14" stroke="#27272a" stroke-width="1.5"/>
  <rect x="28" y="28" width="444" height="644" rx="10" stroke="#3f3f46" stroke-width="0.8" stroke-dasharray="4 4" opacity="0.4"/>

  <!-- Top Brand Header Lockup -->
  <g transform="translate(50, 60)">
    <!-- Iconic Monogram -->
    <rect width="54" height="54" rx="16" fill="#09090b" stroke="#3f3f46" stroke-width="1.5"/>
    <g transform="translate(14, 11)">
      <rect x="0" y="0" width="5" height="32" rx="2.5" fill="#ffffff"/>
      <path d="M10 16 L22 4 C23.5 2.5 26 3.5 26 5.5 L26 8.5 C26 9.8 25.5 11 24.5 12 L14 21.5 Z" fill="url(#boxOrange)"/>
      <path d="M10 16 L24.5 30.5 C25.5 31.5 26 32.8 26 34 L26 37 C26 39 23.5 40 22 38.5 L10 26.5 Z" fill="#ffffff"/>
      <circle cx="13" cy="21" r="2.5" fill="url(#boxOrange)" stroke="#09090b" stroke-width="1"/>
    </g>

    <!-- Wordmark -->
    <text x="70" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="4" fill="#ffffff">KERIYO</text>
    <circle cx="210" cy="24" r="4" fill="#ff7828"/>
    <text x="72" y="48" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="700" letter-spacing="3" fill="#a1a1aa">TACTILE SMART GEAR</text>
  </g>

  <!-- Top Right Edition Tag -->
  <g transform="translate(350, 65)">
    <rect width="95" height="24" rx="12" fill="#27272a" stroke="#3f3f46" stroke-width="1"/>
    <text x="47.5" y="15.5" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="800" letter-spacing="1.5" fill="#ff7828" text-anchor="middle">PREMIUM DROP</text>
  </g>

  <!-- Center Visual Display Area (Minimal Geometric Wireframe Blueprint) -->
  <g transform="translate(75, 175)">
    <!-- Product Showcase Capsule Frame -->
    <rect width="350" height="270" rx="24" fill="#09090b" stroke="#27272a" stroke-width="2"/>
    
    <!-- Blueprint Radial Grid -->
    <circle cx="175" cy="135" r="100" stroke="#27272a" stroke-width="1" stroke-dasharray="4 6"/>
    <circle cx="175" cy="135" r="60" stroke="#3f3f46" stroke-width="0.8"/>
    <line x1="175" y1="15" x2="175" y2="255" stroke="#27272a" stroke-width="1" stroke-dasharray="2 4"/>
    <line x1="55" y1="135" x2="295" y2="135" stroke="#27272a" stroke-width="1" stroke-dasharray="2 4"/>

    <!-- Large Elegant Watermark Monogram in Center -->
    <g transform="translate(130, 85)">
      <rect x="0" y="0" width="14" height="90" rx="7" fill="#ffffff"/>
      <path d="M28 45 L62 12 C64.5 9.5 70 11.5 70 15 L70 22 C70 25 68 27.5 66 29.5 L39 55 Z" fill="url(#boxOrange)"/>
      <path d="M28 45 L66 83 C68 85 70 87.5 70 90.5 L70 97.5 C70 101 64.5 103 62 100.5 L28 67 Z" fill="#ffffff"/>
      <circle cx="35" cy="56" r="6" fill="url(#boxOrange)" stroke="#09090b" stroke-width="2.5"/>
    </g>

    <!-- Corner Technical Markers -->
    <text x="16" y="24" font-family="monospace" font-size="8" fill="#71717a">MODEL: KY-2026-X</text>
    <text x="334" y="24" font-family="monospace" font-size="8" fill="#71717a" text-anchor="end">EDC // TACTILE</text>
    <text x="16" y="254" font-family="monospace" font-size="8" fill="#71717a">ALLOY: CNC TITANIUM &amp; STEEL</text>
    <text x="334" y="254" font-family="monospace" font-size="8" fill="#ff7828" text-anchor="end">AUTHENTIC GRADE A</text>
  </g>

  <!-- Product Title & Info Section -->
  <g transform="translate(50, 480)">
    <text x="0" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="1.5" fill="#ffffff">PRECISION EDC GADGET</text>
    <text x="0" y="50" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="600" fill="#a1a1aa">Engineered for Daily Tactile Focus &amp; Tech Utility</text>

    <!-- Specs Grid -->
    <g transform="translate(0, 75)">
      <rect x="0" y="0" width="125" height="42" rx="10" fill="#18181b" stroke="#27272a" stroke-width="1"/>
      <text x="12" y="17" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="#71717a">MATERIAL</text>
      <text x="12" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="800" fill="#ffffff">CNC Metal</text>

      <rect x="135" y="0" width="125" height="42" rx="10" fill="#18181b" stroke="#27272a" stroke-width="1"/>
      <text x="147" y="17" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="#71717a">WARRANTY</text>
      <text x="147" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="800" fill="#ff7828">Genuine BD</text>

      <rect x="270" y="0" width="130" height="42" rx="10" fill="#18181b" stroke="#27272a" stroke-width="1"/>
      <text x="282" y="17" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="#71717a">CATEGORY</text>
      <text x="282" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="800" fill="#ffffff">EDC / Smart</text>
    </g>
  </g>

  <!-- Bottom Barcode & Certifications Footer -->
  <g transform="translate(50, 625)">
    <line x1="0" y1="0" x2="400" y2="0" stroke="#27272a" stroke-width="1"/>
    
    <g transform="translate(0, 15)">
      <text x="0" y="14" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="800" letter-spacing="2" fill="#ffffff">KERIYO OFFICIAL PACKAGING</text>
      <text x="0" y="28" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" fill="#71717a">Designed in BD • Curated with Pride • All Rights Reserved</text>
    </g>

    <!-- Mini Barcode -->
    <g transform="translate(320, 10)">
      <rect x="0" y="0" width="2" height="24" fill="#ffffff"/>
      <rect x="4" y="0" width="3" height="24" fill="#ffffff"/>
      <rect x="9" y="0" width="1" height="24" fill="#71717a"/>
      <rect x="12" y="0" width="4" height="24" fill="#ffffff"/>
      <rect x="18" y="0" width="2" height="24" fill="#71717a"/>
      <rect x="22" y="0" width="4" height="24" fill="#ffffff"/>
      <rect x="28" y="0" width="1" height="24" fill="#ffffff"/>
      <rect x="31" y="0" width="3" height="24" fill="#ffffff"/>
      <rect x="36" y="0" width="2" height="24" fill="#71717a"/>
      <rect x="40" y="0" width="3" height="24" fill="#ffffff"/>
      <rect x="45" y="0" width="2" height="24" fill="#ffffff"/>
      <text x="23" y="33" font-family="monospace" font-size="6" fill="#71717a" text-anchor="middle">894001928374</text>
    </g>
  </g>
</svg>`;

// 3.2 Product Back Cover / Warranty & Specs Card (500x700px)
const productBoxCoverBack = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="backBg" x1="0" y1="0" x2="500" y2="700" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>

  <rect width="500" height="700" rx="20" fill="url(#backBg)"/>
  <rect x="20" y="20" width="460" height="660" rx="14" stroke="#27272a" stroke-width="1.5"/>

  <!-- Header -->
  <g transform="translate(50, 55)">
    <text x="0" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="24" font-weight="900" letter-spacing="3" fill="#ffffff">PRODUCT SPECIFICATIONS</text>
    <text x="0" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="2" fill="#ff7828">KERIYO QUALITY ASSURED</text>
    <line x1="0" y1="55" x2="400" y2="55" stroke="#27272a" stroke-width="1"/>
  </g>

  <!-- Spec Table List -->
  <g transform="translate(50, 135)">
    <!-- Row 1 -->
    <g transform="translate(0, 0)">
      <rect width="400" height="42" rx="8" fill="#18181b"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Product Name</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="end">Keriyo EDC Tactical Gear / Gadget</text>
    </g>
    <!-- Row 2 -->
    <g transform="translate(0, 50)">
      <rect width="400" height="42" rx="8" fill="#111113"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Brand / Origin</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ff7828" text-anchor="end">KERIYO (Bangladesh)</text>
    </g>
    <!-- Row 3 -->
    <g transform="translate(0, 100)">
      <rect width="400" height="42" rx="8" fill="#18181b"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Material Construction</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="end">Precision Alloy / High-Grade Polymer</text>
    </g>
    <!-- Row 4 -->
    <g transform="translate(0, 150)">
      <rect width="400" height="42" rx="8" fill="#111113"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Quality Standard</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="end">QC Passed &amp; Verified</text>
    </g>
    <!-- Row 5 -->
    <g transform="translate(0, 200)">
      <rect width="400" height="42" rx="8" fill="#18181b"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Official Website</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ff7828" text-anchor="end">keriyo.com</text>
    </g>
  </g>

  <!-- Usage & Care Notice -->
  <g transform="translate(50, 410)">
    <rect width="400" height="110" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
    <text x="20" y="30" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="800" fill="#ff7828">CUSTOMER CARE &amp; SUPPORT</text>
    <text x="20" y="55" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" fill="#d4d4d8">For warranty claims, inquiries, or replacement parts:</text>
    <text x="20" y="75" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" fill="#a1a1aa">WhatsApp / Phone: +880 1888 644558</text>
    <text x="20" y="93" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" fill="#a1a1aa">Founder &amp; Curation: Mahim Afridi</text>
  </g>

  <!-- Big Authentic Security Stamp -->
  <g transform="translate(250, 580)">
    <!-- Stamp Outline -->
    <circle cx="0" cy="0" r="45" stroke="#ff7828" stroke-width="2" stroke-dasharray="6 3"/>
    <circle cx="0" cy="0" r="38" stroke="#ff7828" stroke-width="1"/>
    <text x="0" y="-8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="900" letter-spacing="2" fill="#ff7828" text-anchor="middle">ORIGINAL</text>
    <text x="0" y="6" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" letter-spacing="3" fill="#ffffff" text-anchor="middle">KERIYO</text>
    <text x="0" y="18" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="6.5" font-weight="800" letter-spacing="1.5" fill="#ff7828" text-anchor="middle">100% GENUINE</text>
  </g>

  <!-- Compliance Icons -->
  <g transform="translate(50, 635)">
    <text x="0" y="10" font-family="sans-serif" font-size="16" fill="#a1a1aa">♻ ♺ ⚡ ⚙</text>
    <text x="65" y="8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" fill="#71717a">Recyclable Packaging • Eco-Conscious Materials</text>
  </g>
</svg>`;

// ==========================================
// 4. WRITE ASSETS & GENERATE HTML CATALOG
// ==========================================

const files = [
  { name: 'logo-horizontal-dark.svg', data: logoHorizontalDark, category: '1. Logos' },
  { name: 'logo-horizontal-light.svg', data: logoHorizontalLight, category: '1. Logos' },
  { name: 'logo-vertical-centered.svg', data: logoVerticalCentered, category: '1. Logos' },
  { name: 'sticker-round-seal.svg', data: stickerRoundSeal, category: '2. Stickers' },
  { name: 'sticker-box-seal-strip.svg', data: stickerBoxSealStrip, category: '2. Stickers' },
  { name: 'sticker-diecut-badge.svg', data: stickerDiecutBadge, category: '2. Stickers' },
  { name: 'product-box-cover-front.svg', data: productBoxCoverFront, category: '3. Packaging Covers' },
  { name: 'product-box-cover-back.svg', data: productBoxCoverBack, category: '3. Packaging Covers' }
];

// Save individual vector files into brand-assets/
files.forEach(f => {
  fs.writeFileSync(path.join(outDir, f.name), f.data);
  console.log(`Saved: brand-assets/${f.name}`);
});

// HTML visual preview page inside brand-assets/
const htmlPreview = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KERIYO Brand Assets, Stickers & Packaging Pack</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-zinc-950 text-white min-h-screen p-6 sm:p-12">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="border-b border-zinc-800 pb-8 mb-10">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
        Official Brand Kit • Standalone Package
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
        KERIYO <span class="text-orange-500">Brand Kit</span>
      </h1>
      <p class="text-zinc-400 text-sm sm:text-base max-w-2xl">
        All vector SVG files for Keriyo logo variations, packaging stickers, tamper seals, and product cover box designs. These files are located in <code class="text-orange-400 bg-zinc-900 px-2 py-0.5 rounded">brand-assets/</code> completely detached from the website code.
      </p>
    </div>

    <!-- Section 1: Logos -->
    <div class="mb-14">
      <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6 flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 1. Official Logos (Dark, Light & Vertical)
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Dark -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-zinc-400">Horizontal Logo (Dark Background)</span>
            <a href="logo-horizontal-dark.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg">Download SVG</a>
          </div>
          <div class="bg-black rounded-xl p-4 flex items-center justify-center">
            <img src="logo-horizontal-dark.svg" alt="Dark Logo" class="max-h-24 w-auto"/>
          </div>
        </div>

        <!-- Light -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-zinc-400">Horizontal Logo (Light / Transparent)</span>
            <a href="logo-horizontal-light.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg">Download SVG</a>
          </div>
          <div class="bg-white rounded-xl p-4 flex items-center justify-center">
            <img src="logo-horizontal-light.svg" alt="Light Logo" class="max-h-24 w-auto"/>
          </div>
        </div>

        <!-- Vertical Centered -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:col-span-2">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-zinc-400">Vertical Stacked Logo (Box Tops, Merch & Social Icons)</span>
            <a href="logo-vertical-centered.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg">Download SVG</a>
          </div>
          <div class="bg-black rounded-xl p-6 flex items-center justify-center">
            <img src="logo-vertical-centered.svg" alt="Vertical Logo" class="max-h-64 w-auto"/>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Stickers -->
    <div class="mb-14">
      <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6 flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 2. Stickers & Packaging Seals
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Round Seal -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-zinc-400">Round Package Seal</span>
            <a href="sticker-round-seal.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg">Download</a>
          </div>
          <div class="bg-black/50 rounded-xl p-4 flex items-center justify-center">
            <img src="sticker-round-seal.svg" alt="Round Seal" class="max-h-48 w-auto"/>
          </div>
        </div>

        <!-- Die-cut Badge -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-zinc-400">Tactile Die-Cut Badge</span>
            <a href="sticker-diecut-badge.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg">Download</a>
          </div>
          <div class="bg-black/50 rounded-xl p-4 flex items-center justify-center">
            <img src="sticker-diecut-badge.svg" alt="Diecut Badge" class="max-h-48 w-auto"/>
          </div>
        </div>

        <!-- Box Seal Strip -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-zinc-400">Tamper Box Seal Strip</span>
            <a href="sticker-box-seal-strip.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 rounded-lg">Download</a>
          </div>
          <div class="bg-black/50 rounded-xl p-4 flex items-center justify-center">
            <img src="sticker-box-seal-strip.svg" alt="Box Seal Strip" class="w-full h-auto"/>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Product Box Covers -->
    <div class="mb-14">
      <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6 flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 3. Product Box Cover Designs (Front & Back)
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Front Cover -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-base font-bold text-white">Front Box Cover</h3>
              <p class="text-xs text-zinc-500">For retail boxes, sleeves and packaging fronts</p>
            </div>
            <a href="product-box-cover-front.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg">Download SVG</a>
          </div>
          <div class="bg-black rounded-xl p-4 flex items-center justify-center">
            <img src="product-box-cover-front.svg" alt="Front Cover" class="max-h-[500px] w-auto"/>
          </div>
        </div>

        <!-- Back Cover -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-base font-bold text-white">Back Specs &amp; Warranty Cover</h3>
              <p class="text-xs text-zinc-500">Specs, warranty seal, customer support and barcode</p>
            </div>
            <a href="product-box-cover-back.svg" download class="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg">Download SVG</a>
          </div>
          <div class="bg-black rounded-xl p-4 flex items-center justify-center">
            <img src="product-box-cover-back.svg" alt="Back Cover" class="max-h-[500px] w-auto"/>
          </div>
        </div>
      </div>
    </div>

    <!-- Readme Instructions -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm text-zinc-400 leading-relaxed">
      <h4 class="text-white font-bold text-base mb-2">📌 How to use these files:</h4>
      <ul class="list-disc pl-5 space-y-1">
        <li>All files are pure <strong>Scalable Vector Graphics (SVG)</strong>, meaning you can scale them to any size (from a tiny 1-inch sticker to a giant shop billboard) without any pixelation or loss of quality.</li>
        <li>You can open them directly in <strong>Adobe Illustrator, Photoshop, Figma, CorelDraw</strong> or send them straight to any printing press in Bangladesh.</li>
        <li>These files are located in the <code class="text-white">brand-assets/</code> folder inside the project root, completely independent of the e-commerce website code.</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), htmlPreview);

// Also create a clear README.md inside the brand-assets folder
const readmeMd = `# KERIYO Brand Assets, Stickers & Packaging Pack

This folder contains all vector branding assets for **KERIYO**, created as completely standalone files with no code dependencies on the main website.

---

## 📁 Files in this folder:

### 1. Logo Variations
- **\`logo-horizontal-dark.svg\`**: Official horizontal logo for dark surfaces, packaging, black cards, or digital banners.
- **\`logo-horizontal-light.svg\`**: Official horizontal logo on transparent/light background for white invoices, stationery, letterheads, and delivery slips.
- **\`logo-vertical-centered.svg\`**: Stacked vertical centered logo lockup, ideal for box tops, t-shirts, hoodies, and social media profile icons.

### 2. Stickers & Packaging Seals
- **\`sticker-round-seal.svg\`**: Circular premium seal sticker (*"KERIYO SMART GEAR • SEALED & VERIFIED"*), perfect for closing packaging boxes, wrapping tissue paper, or circular die-cut stickers.
- **\`sticker-box-seal-strip.svg\`**: Tamper-evident rectangular security strip tape (*"DO NOT ACCEPT IF THIS TAMPER TAPE IS BROKEN"*), to be pasted over product box opening seams.
- **\`sticker-diecut-badge.svg\`**: Die-cut tactical pill badge sticker (*"KERIYO SMART EDC LABS"*), designed as free giveaway swag stickers that customers can put on laptops, bikes, or gadget cases.

### 3. Product Packaging Box Covers
- **\`product-box-cover-front.svg\`**: Full retail box front cover design featuring the Keriyo monogram, blueprint wireframe aesthetic, product title, material specs, and authentic Grade-A label.
- **\`product-box-cover-back.svg\`**: Full retail box back cover featuring technical specifications table, origin details, customer support contact (+880 1888 644558), official website, barcode, and genuine authentic guarantee stamp.

### 4. Interactive Showcase Catalog
- **\`index.html\`**: An HTML preview page where you can visually inspect and directly download all files.

---

## 🖨️ Printing & Fabrication Guidelines:
- **Format**: 100% vector SVG. Infinitely scalable with zero pixelation.
- **Supported Software**: Adobe Illustrator, Figma, CorelDraw, Adobe Photoshop, Affinity Designer.
- **Color Codes**:
  - Keriyo Signature Orange: \`#ff7828\` / \`#ea580c\`
  - Deep Luxury Tech Black: \`#09090b\`
  - Slate Dark Neutral: \`#18181b\` / \`#27272a\`
  - Crisp White: \`#ffffff\`
`;

fs.writeFileSync(path.join(outDir, 'README.md'), readmeMd);

console.log('Complete brand kit generated in brand-assets/ !');

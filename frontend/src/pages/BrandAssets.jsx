import React, { useState } from 'react';

// Embedded vector SVG strings so download NEVER depends on external files or 403 server restrictions
const VECTORS = {
  "logo-horizontal-dark.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="100%" height="100%" fill="none">
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
  <rect width="480" height="120" rx="16" fill="#09090b"/>
  <g transform="translate(24, 17)">
    <rect width="86" height="86" rx="24" fill="url(#kDarkBadge)" stroke="#27272a" stroke-width="2"/>
    <g transform="translate(22, 17)">
      <rect x="0" y="0" width="8.5" height="52" rx="4.25" fill="#ffffff"/>
      <path d="M16 26 L36.5 6 C38.5 4 42.5 5.5 42.5 8.5 L42.5 13.5 C42.5 15.5 41.5 17 40 18.5 L23 33 Z" fill="url(#kOrange)"/>
      <path d="M16 26 L39.5 49.5 C41 51 42 53 42 55 L42 60 C42 63 38 64.5 36 62.5 L16 42.5 Z" fill="#ffffff"/>
      <circle cx="21" cy="32.5" r="3.5" fill="url(#kOrange)" stroke="#09090b" stroke-width="1.5"/>
    </g>
  </g>
  <g transform="translate(132, 30)">
    <text x="0" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="5" fill="#ffffff">KERIYO</text>
    <circle cx="216" cy="34" r="5" fill="#ff7828"/>
    <text x="2" y="65" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12.5" font-weight="700" letter-spacing="4.5" fill="#a1a1aa">SMART GADGETS &amp; EDC GEAR</text>
  </g>
</svg>`,

  "logo-horizontal-light.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="kOrangeLight" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff7828" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <g transform="translate(24, 17)">
    <rect width="86" height="86" rx="24" fill="#09090b"/>
    <g transform="translate(22, 17)">
      <rect x="0" y="0" width="8.5" height="52" rx="4.25" fill="#ffffff"/>
      <path d="M16 26 L36.5 6 C38.5 4 42.5 5.5 42.5 8.5 L42.5 13.5 C42.5 15.5 41.5 17 40 18.5 L23 33 Z" fill="url(#kOrangeLight)"/>
      <path d="M16 26 L39.5 49.5 C41 51 42 53 42 55 L42 60 C42 63 38 64.5 36 62.5 L16 42.5 Z" fill="#ffffff"/>
      <circle cx="21" cy="32.5" r="3.5" fill="url(#kOrangeLight)" stroke="#09090b" stroke-width="1.5"/>
    </g>
  </g>
  <g transform="translate(132, 30)">
    <text x="0" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="5" fill="#09090b">KERIYO</text>
    <circle cx="216" cy="34" r="5" fill="#ff7828"/>
    <text x="2" y="65" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12.5" font-weight="700" letter-spacing="4.5" fill="#52525b">SMART GADGETS &amp; EDC GEAR</text>
  </g>
</svg>`,

  "logo-vertical-centered.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="100%" height="100%" fill="none">
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
  <g transform="translate(124, 60)">
    <rect width="112" height="112" rx="30" fill="#09090b" stroke="#3f3f46" stroke-width="2"/>
    <g transform="translate(29, 21)">
      <rect x="0" y="0" width="11" height="70" rx="5.5" fill="#ffffff"/>
      <path d="M22 35 L48 10 C50 8 54 9.5 54 12.5 L54 18 C54 20 53 22 51.5 23.5 L31 43 Z" fill="url(#kOrangeVert)"/>
      <path d="M22 35 L51.5 64.5 C53 66 54 68 54 70 L54 75.5 C54 78.5 50 80 48 78 L22 52 Z" fill="#ffffff"/>
      <circle cx="27" cy="43.5" r="4.5" fill="url(#kOrangeVert)" stroke="#09090b" stroke-width="2"/>
    </g>
  </g>
  <g transform="translate(180, 230)" text-anchor="middle">
    <text x="0" y="20" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="38" font-weight="900" letter-spacing="7" fill="#ffffff">KERIYO</text>
    <circle cx="96" cy="12" r="4.5" fill="#ff7828"/>
    <text x="0" y="48" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="4" fill="#a1a1aa">TACTILE &amp; SMART GADGETS</text>
    <text x="0" y="70" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="2" fill="#ff7828">EST. 2026 • GENUINE QUALITY</text>
  </g>
</svg>`,

  "sticker-round-seal.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" fill="none">
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
    <path id="circleTextPath" d="M 200, 200 m -140, 0 a 140,140 0 1,1 280,0 a 140,140 0 1,1 -280,0" />
  </defs>
  <circle cx="200" cy="200" r="196" fill="url(#sealDark)" stroke="#27272a" stroke-width="2"/>
  <circle cx="200" cy="200" r="182" stroke="#ff7828" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
  <circle cx="200" cy="200" r="172" stroke="#3f3f46" stroke-width="1"/>
  <text font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="4.5" fill="#e4e4e7">
    <textPath href="#circleTextPath" startOffset="50%" text-anchor="middle">
      ★ KERIYO SMART GEAR ★ AUTHENTIC EDC GADGETS
    </textPath>
  </text>
  <circle cx="200" cy="200" r="110" fill="#09090b" stroke="#27272a" stroke-width="2"/>
  <g transform="translate(160, 125)">
    <rect x="0" y="0" width="12" height="74" rx="6" fill="#ffffff"/>
    <path d="M23 37 L50 11 C52 9 57 10.5 57 13.5 L57 19.5 C57 21.5 56 23.5 54.5 25 L32.5 45.5 Z" fill="url(#sealOrange)"/>
    <path d="M23 37 L54.5 68.5 C56 70 57 72 57 74 L57 80 C57 83 52 84.5 50 82.5 L23 55.5 Z" fill="#ffffff"/>
    <circle cx="28.5" cy="46" r="4.5" fill="url(#sealOrange)" stroke="#09090b" stroke-width="2"/>
  </g>
  <text x="200" y="242" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="900" letter-spacing="4" fill="#ffffff" text-anchor="middle">KERIYO</text>
  <text x="200" y="260" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="800" letter-spacing="2" fill="#ff7828" text-anchor="middle">SEALED &amp; VERIFIED</text>
</svg>`,

  "sticker-box-seal-strip.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 90" width="100%" height="100%" fill="none">
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
  <rect x="0" y="0" width="8" height="90" fill="url(#stripOrange)" rx="2"/>
  <rect x="412" y="0" width="8" height="90" fill="url(#stripOrange)" rx="2"/>
  <g transform="translate(24, 20)">
    <rect width="50" height="50" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
    <g transform="translate(13, 10)">
      <rect x="0" y="0" width="5" height="30" rx="2.5" fill="#ffffff"/>
      <path d="M10 15 L21 4 C22 3 24 3.5 24 5 L24 8 C24 9 23.5 10 22.5 10.8 L13 19 Z" fill="#ff7828"/>
      <path d="M10 15 L22.5 27.5 C23.5 28.5 24 29.5 24 30.5 L24 33.5 C24 35 22 35.8 21 34.8 L10 23.8 Z" fill="#ffffff"/>
      <circle cx="12.5" cy="19" r="2.2" fill="#ff7828" stroke="#09090b" stroke-width="1"/>
    </g>
  </g>
  <g transform="translate(90, 24)">
    <text x="0" y="19" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#ffffff">KERIYO</text>
    <text x="85" y="19" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="800" letter-spacing="2" fill="#ff7828">SECURITY SEAL</text>
    <text x="0" y="38" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="0.8" fill="#a1a1aa">DO NOT ACCEPT IF THIS TAMPER TAPE IS BROKEN OR DAMAGED</text>
  </g>
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
</svg>`,

  "sticker-diecut-badge.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="dieCutGrad" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#27272a" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="308" height="168" rx="28" fill="url(#dieCutGrad)" stroke="#ff7828" stroke-width="2.5"/>
  <rect x="12" y="12" width="296" height="156" rx="22" stroke="#3f3f46" stroke-width="1" stroke-dasharray="5 3"/>
  <g transform="translate(35, 45)">
    <rect width="64" height="64" rx="18" fill="#09090b" stroke="#52525b" stroke-width="1.5"/>
    <g transform="translate(17, 13)">
      <rect x="0" y="0" width="6" height="38" rx="3" fill="#ffffff"/>
      <path d="M12 19 L26 5 C27.5 3.5 30 4.5 30 6.5 L30 9.5 C30 10.8 29.5 12 28.5 13 L17 24.5 Z" fill="#ff7828"/>
      <path d="M12 19 L28.5 35.5 C29.5 36.5 30 37.8 30 39 L30 42 C30 44 27.5 45 26 43.5 L12 29.5 Z" fill="#ffffff"/>
      <circle cx="15.5" cy="24" r="2.8" fill="#ff7828" stroke="#09090b" stroke-width="1.2"/>
    </g>
  </g>
  <g transform="translate(118, 55)">
    <text x="0" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="4" fill="#ffffff">KERIYO</text>
    <circle cx="140" cy="18" r="4" fill="#ff7828"/>
    <text x="1" y="44" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="2" fill="#d4d4d8">SMART EDC LABS</text>
    <text x="1" y="58" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="600" letter-spacing="1.2" fill="#ff7828">PRECISION MECHANICS</text>
  </g>
</svg>`,

  "product-box-cover-front.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%" fill="none">
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
  <rect width="500" height="700" rx="20" fill="url(#boxBg)"/>
  <rect x="20" y="20" width="460" height="660" rx="14" stroke="#27272a" stroke-width="1.5"/>
  <rect x="28" y="28" width="444" height="644" rx="10" stroke="#3f3f46" stroke-width="0.8" stroke-dasharray="4 4" opacity="0.4"/>
  <g transform="translate(50, 60)">
    <rect width="54" height="54" rx="16" fill="#09090b" stroke="#3f3f46" stroke-width="1.5"/>
    <g transform="translate(14, 11)">
      <rect x="0" y="0" width="5" height="32" rx="2.5" fill="#ffffff"/>
      <path d="M10 16 L22 4 C23.5 2.5 26 3.5 26 5.5 L26 8.5 C26 9.8 25.5 11 24.5 12 L14 21.5 Z" fill="url(#boxOrange)"/>
      <path d="M10 16 L24.5 30.5 C25.5 31.5 26 32.8 26 34 L26 37 C26 39 23.5 40 22 38.5 L10 26.5 Z" fill="#ffffff"/>
      <circle cx="13" cy="21" r="2.5" fill="url(#boxOrange)" stroke="#09090b" stroke-width="1"/>
    </g>
    <text x="70" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="4" fill="#ffffff">KERIYO</text>
    <circle cx="210" cy="24" r="4" fill="#ff7828"/>
    <text x="72" y="48" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="700" letter-spacing="3" fill="#a1a1aa">TACTILE SMART GEAR</text>
  </g>
  <g transform="translate(350, 65)">
    <rect width="95" height="24" rx="12" fill="#27272a" stroke="#3f3f46" stroke-width="1"/>
    <text x="47.5" y="15.5" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="800" letter-spacing="1.5" fill="#ff7828" text-anchor="middle">PREMIUM DROP</text>
  </g>
  <g transform="translate(75, 175)">
    <rect width="350" height="270" rx="24" fill="#09090b" stroke="#27272a" stroke-width="2"/>
    <circle cx="175" cy="135" r="100" stroke="#27272a" stroke-width="1" stroke-dasharray="4 6"/>
    <circle cx="175" cy="135" r="60" stroke="#3f3f46" stroke-width="0.8"/>
    <g transform="translate(130, 85)">
      <rect x="0" y="0" width="14" height="90" rx="7" fill="#ffffff"/>
      <path d="M28 45 L62 12 C64.5 9.5 70 11.5 70 15 L70 22 C70 25 68 27.5 66 29.5 L39 55 Z" fill="url(#boxOrange)"/>
      <path d="M28 45 L66 83 C68 85 70 87.5 70 90.5 L70 97.5 C70 101 64.5 103 62 100.5 L28 67 Z" fill="#ffffff"/>
      <circle cx="35" cy="56" r="6" fill="url(#boxOrange)" stroke="#09090b" stroke-width="2.5"/>
    </g>
    <text x="16" y="24" font-family="monospace" font-size="8" fill="#71717a">MODEL: KY-2026-X</text>
    <text x="334" y="24" font-family="monospace" font-size="8" fill="#71717a" text-anchor="end">EDC // TACTILE</text>
    <text x="16" y="254" font-family="monospace" font-size="8" fill="#71717a">ALLOY: CNC TITANIUM &amp; STEEL</text>
    <text x="334" y="254" font-family="monospace" font-size="8" fill="#ff7828" text-anchor="end">AUTHENTIC GRADE A</text>
  </g>
  <g transform="translate(50, 480)">
    <text x="0" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="1.5" fill="#ffffff">PRECISION EDC GADGET</text>
    <text x="0" y="50" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="600" fill="#a1a1aa">Engineered for Daily Tactile Focus &amp; Tech Utility</text>
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
  <g transform="translate(50, 625)">
    <line x1="0" y1="0" x2="400" y2="0" stroke="#27272a" stroke-width="1"/>
    <g transform="translate(0, 15)">
      <text x="0" y="14" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="800" letter-spacing="2" fill="#ffffff">KERIYO OFFICIAL PACKAGING</text>
      <text x="0" y="28" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" fill="#71717a">Designed in BD • Curated with Pride • All Rights Reserved</text>
    </g>
  </g>
</svg>`,

  "product-box-cover-back.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="backBg" x1="0" y1="0" x2="500" y2="700" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>
  <rect width="500" height="700" rx="20" fill="url(#backBg)"/>
  <rect x="20" y="20" width="460" height="660" rx="14" stroke="#27272a" stroke-width="1.5"/>
  <g transform="translate(50, 55)">
    <text x="0" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="24" font-weight="900" letter-spacing="3" fill="#ffffff">PRODUCT SPECIFICATIONS</text>
    <text x="0" y="42" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="2" fill="#ff7828">KERIYO QUALITY ASSURED</text>
    <line x1="0" y1="55" x2="400" y2="55" stroke="#27272a" stroke-width="1"/>
  </g>
  <g transform="translate(50, 135)">
    <g transform="translate(0, 0)">
      <rect width="400" height="42" rx="8" fill="#18181b"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Product Name</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="end">Keriyo EDC Tactical Gear / Gadget</text>
    </g>
    <g transform="translate(0, 50)">
      <rect width="400" height="42" rx="8" fill="#111113"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Brand / Origin</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ff7828" text-anchor="end">KERIYO (Bangladesh)</text>
    </g>
    <g transform="translate(0, 100)">
      <rect width="400" height="42" rx="8" fill="#18181b"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Material Construction</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="end">Precision Alloy / High-Grade Polymer</text>
    </g>
    <g transform="translate(0, 150)">
      <rect width="400" height="42" rx="8" fill="#111113"/>
      <text x="16" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#a1a1aa">Official Website</text>
      <text x="384" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#ff7828" text-anchor="end">keriyo.com</text>
    </g>
  </g>
  <g transform="translate(50, 360)">
    <rect width="400" height="110" rx="12" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
    <text x="20" y="30" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="800" fill="#ff7828">CUSTOMER CARE &amp; SUPPORT</text>
    <text x="20" y="55" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" fill="#d4d4d8">For warranty claims, inquiries, or replacement parts:</text>
    <text x="20" y="75" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" fill="#a1a1aa">WhatsApp / Phone: +880 1888 644558</text>
    <text x="20" y="93" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" fill="#a1a1aa">Founder &amp; Curation: Mahim Afridi</text>
  </g>
  <g transform="translate(250, 550)">
    <circle cx="0" cy="0" r="45" stroke="#ff7828" stroke-width="2" stroke-dasharray="6 3"/>
    <circle cx="0" cy="0" r="38" stroke="#ff7828" stroke-width="1"/>
    <text x="0" y="-8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="900" letter-spacing="2" fill="#ff7828" text-anchor="middle">ORIGINAL</text>
    <text x="0" y="6" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="900" letter-spacing="3" fill="#ffffff" text-anchor="middle">KERIYO</text>
    <text x="0" y="18" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="6.5" font-weight="800" letter-spacing="1.5" fill="#ff7828" text-anchor="middle">100% GENUINE</text>
  </g>
</svg>`
};

const BrandAssets = () => {
  const [copiedKey, setCopiedKey] = useState(null);

  const assets = [
    {
      id: "logo-horizontal-dark.svg",
      title: "Horizontal Logo (Dark Background)",
      desc: "For black boxes, dark packaging, and digital dark mode",
      bg: "bg-black",
      category: "Logos"
    },
    {
      id: "logo-horizontal-light.svg",
      title: "Horizontal Logo (Light / White Background)",
      desc: "For invoices, cash memos, delivery slips, and white paper",
      bg: "bg-white",
      category: "Logos"
    },
    {
      id: "logo-vertical-centered.svg",
      title: "Vertical Stacked Logo (Centered)",
      desc: "For box tops, t-shirts, hoodies, and social media profile icons",
      bg: "bg-zinc-950",
      category: "Logos"
    },
    {
      id: "sticker-round-seal.svg",
      title: "Round Packaging Seal Sticker",
      desc: "Circular seal sticker for box lids, tissue paper and product packaging",
      bg: "bg-zinc-950",
      category: "Stickers"
    },
    {
      id: "sticker-box-seal-strip.svg",
      title: "Tamper Box Seal Strip",
      desc: "Security tape strip with barcode to seal box openings",
      bg: "bg-zinc-950",
      category: "Stickers"
    },
    {
      id: "sticker-diecut-badge.svg",
      title: "Tactile Die-Cut Badge Sticker",
      desc: "Swag giveaway sticker for laptops, phone backs, and EDC gear",
      bg: "bg-zinc-950",
      category: "Stickers"
    },
    {
      id: "product-box-cover-front.svg",
      title: "Retail Box Front Cover Design",
      desc: "Blueprint aesthetic box front face with specs and authentic label",
      bg: "bg-zinc-950",
      category: "Packaging Box Covers"
    },
    {
      id: "product-box-cover-back.svg",
      title: "Retail Box Back Specs & Warranty Cover",
      desc: "Specifications table, warranty notice, customer support and security stamp",
      bg: "bg-zinc-950",
      category: "Packaging Box Covers"
    }
  ];

  // Instant In-Browser Blob Download (100% works, no network call or server 403)
  const downloadInstantSvg = (filename) => {
    const svgContent = VECTORS[filename];
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Raw SVG Code to Clipboard (for pasting directly into Figma/Illustrator)
  const copySvgCode = (filename) => {
    const svgContent = VECTORS[filename];
    if (!svgContent) return;
    navigator.clipboard.writeText(svgContent);
    setCopiedKey(filename);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="py-8 sm:py-12 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 mb-8 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
          KERIYO BRANDING &amp; PACKAGING KIT
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 mb-2">
          Official Brand Assets, Stickers &amp; Packaging Covers
        </h1>
        <p className="text-zinc-600 text-sm max-w-2xl leading-relaxed">
          নিচের প্রতিটি ফাইল সম্পূর্ণ ভেক্টর (SVG) ফরম্যাটে তৈরি। আপনি সরাসরি <strong>Download SVG</strong> বাটনে ক্লিক করে সাথে সাথে আপনার ডিভাইসে সেভ করতে পারেন অথবা <strong>Copy SVG</strong> করে Figma/Illustrator-এ পেস্ট করতে পারেন। কোনো সার্ভার বা লিঙ্কের উপর নির্ভরশীল নয়।
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {assets.map((item) => {
          const svgCode = VECTORS[item.id];
          return (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-zinc-800 text-orange-400 border border-zinc-700">
                    {item.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copySvgCode(item.id)}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-zinc-700"
                      title="Copy raw vector code"
                    >
                      {copiedKey === item.id ? '✓ Copied!' : 'Copy SVG'}
                    </button>
                    
                    <button
                      onClick={() => downloadInstantSvg(item.id)}
                      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download SVG
                    </button>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-400 mb-4">{item.desc}</p>
              </div>

              {/* Inline Vector Preview (100% Guaranteed rendering without network) */}
              <div 
                className={`rounded-xl p-4 sm:p-6 flex items-center justify-center border border-zinc-800 ${item.bg} min-h-[180px] max-h-[300px] overflow-hidden`}
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-mono text-zinc-400">{item.id}</span>
                <span className="text-orange-400/90 font-medium">100% Vector Scalable</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Note */}
      <div className="mt-12 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-sm text-zinc-700 leading-relaxed">
        <h4 className="font-bold text-zinc-900 text-base mb-2">🖨️ ব্যবহারের সহজ নিয়ম:</h4>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
          <li><strong>Download SVG</strong> বাটনে চাপ দিন—ফাইলটি সাথে সাথে আপনার মোবাইল বা কম্পিউটারের ডাউনলোড ফোল্ডারে সেভ হয়ে যাবে।</li>
          <li>ফাইলটি পেনড্রাইভে বা হোয়াটসঅ্যাপে পাঠিয়ে সরাসরি প্রিন্টিং প্রেসে (পল্টন/আরামবাগ বা লোকাল প্রেসে) দিন। তারা যে সাইজের বক্স চান (যেমন ৫" × ৭" ইত্যাদি), সে মাপে সরাসরি ডাই-কাট প্রিন্ট করে দিতে পারবে।</li>
          <li>এছাড়াও <strong>Copy SVG</strong> করে সরাসরি Figma বা Illustrator-এ পেস্ট করে ইচ্ছামতো যেকোনো ব্যানার বা সোশ্যাল মিডিয়া পোস্টে ব্যবহার করা যাবে।</li>
        </ul>
      </div>
    </div>
  );
};

export default BrandAssets;

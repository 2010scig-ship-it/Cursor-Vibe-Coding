function icon(id, label, color, markup) {
  return {
    id,
    label,
    color,
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">${markup}</svg>`,
  };
}

const stroke = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';

export const SYMBOLS = [
  icon(
    'crane',
    '학',
    '#c45c26',
    `<path ${stroke} d="M10 42c8-2 14-10 16-18 2 10 8 16 18 18"/>
     <path ${stroke} d="M26 24c6-8 14-12 22-12-4 6-6 12-6 18"/>
     <path ${stroke} d="M26 42v10M38 42v10"/>
     <circle cx="46" cy="14" r="1.8" fill="currentColor"/>`,
  ),
  icon(
    'tiger',
    '호랑이',
    '#b56a2b',
    `<ellipse cx="32" cy="34" rx="16" ry="14" ${stroke}/>
     <path ${stroke} d="M18 22l-4-10 12 6M46 22l4-10-12 6"/>
     <path ${stroke} d="M24 34h4M36 34h4M32 30v6"/>
     <path ${stroke} d="M26 42c4 3 8 3 12 0"/>
     <circle cx="24" cy="30" r="1.6" fill="currentColor"/>
     <circle cx="40" cy="30" r="1.6" fill="currentColor"/>`,
  ),
  icon(
    'fox',
    '여우',
    '#c2783a',
    `<path ${stroke} d="M16 40c2-14 10-20 16-20s14 6 16 20c-5 6-11 8-16 8s-11-2-16-8z"/>
     <path ${stroke} d="M18 22l8 8M46 22l-8 8"/>
     <path ${stroke} d="M28 42c2 2 6 2 8 0"/>
     <circle cx="26" cy="34" r="1.6" fill="currentColor"/>
     <circle cx="38" cy="34" r="1.6" fill="currentColor"/>`,
  ),
  icon(
    'fish',
    '물고기',
    '#3d7a73',
    `<path ${stroke} d="M12 32c8-12 32-12 40 0-8 12-32 12-40 0z"/>
     <path ${stroke} d="M52 32l8-8v16z"/>
     <circle cx="24" cy="30" r="1.8" fill="currentColor"/>
     <path ${stroke} d="M32 26v12"/>`,
  ),
  icon(
    'butterfly',
    '나비',
    '#7a4e6a',
    `<path ${stroke} d="M32 16v32"/>
     <path ${stroke} d="M32 28c-10-12-18-8-18 2 0 8 8 10 18 4 10 6 18 4 18-4 0-10-8-14-18-2z"/>
     <path ${stroke} d="M28 16h8"/>`,
  ),
  icon(
    'moon',
    '달',
    '#c4a35a',
    `<path ${stroke} d="M38 12a20 20 0 1 0 10 32 16 16 0 1 1-10-32z"/>`,
  ),
  icon(
    'sun',
    '해',
    '#c9a227',
    `<circle cx="32" cy="32" r="10" ${stroke}/>
     <path ${stroke} d="M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4.5 4.5M45.5 45.5 50 50M14 50l4.5-4.5M45.5 18.5 50 14"/>`,
  ),
  icon(
    'pine',
    '소나무',
    '#5a7a4a',
    `<path ${stroke} d="M32 10l14 16H18z"/>
     <path ${stroke} d="M32 20l16 16H16z"/>
     <path ${stroke} d="M32 32l18 16H14z"/>
     <path ${stroke} d="M32 48v8"/>`,
  ),
  icon(
    'lotus',
    '연꽃',
    '#a33b3b',
    `<path ${stroke} d="M32 48c8-2 16-10 18-20-8 4-14 4-18 0-4 4-10 4-18 0 2 10 10 18 18 20z"/>
     <path ${stroke} d="M32 48V26"/>
     <path ${stroke} d="M22 18c4 6 8 8 10 8 2 0 6-2 10-8-6 2-10 2-10 2s-4 0-10-2z"/>`,
  ),
  icon(
    'lantern',
    '등불',
    '#8b3a3a',
    `<path ${stroke} d="M32 8v8"/>
     <path ${stroke} d="M20 16h24"/>
     <path ${stroke} d="M22 16c-4 8-4 20 0 28h20c4-8 4-20 0-28z"/>
     <path ${stroke} d="M26 24h12M26 36h12"/>
     <path ${stroke} d="M28 44h8v6h-8z"/>`,
  ),
  icon(
    'mountain',
    '산',
    '#3d5a80',
    `<path ${stroke} d="M6 48l18-28 10 16 8-10 16 22z"/>
     <path ${stroke} d="M24 20l6 8 4-4"/>`,
  ),
  icon(
    'wave',
    '파도',
    '#3d6a8a',
    `<path ${stroke} d="M8 40c6-10 12-10 18 0s12 10 18 0 12-10 18 0"/>
     <path ${stroke} d="M8 28c6-10 12-10 18 0s12 10 18 0 12-10 18 0"/>
     <path ${stroke} d="M8 52c6-8 12-8 18 0s12 8 18 0 12-8 18 0"/>`,
  ),
];

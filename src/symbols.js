function icon(id, label, color, markup) {
  return {
    id,
    label,
    color,
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true">${markup}</svg>`,
  };
}

const stroke = 'fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"';

export const SYMBOLS = [
  icon(
    'crane',
    '학',
    '#c45c26',
    `<path ${stroke} d="M12 44c10-4 16-14 18-24 1 12 10 20 22 24"/>
     <path ${stroke} d="M30 20c8-10 16-12 22-12-6 8-8 16-8 22"/>
     <path ${stroke} d="M28 44v12M40 44v12"/>
     <circle cx="50" cy="10" r="2.2" fill="currentColor"/>`,
  ),
  icon(
    'star',
    '별',
    '#c9a227',
    `<path ${stroke} d="M32 8l6.2 12.6L52 22.4 42 32.2 44.4 46 32 39.4 19.6 46 22 32.2 12 22.4l13.8-1.8z"/>`,
  ),
  icon(
    'teapot',
    '찻주전자',
    '#8b3a3a',
    `<path ${stroke} d="M18 28h22c6 2 10 8 10 14H18c0-6 4-12 10-14z"/>
     <path ${stroke} d="M40 34c8 0 12-6 12-10"/>
     <path ${stroke} d="M28 20c0-4 8-4 8 0"/>
     <path ${stroke} d="M18 42h32"/>`,
  ),
  icon(
    'fish',
    '물고기',
    '#3d7a73',
    `<path ${stroke} d="M10 32c10-14 34-14 42 0-8 14-32 14-42 0z"/>
     <path ${stroke} d="M52 32l10-10v20z"/>
     <circle cx="22" cy="29" r="2" fill="currentColor"/>
     <path ${stroke} d="M32 24v16"/>`,
  ),
  icon(
    'butterfly',
    '나비',
    '#7a4e6a',
    `<path ${stroke} d="M32 14v36"/>
     <path ${stroke} d="M32 26C20 12 10 18 12 30c2 8 10 10 20 4 10 6 18 4 20-4 2-12-8-18-20-4z"/>
     <path ${stroke} d="M26 14h12"/>`,
  ),
  icon(
    'moon',
    '달',
    '#c4a35a',
    `<path ${stroke} d="M40 10a22 22 0 1 0 8 36 18 18 0 1 1-8-36z"/>`,
  ),
  icon(
    'sun',
    '해',
    '#c9a227',
    `<circle cx="32" cy="32" r="11" ${stroke}/>
     <path ${stroke} d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l5.5 5.5M45.5 45.5 51 51M13 51l5.5-5.5M45.5 18.5 51 13"/>`,
  ),
  icon(
    'pine',
    '소나무',
    '#5a7a4a',
    `<path ${stroke} d="M32 6l16 18H16z"/>
     <path ${stroke} d="M32 18l18 18H14z"/>
     <path ${stroke} d="M32 32l20 18H12z"/>
     <path ${stroke} d="M32 50v8"/>`,
  ),
  icon(
    'lotus',
    '연꽃',
    '#a33b3b',
    `<path ${stroke} d="M32 50c10-4 18-14 20-24-8 6-14 6-20 0-6 6-12 6-20 0 2 10 10 20 20 24z"/>
     <path ${stroke} d="M22 16c4 8 8 10 10 10s6-2 10-10c-6 3-10 3-10 3s-4 0-10-3z"/>
     <path ${stroke} d="M32 50V28"/>`,
  ),
  icon(
    'lantern',
    '등불',
    '#8b3a3a',
    `<path ${stroke} d="M32 6v8"/>
     <path ${stroke} d="M20 14h24"/>
     <path ${stroke} d="M22 14c-5 8-5 22 0 30h20c5-8 5-22 0-30z"/>
     <path ${stroke} d="M26 24h12M26 34h12"/>
     <path ${stroke} d="M28 44h8v10h-8z"/>`,
  ),
  icon(
    'mountain',
    '산',
    '#3d5a80',
    `<path ${stroke} d="M6 50L26 18l10 16 8-12 14 28z"/>
     <path ${stroke} d="M26 18l7 10 5-6"/>`,
  ),
  icon(
    'wave',
    '파도',
    '#3d6a8a',
    `<path ${stroke} d="M6 26c8-12 14-12 20 0s14 12 20 0 14-12 20 0"/>
     <path ${stroke} d="M6 40c8-12 14-12 20 0s14 12 20 0 14-12 20 0"/>
     <path ${stroke} d="M6 54c8-10 14-10 20 0s14 10 20 0 14-10 20 0"/>`,
  ),
];

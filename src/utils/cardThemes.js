/**
 * Curated Luxury Heirloom Card Color Themes
 * Designed for private romantic keepsake aesthetic.
 */

export const CARD_THEMES = [
  {
    id: 'parchment',
    name: 'Ivory Parchment',
    bg: '#fffdfa',
    border: 'rgba(119, 89, 40, 0.3)',
    text: '#2f020e',
    accent: '#775928',
    previewColor: '#fffdfa',
    isDark: false,
    badgeBg: 'bg-secondary-container/20 text-secondary',
  },
  {
    id: 'blush',
    name: 'Blush Rose',
    bg: '#fff5f7',
    border: '#f3cbd3',
    text: '#3b0d19',
    accent: '#a52d4b',
    previewColor: '#ffdbe3',
    isDark: false,
    badgeBg: 'bg-[#ffdbe3]/50 text-[#9b2242]',
  },
  {
    id: 'champagne',
    name: 'Champagne Gold',
    bg: '#fefcf3',
    border: '#fae3b4',
    text: '#362208',
    accent: '#9a6b18',
    previewColor: '#fde8b8',
    isDark: false,
    badgeBg: 'bg-[#fae3b4]/40 text-[#8a611c]',
  },
  {
    id: 'midnight',
    name: 'Midnight Velvet',
    bg: '#25060f',
    border: '#6b2034',
    text: '#fff6e9',
    accent: '#ffd79b',
    previewColor: '#25060f',
    isDark: true,
    badgeBg: 'bg-[#ffd79b]/20 text-[#ffd79b]',
  },
  {
    id: 'sage',
    name: 'Sage Whispers',
    bg: '#f4f8f5',
    border: '#cbe0d3',
    text: '#173322',
    accent: '#2f6c48',
    previewColor: '#d2e7d8',
    isDark: false,
    badgeBg: 'bg-[#d2e7d8]/50 text-[#245839]',
  },
  {
    id: 'twilight',
    name: 'Twilight Lilac',
    bg: '#f9f6fc',
    border: '#ded2f5',
    text: '#281745',
    accent: '#6b48ab',
    previewColor: '#e3d7fa',
    isDark: false,
    badgeBg: 'bg-[#e3d7fa]/50 text-[#593c8f]',
  },
  {
    id: 'ocean',
    name: 'Ocean Pearl',
    bg: '#f2f7fb',
    border: '#c5ddf0',
    text: '#12304d',
    accent: '#2b6599',
    previewColor: '#cde4f7',
    isDark: false,
    badgeBg: 'bg-[#cde4f7]/50 text-[#1c4d79]',
  },
];

export function getCardTheme(themeIdOrHex) {
  if (!themeIdOrHex) return CARD_THEMES[0];
  const found = CARD_THEMES.find(
    (t) => t.id === themeIdOrHex || t.bg.toLowerCase() === themeIdOrHex.toLowerCase()
  );
  if (found) return found;

  // If custom hex or rgb color string
  if (typeof themeIdOrHex === 'string' && (themeIdOrHex.startsWith('#') || themeIdOrHex.startsWith('rgb'))) {
    return {
      id: 'custom',
      name: 'Custom Tone',
      bg: themeIdOrHex,
      border: 'rgba(119, 89, 40, 0.3)',
      text: '#2f020e',
      accent: '#775928',
      previewColor: themeIdOrHex,
      isDark: false,
      badgeBg: 'bg-secondary-container/20 text-secondary',
    };
  }

  return CARD_THEMES[0];
}

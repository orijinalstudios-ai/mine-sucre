/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2f020e",
        "primary-container": "#4a1622",
        "primary-fixed": "#ffd9de",
        "primary-fixed-dim": "#ffb2bd",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#390916",
        "on-primary-fixed-variant": "#703440",
        "on-primary-container": "#c57a87",
        "inverse-primary": "#ffb2bd",

        "secondary": "#775928",
        "secondary-container": "#ffd79b",
        "secondary-fixed": "#ffdeae",
        "secondary-fixed-dim": "#e8c086",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#281800",
        "on-secondary-fixed-variant": "#5d4213",
        "on-secondary-container": "#7a5c2b",

        "surface": "#fdf9f3",
        "surface-dim": "#dddad4",
        "surface-bright": "#fdf9f3",
        "surface-variant": "#e6e2dc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7f3ed",
        "surface-container": "#f1ede7",
        "surface-container-high": "#ebe8e2",
        "surface-container-highest": "#e6e2dc",
        "on-surface": "#1c1c18",
        "on-surface-variant": "#524345",
        "outline": "#857375",
        "outline-variant": "#d7c1c3",

        "background": "#fdf9f3",
        "on-background": "#1c1c18",
        "tertiary": "#1b120e",
        "tertiary-container": "#312622",
        "tertiary-fixed": "#f2dfd7",
        "tertiary-fixed-dim": "#d5c3bc",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#9c8c86",
        "on-tertiary-fixed": "#231915",
        "on-tertiary-fixed-variant": "#51443f",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      keyframes: {
        barWave: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
        spinSlow: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'bar-wave-1': 'barWave 1.2s ease-in-out infinite',
        'bar-wave-2': 'barWave 0.8s ease-in-out infinite 0.2s',
        'bar-wave-3': 'barWave 1.5s ease-in-out infinite 0.4s',
        'bar-wave-4': 'barWave 1.0s ease-in-out infinite 0.1s',
        'bar-wave-5': 'barWave 1.3s ease-in-out infinite 0.3s',
        'spin-slow': 'spinSlow 12s linear infinite',
      }
    },
  },
  plugins: [],
}

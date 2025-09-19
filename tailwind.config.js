/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  // Add the presets line below
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      height: {
        '30': '120px', // Custom height for image container
      },
      colors: {
        // Primary colors - Warm Stone/Gray palette
        primary: {
          50: '#FAFAF9',   // Very light stone (stone-50)
          100: '#F5F5F4',  // Light stone (stone-100) 
          200: '#E7E5E4',  // Lighter stone (stone-200)
          300: '#D6D3D1',  // Light stone (stone-300)
          400: '#A8A29E',  // Stone (stone-400)
          500: '#78716C',  // Medium stone (stone-500)
          600: '#57534E',  // Dark stone (stone-600)
          700: '#44403C',  // Darker stone (stone-700)
          800: '#292524',  // Very dark stone (stone-800)
          900: '#1C1917',  // Deepest stone (stone-900)
        },
        // Secondary colors - Warm Amber palette (main accent)
        secondary: {
          50: '#FFFBEB',   // Very light amber (amber-50)
          100: '#FEF3C7',  // Light amber (amber-100)
          200: '#FDE68A',  // Lighter amber (amber-200)
          300: '#FCD34D',  // Light amber (amber-300)
          400: '#FBBF24',  // Amber (amber-400)
          500: '#F59E0B',  // Main amber (amber-500)
          600: '#D97706',  // Darker amber (amber-600)
          700: '#B45309',  // Dark amber (amber-700) - used in HomeScreen
          800: '#92400E',  // Very dark amber (amber-800)
          900: '#78350F',  // Deepest amber (amber-900)
        },
        // Accent colors - Warm complementary colors
        accent: {
          50: '#FDF2F8',   // Very light rose
          100: '#FCE7F3',  // Light rose
          200: '#FBCFE8',  // Lighter rose
          300: '#F9A8D4',  // Light rose
          400: '#F472B6',  // Rose
          500: '#EC4899',  // Main rose
          600: '#DB2777',  // Darker rose
          700: '#BE185D',  // Dark rose
          800: '#9D174D',  // Very dark rose
          900: '#831843',  // Deepest rose
        },
        // Neutral colors - Cool grays for contrast
        neutral: {
          50: '#F8FAFC',   // Very light slate
          100: '#F1F5F9',  // Light slate
          200: '#E2E8F0',  // Lighter slate
          300: '#CBD5E1',  // Light slate
          400: '#94A3B8',  // Slate
          500: '#64748B',  // Medium slate
          600: '#475569',  // Dark slate
          700: '#334155',  // Darker slate
          800: '#1E293B',  // Very dark slate
          900: '#0F172A',  // Deepest slate
        },
        // Status colors - matching your existing theme
        danger: '#EF4444',    // Red-500 for errors
        success: '#10B981',   // Emerald-500 for success
        warning: '#F59E0B',   // Amber-500 for warnings
        info: '#3B82F6',      // Blue-500 for info
        
        // Custom utility colors from your existing config
        'gray-light': '#F8FAFC',  // Same as neutral-50
        'gray-border': '#E2E8F0', // Same as neutral-200
      },
    },
  },
  plugins: [],
};

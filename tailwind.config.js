// tailwind.config.js

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
        primary: '#007AFF',
        danger: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        'gray-light': '#F2F7FF',
        'gray-border': '#E5E5EA',
      },
    },
  },
  plugins: [],
};
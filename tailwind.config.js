/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '10%': { opacity: '0' },
          '20%': { opacity: '0' },
          '30%': { opacity: '0' },
          '40%': { opacity: '0' },
          '50%': { opacity: '0' },
          '60%': { opacity: '0' },
          '70%': { opacity: '0' },
          '80%': { opacity: '0' },
          '90%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        typewriter: {
          to: {
            left: '100%',
          },
        },
        blink: {
          '0%': {
            opacity: '0',
          },
          '0.1%': {
            opacity: '1',
          },
          '50%': {
            opacity: '1',
          },
          '50.1%': {
            opacity: '0',
          },
          '100%': {
            opacity: '0',
          },
          goDown: {
            '0%': { transform: 'translateY(0px)' },
            '10%': { transform: 'translateY(0px)' },
            '20%': { transform: 'translateY(0px)' },
            '30%': { transform: 'translateY(0px)' },
            '40%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(0px)' },
            '60%': { transform: 'translateY(0px)' },
            '70%': { transform: 'translateY(0px)' },
            '80%': { transform: 'translateY(0px)' },
            '90%': { transform: 'translateY(0px)' },
            '100%': { transform: 'translateY(-25%)' }
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-out',
        typewriter: 'typewriter 1.5s steps(10) forwards',
        caret: 'typewriter 1.5s steps(10) forwards, blink 1s steps(7) infinite 2s',
        goDown: 'goDown 1s'
      },
    },
  },
  plugins: [require("daisyui")],
};

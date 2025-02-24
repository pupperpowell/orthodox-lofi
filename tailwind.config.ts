import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        triodion: ['Triodion', 'serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Triodion', 'serif'], // Default font
      },
      textColor: {
        description: '#6B7280', // Gray-500
      },
    },
  },
} satisfies Config;

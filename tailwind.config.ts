import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        triodion: ["Triodion", "serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
} satisfies Config;

import { type Config } from "tailwindcss";
import daisyui from "daisyui";

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
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ["light", "dark"], // You can customize themes here
  },
} satisfies Config;

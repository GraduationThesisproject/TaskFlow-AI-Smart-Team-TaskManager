import type { Config } from 'tailwindcss';

export default {
  presets: [require('@taskflow/config/tailwind.config.js')],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
} satisfies Config;

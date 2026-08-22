// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://airclub-udesa.github.io',
  base: '/jar_site',
  markdown: {
    shikiConfig: {
      theme: 'material-theme-darker',
    },
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import callouts from './src/markdown/callouts.mjs';
import tableScroll from './src/markdown/table-scroll.mjs';

export default defineConfig({
  site: 'https://airclub-udesa.github.io',
  base: '/jar_site',
  markdown: {
    processor: satteri({
      mdastPlugins: [callouts],
      hastPlugins: [tableScroll],
    }),
    shikiConfig: {
      theme: 'vesper',
    },
  },
});

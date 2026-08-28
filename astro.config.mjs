// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import callouts from './src/markdown/callouts.mjs';

const site = 'https://airclub-udesa.github.io';
const base = '/jar_site';
const rootWithoutTrailingSlash = new URL(base, site).href;

export default defineConfig({
  site,
  base,
  integrations: [sitemap({ filter: (page) => page !== rootWithoutTrailingSlash })],
  markdown: {
    processor: satteri({ mdastPlugins: [callouts] }),
    shikiConfig: {
      theme: 'vesper',
    },
  },
});

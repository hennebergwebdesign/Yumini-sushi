import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// Statische Seiten, dazu Serverrouten (src/pages/api, prerender = false) als Cloudflare Worker mit Assets.
export default defineConfig({
  adapter: cloudflare(),
  site: 'https://www.yumini.de',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (p) => !/\/(team|reservierung|impressum|datenschutz|404)\//.test(p) })],
});

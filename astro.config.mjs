import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.yumini.de',
  trailingSlash: 'always',
  build: { format: 'directory' },
});

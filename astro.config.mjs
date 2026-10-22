import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://mecanicagauchodiesel.com.br',
  security: { checkOrigin: true },
  integrations: [sitemap({ filter: (page) => !page.includes('/painel') && !page.includes('/solicitar/enviada') })],
  vite: {
    plugins: [tailwindcss()],
  },
});

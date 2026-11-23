// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// Meant for GitHub Pages as a project site: https://mihaigociu.github.io/trigonometry/
// If it moves to another repo or a domain, only `site` and `base` change.
export default defineConfig({
  site: 'https://mihaigociu.github.io',
  base: '/trigonometry',
  trailingSlash: 'always',
  integrations: [svelte()],
});

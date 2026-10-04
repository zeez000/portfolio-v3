import { defineConfig } from 'vite';
export default defineConfig({ base: process.env.BASE || '/', build: { target: 'es2020' } });

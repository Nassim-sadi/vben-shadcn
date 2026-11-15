import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      build: {
        outDir: 'dist/client',
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mesManagerAPI (.NET) dev server
            target: 'http://localhost:5094/api',
            ws: true,
          },
        },
      },
    },
  };
});

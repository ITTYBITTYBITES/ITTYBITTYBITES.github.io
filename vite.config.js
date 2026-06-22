import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'website/assets',
    emptyOutDir: false,
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'kernel-home.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'kernel-home.js',
        chunkFileNames: 'kernel-home-[name].js',
        assetFileNames: 'kernel-home-[name][extname]',
      },
    },
  },
});

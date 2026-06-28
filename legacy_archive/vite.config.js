import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'website/assets',
    emptyOutDir: false,
    lib: {
      entry: {
        'kernel-home': 'src/main.ts',
        'kernel-chamber': 'src/chamber.ts'
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'kernel-chunk-[name].js',
        assetFileNames: 'kernel-asset-[name][extname]',
      },
    },
  },
});

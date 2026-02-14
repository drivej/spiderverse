import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    lib: {
      entry: './src/index.ts',
      name: 'SpiderVerse',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'three', '@drivej/xrworld', 'gsap', 'usehooks-ts'],
      output: {
        preserveModules: false,
        assetFileNames: 'assets/[name][extname]',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          three: 'THREE',
          gsap: 'gsap'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    copyPublicDir: false
  },
  assetsInclude: ['**/*.jpg', '**/*.png']
});

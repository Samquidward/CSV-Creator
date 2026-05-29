import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-manifest-and-engine',
      closeBundle() {
        // Copy manifest.json directly into output distribution build folder
        fs.copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'build/manifest.json'));
        // Copy engine.js natively into distribution assets target area
        fs.mkdirSync(resolve(__dirname, 'build/src/content'), { recursive: true });
        fs.copyFileSync(resolve(__dirname, 'src/content/engine.js'), resolve(__dirname, 'build/src/content/engine.js'));
        console.log('✓ Extension distribution assets systematically compiled.');
      }
    }
  ],
  build: {
    outDir: 'build',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});

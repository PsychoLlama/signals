import { defineConfig } from 'vite';
import * as path from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: path.join(import.meta.dirname, './src/index.ts'),
      name: 'signals',
      fileName: 'signals',
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
      output: {
        exports: 'named',
      },
    },
  },
});

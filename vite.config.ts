import { defineConfig } from 'vite';
import * as path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: path.join(import.meta.dirname, './src/index.ts'),
      name: 'signals',
      fileName: 'signals',
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});

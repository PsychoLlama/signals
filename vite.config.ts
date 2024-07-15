import { defineConfig } from 'vite';
import * as path from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  pkg.name,
];

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: {
        signals: path.join(import.meta.dirname, './src/index.ts'),
        react: path.join(import.meta.dirname, './src/bindings/react/index.ts'),
      },
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named',
      },
    },
  },
});

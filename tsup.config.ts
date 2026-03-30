import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],

  format: ['esm'],
  target: 'es2023',

  outDir: 'dist',
  clean: true,
  sourcemap: true,

  bundle: true,
  splitting: false,
  skipNodeModulesBundle: true,

  minify: true,
  dts: false,
})

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: './dist',
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        exports: 'named',
      },
    },
    minify: false,
    lib: {
      entry: './src/form/index.tsx',
      formats: ['cjs', 'es'],
      fileName: 'index',
    },
  },
})

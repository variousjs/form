import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: './dist',
    rollupOptions: {
      external: ["react", "react-router-dom"],
    },
    minify: false,
    lib: {
      entry: './src/form/index.tsx',
      formats: ['cjs', 'es'],
      fileName: 'index',
    },
  },
})

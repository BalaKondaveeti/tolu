import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const built = new Date().toISOString().slice(0, 10)

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works under any GitHub Pages repo name.
  base: './',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(`${process.env.npm_package_version ?? '0.0.0'} · ${built}`),
  },
})

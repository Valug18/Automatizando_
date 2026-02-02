import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Dejar base vacío o con './' hace que los paths sean relativos.
  // Esto soluciona el problema de pantalla gris si el nombre del repo no coincide exactamente.
  base: '', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false
  }
})
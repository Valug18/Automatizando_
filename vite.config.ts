import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Asegúrate de que este nombre coincida EXACTAMENTE con el nombre de tu repositorio en GitHub.
  // Si tu repo es https://usuario.github.io/mi-repo/, entonces base debe ser '/mi-repo/'.
  base: "/Automatizando_/", 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false
  }
})
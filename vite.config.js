import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',      // куда складывать файлы сборки
        emptyOutDir: true,   // очищает dist перед новой сборкой
    },
<<<<<<< HEAD
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    }
=======
>>>>>>> 6928c1d720d677bf28edd5ba142d166a01cccb39
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const useHttps = process.env.VITE_DEV_HTTPS === 'true'

export default defineConfig({
  plugins: useHttps ? [react(), basicSsl()] : [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    https: useHttps,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/SoftwareDistribution/**']
    }
  }
})
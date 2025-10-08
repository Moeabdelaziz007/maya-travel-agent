import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
    },
    // Allow all hosts for Gitpod
    allowedHosts: ['all'],
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'import.meta.env': {
      VITE_SUPABASE_URL: JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'),
      VITE_SUPABASE_ANON_KEY: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'),
      VITE_APP_NAME: JSON.stringify(process.env.VITE_APP_NAME || 'Maya Trips'),
      VITE_APP_VERSION: JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0'),
      VITE_ENVIRONMENT: JSON.stringify(process.env.VITE_ENVIRONMENT || 'development'),
    }
  }
})

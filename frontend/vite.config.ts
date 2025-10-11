import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/bundle-analysis.html'
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hook-form'],
          'auth-vendor': ['@supabase/supabase-js'],
          'telegram-vendor': ['@twa-dev/sdk'],
          'utils-vendor': ['date-fns', 'axios', 'zustand']
        }
      }
    },
    // Enable tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      'axios',
      'zustand',
      'date-fns'
    ]
  }
})

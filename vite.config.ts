import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const API_URL = process.env.VITE_API_URL || 'http://mazadpalestine.runasp.net';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    proxy: {
      '/Auth': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Auth/, '/Auth')
      },
      '/Payment': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Payment/, '/Payment')
      },
      '/Transaction': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Transaction/, '/Transaction')
      },
      '/Notification': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Notification/, '/Notification'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/User': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/User/, '/User')
      },
      '/Support': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Support/, '/Support'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ensure Authorization header is allowed
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/Category': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/Message': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Message/, '/Message')
      },
      '/Listing': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Listing/, '/Listing')
      },
      '/Auction': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Auction/, '/Auction')
      },
      '/Bid': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Bid/, '/Bid')
      },
      '/Review': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Review/, '/Review')
      },
      '/Wishlist': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Wishlist/, '/Wishlist')
      },
      '/Report': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Report/, '/Report')
      },
      '/Dispute': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Dispute/, '/Dispute')
      },
      '/LaptopPrediction': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/CarPrediction': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/PhonePrediction': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/Image': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Image/, '/Image'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/Image/': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/auth': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/auth')
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
  },
  logLevel: 'error',
  clearScreen: false,
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      }
    }
  }
}));

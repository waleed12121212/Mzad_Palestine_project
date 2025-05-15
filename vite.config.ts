import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    proxy: {
      '/Auth': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Auth/, '/Auth')
      },
      '/Payment': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Payment/, '/Payment')
      },
      '/Transaction': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Transaction/, '/Transaction')
      },
      '/Notification': {
        target: 'http://mazadpalestine.runasp.net',
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
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/User/, '/User')
      },
      '/Support': {
        target: 'http://mazadpalestine.runasp.net',
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
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/Message': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Message/, '/Message')
      },
      '/Listing': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Listing/, '/Listing')
      },
      '/Auction': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Auction/, '/Auction')
      },
      '/Bid': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Bid/, '/Bid')
      },
      '/Review': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Review/, '/Review')
      },
      '/Wishlist': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Wishlist/, '/Wishlist')
      },
      '/Report': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Report/, '/Report')
      },
      '/Dispute': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Dispute/, '/Dispute')
      },
      '/LaptopPrediction': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/CarPrediction': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/PhonePrediction': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/Image': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Copy authorization header
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }

            // Set content type for multipart/form-data
            if (req.headers['content-type']?.includes('multipart/form-data')) {
              const contentType = req.headers['content-type'];
              proxyReq.setHeader('Content-Type', contentType);
            }
          });
        }
      },
      '/Image/': {
        target: 'http://mazadpalestine.runasp.net',
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
    'import.meta.env.VITE_API_URL': JSON.stringify('http://mazadpalestine.runasp.net'),
  },
}));

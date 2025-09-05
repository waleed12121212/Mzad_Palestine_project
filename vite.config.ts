import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const API_URL = process.env.VITE_API_URL || 'https://mazadpalestine.runasp.net';

// Add base URL configuration for production
const base = process.env.NODE_ENV === 'production' ? '/' : '/';

export default defineConfig(({ mode }) => ({
  base,
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
        rewrite: (path) => path.replace(/^\/LaptopPrediction/, '/LaptopPrediction'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', API_URL);
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/CarPrediction': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/CarPrediction/, '/CarPrediction'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', API_URL);
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/Phone': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Phone/, '/Phone'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', API_URL);
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
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
      },
      '/NewService': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/NewService/, '/NewService'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/NewService/images': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/NewService\/images/, '/NewService/images'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/NewServiceCategory': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/NewServiceCategory/, '/NewServiceCategory'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        }
      },
      '/job': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/job/, '/job'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove CORS headers from original request
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            
            // Set new headers
            proxyReq.setHeader('Origin', API_URL);
            proxyReq.setHeader('Host', new URL(API_URL).host);
            
            // Handle authorization token
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });

          // Handle response
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Add CORS headers to response
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
            proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range';
            proxyRes.headers['Access-Control-Max-Age'] = '86400'; // 24 hours
            
            // Handle OPTIONS requests
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.end();
              return;
            }
          });
        }
      },
      '/JobCategory': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/JobCategory/, '/JobCategory'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // إزالة رؤوس CORS من الطلب الأصلي
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            
            // إضافة رؤوس جديدة
            proxyReq.setHeader('Origin', API_URL);
            proxyReq.setHeader('Host', new URL(API_URL).host);
            
            // معالجة التوكن
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });

          // معالجة الاستجابة
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // إضافة رؤوس CORS للاستجابة
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:8081';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            
            // معالجة طلبات OPTIONS
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.end();
            }
          });
        }
      },
      '/Search': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Searchy/, '/Search'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // إزالة رؤوس CORS من الطلب الأصلي
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            
            // إضافة رؤوس جديدة
            proxyReq.setHeader('Origin', API_URL);
            proxyReq.setHeader('Host', new URL(API_URL).host);
            
            // معالجة التوكن
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });

          // معالجة الاستجابة
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // إضافة رؤوس CORS للاستجابة
            proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:8081';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            
            // معالجة طلبات OPTIONS
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.end();
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
    'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
  },
  logLevel: 'info',
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
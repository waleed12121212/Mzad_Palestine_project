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
      '/User': {
        target: 'http://mazadpalestine.runasp.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/User/, '/User')
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
        rewrite: (path) => path.replace(/^\/Bid/, '/Bid'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
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
}));

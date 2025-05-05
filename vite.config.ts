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
        ws: true,
        headers: {
          'Origin': 'http://mazadpalestine.runasp.net'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy Error:', {
              message: err.message,
              stack: err.stack,
              code: err.code
            });
            
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({ 
                error: 'Proxy Error', 
                message: err.message,
                code: err.code
              }));
            }
          });
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Set the correct origin
            proxyReq.setHeader('Origin', 'http://mazadpalestine.runasp.net');
            proxyReq.setHeader('Host', 'mazadpalestine.runasp.net');

            console.log('Proxying request:', {
              url: req.url,
              method: req.method,
              headers: proxyReq.getHeaders()
            });
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response:', {
              url: req.url,
              method: req.method,
              status: proxyRes.statusCode,
              headers: proxyRes.headers
            });
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
}));

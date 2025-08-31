const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Proxy requests to the backend
    if (pathname.startsWith('/prodweb/api/backend')) {
      const proxy = createProxyMiddleware({
        target: 'http://localhost/ProdBackend',
        changeOrigin: true,
        pathRewrite: { '^/prodweb/api/backend': '/api' },
      });
      proxy(req, res, parsedUrl);
    } else if (pathname.startsWith('/prodweb/api')) {
      // Handle Next.js API requests
      req.url = req.url.replace(/^\/prodweb/, '');
      handle(req, res, parsedUrl);
    } else {
      // Handle all other requests
      handle(req, res, parsedUrl);
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

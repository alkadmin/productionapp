/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //  basePath: '/prodweb',
  swcMinify: true,
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es'
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost/ProdBackendTest/api/:path*', // URL de tu backend
      },

      {
        source: '/api/:path*',
        destination: '/api/:path*' // Deja las rutas locales intactas
      },
    ];
  },
};

module.exports = nextConfig;

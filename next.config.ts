/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Enable source maps for SCSS/CSS in development
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Enable source maps for CSS/SCSS in development
      config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (
              oneOfRule.use &&
              Array.isArray(oneOfRule.use) &&
              oneOfRule.use.some((loader) =>
                typeof loader === 'object' &&
                loader.loader &&
                loader.loader.includes('css-loader')
              )
            ) {
              oneOfRule.use.forEach((loader) => {
                if (
                  typeof loader === 'object' &&
                  loader.loader &&
                  loader.loader.includes('css-loader')
                ) {
                  if (!loader.options) loader.options = {};
                  loader.options.sourceMap = true;
                }
                if (
                  typeof loader === 'object' &&
                  loader.loader &&
                  loader.loader.includes('sass-loader')
                ) {
                  if (!loader.options) loader.options = {};
                  loader.options.sourceMap = true;
                }
              });
            }
          });
        }
      });
    }
    return config;
  },
}

export default nextConfig
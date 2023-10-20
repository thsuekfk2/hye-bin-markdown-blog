const { withContentlayer } = require("next-contentlayer");

module.exports = withContentlayer({
  swcMinify: false,
  experimental: { appDir: true },
});

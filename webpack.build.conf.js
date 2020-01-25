/* Build config:
   ========================================================================== */

const baseWebpackConfig = require("./webpack.base.conf");

const buildWebpackConfig = merge(baseWebpackConfig, {
  output: {
    publicPath: './' 
  },
  mode: "production"
});

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig);
});

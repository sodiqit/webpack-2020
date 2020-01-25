const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;
const fileName = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./public")
};

const PAGES = fs
  .readdirSync(PATHS.src)
  .filter(fileName => fileName.endsWith(".html"));

const devServer = () => {
  return {
    contentBase: path.join(__dirname, `public`),
    host: `192.168.0.105`,
    port: 8082,
    compress: false,
    overlay: {
      warnings: true,
      errors: true
    }
  }
}

const optimization = () => {
  const config = {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: "vendors",
          test: /node_modules/,
          chunks: "all",
          enforce: true
        }
      }
    }
  }

  if (isProd) {

    config.minimize = true;

    config.minimizer = [
      new TerserPlugin()
    ]
  }

  return config;
};

module.exports = {
  externals: {
    paths: PATHS
  },
  entry: {
    app: PATHS.src
  },
  output: {
    filename: `js/${fileName("js")}`,
    path: PATHS.dist
  },
  devtool: isDev ? "cheap-module-eval-source-map" : false,
  devServer: isDev ? devServer() : {},
  optimization: optimization(),
  module: {
    rules: [
      {
        // JavaScript
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules/"
      },
       {
        // Fonts
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "./../fonts",
          outputPath: "./fonts"
        }
      },
      {
        // images / icons
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "./../img",
          outputPath: "./img"
        }
      },
      {
        // less
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          {
            loader: "css-loader",
            // options: { sourceMap: isDev }
          },
          {
            loader: "postcss-loader",
            options: {
              // sourceMap: isDev,
              config: { path: `./postcss.config.js` }
            }
          },
          "less-loader"
        ]
      }
    ]
  },
  resolve: {
    alias: {
      "~": PATHS.src
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `css/${fileName("css")}`
    }),
    new CopyWebpackPlugin([
      { from: `${PATHS.src}/img`, to: "img" },
      { from: `${PATHS.src}/fonts`, to: "fonts"}
    ]),

    ...PAGES.map(
      page =>
        new HtmlWebpackPlugin({
          template: `${PATHS.src}/${page}`,
          filename: `./${page}`
        })
    ),

    new CleanWebpackPlugin()
  ]
};

/*TODO: 

  Add imagemin webpack,
  convert to webp plugin,
  check soursemaps,
  add pug in bundle

*/
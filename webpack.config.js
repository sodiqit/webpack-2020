const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;
const fileName = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./public")
};

const devServer = () => {
  return {
    contentBase: path.join(__dirname, `public`),
    host: `192.168.0.108`,
    port: 8083,
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

const plugins = () => {

  const pluginConf = [
    new CleanWebpackPlugin(),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${PATHS.src}`,
          to: "img",
          globOptions: {
            ignore: ['**/*.woff', '**/*.woff2', '**/*.ico', '**/*.pug', '**/*.scss', '**/*.js', '**/*.ts', '**/*.xml']
          },
          flatten: true
        },
        {from: `${PATHS.src}/fonts`, to: 'fonts/'}
      ]
    }),

    new MiniCssExtractPlugin({
      filename: `css/${fileName("css")}`,
      allChunks: true
    }),

    new HtmlWebpackPlugin({
      template: `${path.join(__dirname, './src/pug/pages/index.pug')}`,
      filename: './index.html',
      // chunks: [`${page.replace(/\.pug/,'')}`, `vendors`]
    }),
  ]

  return pluginConf;
};



module.exports = {
  entry: {
    index: './src/index.ts'
  },
  output: {
    filename: `js/${fileName("js")}`,
    path: PATHS.dist
  },
  devtool: isDev ? "source-map" : false, //"cheap-module-eval-source-map" - not working
  devServer: isDev ? devServer() : {},
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        // JavaScript
        test: /\.ts$/,
        use: ["babel-loader", "ts-loader"],
        exclude: "/node_modules/"
      },
      {
        // Pug
        test: /\.pug$/,
        loader: "pug-loader",
        query: {
          pretty: true
        }
      },
      {
        // scss
        test: /\.scss$/,
        use : [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          {
            loader: "css-loader",
            options: { sourceMap: isDev }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: isDev,
              config: { path: `./postcss.config.js` }
            }
          },
          {
            loader: "group-css-media-queries-loader",
            options: { sourceMap: isDev }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDev
            }
          }
        ]
      },
      {
        // Fonts
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          publicPath: "./../fonts",
          outputPath: "./fonts/"
        }
      },
      {
        // images / icons
        test: /\.(png|jpg|gif|svg|webp)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: "[name].[ext]",
              publicPath: "./../img",
              outputPath: "./img"
            }
          }
        ],
      },
    ]
  },

  optimization: optimization(),

  plugins: plugins(),
};

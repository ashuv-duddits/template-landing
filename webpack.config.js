const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const env = process.env.NODE_ENV;

module.exports = {
  entry: {
    main: "./src/assets/scripts/main.js"
  },
  output: {
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },
  devtool: env === "development" ? "#eval-source-map" : ""
};

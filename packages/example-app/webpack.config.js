const webpack = require("webpack");
const path = require("path");
const AgilePackageWebpackPlugin = require("agile-package-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  optimization: { minimize: false },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.bundle.js/,
        use: "bundle-loader",
      },
      {
        test: /\.jsx?/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "jsx",
            target: "es2015",
          },
        },
      },
    ],
  },
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "dist/"),
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "example-lib-agile": ["script http://localhost:7000/static/example-lib.umd.js", "ExampleLib"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.ejs",
    }),
  ],
  devServer: {
    hot: false,
  },
  devtool: false,
  stats: { errorDetails: true },
};

module.exports = config;

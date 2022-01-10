const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const AgilePackageWebpackPlugin = require("agile-package-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const SharePlugin = require("webpack/lib/sharing/SharePlugin");
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
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.ejs",
    }),
    new AgilePackageWebpackPlugin({
      remotes: {
        "example-lib": "ExampleLib",
      },
      shared: {
        "eample-shared": {
          singleton: true,
          requiredVersion: "^1.0.0",
        },
      },
    }),
  ],
  devServer: {
    hot: false,
  },
  devtool: false,
  stats: { errorDetails: true },
};

module.exports = config;

const path = require("path");

const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const SidecarWebpackPlugin = require("sidecar-webpack-plugin");

/** @type {import('webpack').Configuration} */
const config = {
  optimization: { minimize: false },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(t|j)sx?/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "tsx",
            target: "es2015",
          },
        },
      },
    ],
  },
  output: {
    path: path.join(__dirname, "../cdn/static/foo-lib"),
  },
  devServer: {
    hot: false,
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  devtool: "source-map",
  stats: { errorDetails: true },
  plugins: [
    new SidecarWebpackPlugin({
      exposes: {
        ".": "./src/index.ts",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: ">=16.0.0",
        },
      },
    }),
  ],
};

module.exports = config;

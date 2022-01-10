const path = require("path");

const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const SharePlugin = require("webpack/lib/sharing/SharePlugin");

/** @type {import('webpack').Configuration} */
const config = {
  optimization: { minimize: false },
  mode: "development",
  module: {
    rules: [
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
  entry: "./entry.js",
  output: {
    // libraryTarget: "umd",
    // library: "ExampleLib",
    // filename: `${require("./package.json").name}.umd.js`,

    path: path.join(__dirname, "../cdn/static/example-lib"),
  },
  externals: {
    react: "React",
  },
  devServer: {
    hot: false,
  },
  devtool: "source-map",
  stats: { errorDetails: true },
  plugins: [
    new ModuleFederationPlugin({
      name: "ExampleLib",
      filename: "remoteEntry.js",
      exposes: {
        ".": "./entry.js",
      },
      shared: {
        "example-shared": {
          packageName: "example-shared",
          singleton: true,
          requiredVersion: "^1.0.0",
        },
      },
    }),

    new SharePlugin({
      shared: {
        "example-shared": {
          packageName: "example-shared",
          singleton: true,
          requiredVersion: "^1.0.0",
          eager: true
        },
      },
    }),
  ],
};

module.exports = config;

const path = require("path");

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
    libraryTarget: "umd",
    library: 'ExampleLib',
    filename: `${require("./package.json").name}.umd.js`,
    path: path.join(__dirname, "../cdn/static"),
  },
  devServer: {
    hot: false,
  },
  devtool: "source-map",
  stats: { errorDetails: true },
};

module.exports = config;

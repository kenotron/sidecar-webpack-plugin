const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const AgilePackageWebpackPlugin = require("agile-package-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const SharePlugin = require("webpack/lib/sharing/SharePlugin");
const VirtualModulePlugin = require("webpack-virtual-modules");

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
        test: /\.(j|t)sx?/,
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
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist/"),    
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  plugins: [
    new VirtualModulePlugin({
      'src/index.ts': 'import("./bootstrap");'
    }),
    new HtmlWebpackPlugin({
      template: "index.ejs",
    }),
    new AgilePackageWebpackPlugin({
      remotes: {
        "example-lib": "ExampleLib",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^17.0.0",
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

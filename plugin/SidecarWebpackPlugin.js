"use strict";

const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const NormalModule = require("webpack/lib/NormalModule");
const overridableExternalScriptSource = require("./overridableExternalScriptSource");
const path = require("path");
const fs = require("fs");

const PLUGIN_NAME = "SidecarWebpackPlugin";

function findPackageJson(context) {
  let packageJsonPath = context;
  const root = path.parse(packageJsonPath).root;

  do {
    if (fs.existsSync(path.join(packageJsonPath, "package.json"))) {
      return packageJsonPath;
    }
    packageJsonPath = path.dirname(packageJsonPath);
  } while (packageJsonPath !== root);
}

function generateGlobalFromPackageName(packageName) {
  return packageName.replace(/[^a-zA-Z0-9]/g, "_");
}

/** @typedef {import("webpack/lib/Compiler")} Compiler */
class SidecarWebpackPlugin {
  constructor(options) {
    options = options || {};
    this._options = options;
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const options = this._options;
    const functionAsStr = overridableExternalScriptSource.toString();
    const promiseExternalString = functionAsStr.substring(
      functionAsStr.indexOf("/* start */") + 11,
      functionAsStr.lastIndexOf("/* end */")
    );

    const getPromiseExternalStringForRemote = (remote, remoteGlobal) => {
      return promiseExternalString.replace(/\#\#REMOTE\#\#/g, remote).replace(/\#\#REMOTE_GLOBAL\#\#/g, remoteGlobal);
    };

    const remotes = {};

    // TODO: in future, we can generate a function that reference a AgileScriptLoaderRuntimeModule
    if (options.remotes) {
      for (const remote of options.remotes) {
        const remoteGlobal = generateGlobalFromPackageName(remote);
        remotes[`${remote}-sidecar`] = `promise ${getPromiseExternalStringForRemote(remote, remoteGlobal)}`;
      }

      const loader = path.resolve(__dirname, "sidecar-entry-loader.js");

      // attach a loader for all the exposed entry points
      compiler.hooks.compilation.tap(PLUGIN_NAME, (/** @type {import('webpack/lib/Compilation')} */ compilation) => {
        NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(PLUGIN_NAME, (loaderContext, module) => {
          for (const remote of Object.keys(options.remotes)) {
            const descriptionFileData = module.resourceResolveData.descriptionFileData;
            if (descriptionFileData?.main) {
              const normalizedRequest = module.userRequest.replace(/\\/g, "/");
              for (const mainField of compiler.options.resolve.mainFields || ["main"]) {
                if (normalizedRequest.includes(`${remote}/${descriptionFileData?.[mainField]}`)) {
                  module.loaders.push({
                    loader,
                    options: {
                      remote,
                    },
                  });
                }
              }
            }
          }
        });
      });
    }

    const packageJsonPath = findPackageJson(compiler.context);
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageJsonPath, "package.json"), "utf8"));
    const name = generateGlobalFromPackageName(packageJson.name);

    new ModuleFederationPlugin({
      name,
      filename: "remoteEntry.js",
      remotes,
      // TODO: make this a bit more automatic based on package.json exports
      exposes: options.exposes,
      // TODO: make this a bit more automatic based on deps / peerDeps
      shared: options.shared,
    }).apply(compiler);
  }
}

module.exports = SidecarWebpackPlugin;

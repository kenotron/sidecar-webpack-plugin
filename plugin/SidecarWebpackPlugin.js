"use strict";

const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
//const Compilation = require("webpack/lib/Compilation");
const NormalModule = require("webpack/lib/NormalModule");
const overridableExternalScriptSource = require("./overridableExternalScriptSource");
const path = require("path");

const PLUGIN_NAME = "AgilePackageWebpackPlugin";
const VirtualModulesPlugin = require("webpack-virtual-modules");

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
      for (const [remote, remoteGlobal] of Object.entries(options.remotes)) {
        remotes[`${remote}-sidecar`] = `promise ${getPromiseExternalStringForRemote(remote, remoteGlobal)}`;
      }
    }

    const shared = options.shared;

    const virtualModules = new VirtualModulesPlugin();
    virtualModules.apply(compiler);

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

    new ModuleFederationPlugin({
      name: `${options.name}-agile`,
      filename: "remoteEntry.js",
      remotes,
      shared,
    }).apply(compiler);
  }
}

module.exports = SidecarWebpackPlugin;

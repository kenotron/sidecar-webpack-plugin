"use strict";

const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const NormalModule = require("webpack/lib/NormalModule");
const PLUGIN_NAME = "AgilePackageWebpackPlugin";
const path = require("path");

/** @typedef {import("webpack/lib/Compiler")} Compiler */
function overridableExternalScriptSource() {
  /* start */
  new Promise((resolve) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAgile = urlParams.get("_agile") !== null && typeof urlParams.get("_agile") !== "undefined";

    if (isAgile) {
      // This part depends on how you plan on hosting and versioning your federated modules
      const agileMap = {};

      for (const script of document.scripts) {
        if (script.type === "agile") {
          Object.assign(agileMap, JSON.parse(script.textContent.trim()));
        }
      }

      const script = document.createElement("script");
      script.src = agileMap["##REMOTE##"];
      script.onload = () => {
        // the injected script has loaded and is available on window
        // we can now resolve this Promise
        const proxy = {
          get: (request) => {
            return window["##REMOTE_GLOBAL##"].get(request);
          },
          init: (arg) => {
            try {
              return window["##REMOTE_GLOBAL##"].init(arg);
            } catch (e) {
              console.log("remote container already initialized");
            }
          },
        };

        resolve(proxy);
      };

      // inject this script with the src set to the versioned remoteEntry.js
      document.head.appendChild(script);
    } else {
      const proxy = {
        get: (request) => {
          return Promise.resolve(() => true);
        },
        init: (arg) => {},
      };

      resolve(proxy);
    }
  });
  /* end */
}

class AgilePackageWebpackPlugin {
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
    for (const [remote, remoteGlobal] of Object.entries(options.remotes)) {
      remotes[`${remote}-agile`] = `promise ${getPromiseExternalStringForRemote(remote, remoteGlobal)}`;
    }

    const shared = options.shared;

    new ModuleFederationPlugin({ name: options.name, remotes, shared }).apply(compiler);

    const loader = path.resolve(__dirname, "agile-package-loader.js");

    // attach a loader for all the exposed entry points
    compiler.hooks.compilation.tap("asdfadsf", (/** @type {import('webpack/lib/Compilation')} */ compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap("asdfasdf", (loaderContext, module) => {
        for (const remote of Object.keys(options.remotes)) {
          if (module.userRequest.includes(`${remote}/index`)) {
            module.loaders.push({
              loader,
              options: {
                remote,
              },
            });
          }
        }
      });

      // normalModuleFactory.hooks.createModule.tap("asdfasdf", (createData, resolveData) => {
      //   if (createData.userRequest.includes("example-lib/index.js")) {
      //     createData.loaders.push({
      //       loader: path.resolve(__dirname, "AgilePackageEntryLoader.js"),
      //     });
      //   }
      // });
    });
  }
}

module.exports = AgilePackageWebpackPlugin;

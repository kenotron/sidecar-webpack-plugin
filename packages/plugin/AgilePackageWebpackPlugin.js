"use strict";

const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const ExternalsPlugin = require("webpack/lib/ExternalsPlugin");
const RuntimeGlobals = require("webpack/lib/RuntimeGlobals");

const { RawSource } = require("webpack-sources");

/** @typedef {import("webpack/lib/Compiler")} Compiler */

const PLUGIN_NAME = "AgilePackageWebpackPlugin";

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
          return Promise.resolve(() => __webpack_require__("##PACKAGED##"));
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
    const functionAsStr = overridableExternalScriptSource.toString();
    const promiseExternalString = functionAsStr.substring(
      functionAsStr.indexOf("/* start */") + 11,
      functionAsStr.lastIndexOf("/* end */")
    );
    const getPromiseExternalStringForRemote = (remote, remoteGlobal, pacakged) => {
      return promiseExternalString
        .replace(/\#\#REMOTE\#\#/g, remote)
        .replace(/\#\#REMOTE_GLOBAL\#\#/g, remoteGlobal)
        .replace(/\#\#PACKAGED\#\#/g, pacakged);
    };

    const remotes = {
      "example-lib-agile": `promise ${getPromiseExternalStringForRemote("example-lib", "ExampleLib", "example-lib")}`,
    };

    const shared = {
      "example-shared": {
        singleton: true,
        requiredVersion: "^1.0.0",
      },
    };

    new ModuleFederationPlugin({ name: "example-lib-agile", remotes, shared }).apply(compiler);

    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (/** @types {import('webpack').NormalModuleFactory} */ factory) => {
      factory.hooks.createModule.tap(PLUGIN_NAME, (mod, resolveData) => {
        if (mod.rawRequest === "example-lib") {
          console.log(mod, mod.type);
        }
      });
    });

    // add a dependency to the static version
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      const scriptExternalModules = [];

      // compilation.hooks.buildModule.tap(
      //   PLUGIN_NAME,

      //   (/** @type {import('webpack').Module} */ module) => {
      //     if (module.constructor.name === "ExternalModule" && module.externalType === "promise") {
      //       scriptExternalModules.push(module);

      //       module.issuer.issuer.addDependency(new )
      //     }
      //   }
      // );

      // compilation.hooks.afterCodeGeneration.tap(PLUGIN_NAME, function () {
      //   scriptExternalModules.map(module => {
      //     const urlTemplate = extractUrlAndGlobal(module.request)[0];
      //     const urlExpression = toExpression(urlTemplate);
      //     const sourceMap = compilation.codeGenerationResults.get(module).sources;
      //     const rawSource = sourceMap.get('javascript');
      //     sourceMap.set(
      //       'javascript',
      //       new RawSource(rawSource.source().replace(`"${urlTemplate}"`, urlExpression)),
      //     );
      //   });
      // });
    });
  }
}

module.exports = AgilePackageWebpackPlugin;

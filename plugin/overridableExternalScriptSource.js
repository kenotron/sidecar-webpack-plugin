/**
 * Dynamically loads a remote chunk or returns a dummy proxy that does nothing
 *
 * Two ways to specify the agile package map:
 * 1. via the URL query string, e.g. ?_sidecar={"remote1": "http://localhost:8080/remoteEntry.js"}
 * 2. via a script tag of type SCRIPT_TYPE, e.g. <script type="[SCRIPT_TYPE]">{"remote1": "http://localhost:8080/remoteEntry.js"}</script>
 *
 * NOTE: This function body is taken as a string and therefore should have no dependency in scope outside of itself
 */
module.exports = function overridableExternalScriptSource() {
  /* start */
  new Promise((resolve, reject) => {
    const SCRIPT_TYPE = "sidecar";
    const QUERY_PARAM_NAME = `_${SCRIPT_TYPE}`;
    const urlParams = new URLSearchParams(window.location.search);
    const isSidecarEnabled = urlParams.get(QUERY_PARAM_NAME) !== null && typeof urlParams.get(QUERY_PARAM_NAME) !== "undefined";
    const dummyProxy = {
      get() {
        return Promise.resolve(() => true);
      },
      init() {},
    };

    if (isSidecarEnabled) {
      let sidecarMap = {};

      if (typeof urlParams.get(QUERY_PARAM_NAME) === "string" && urlParams.get(QUERY_PARAM_NAME).length > 0) {
        sidecarMap = JSON.parse(urlParams.get(QUERY_PARAM_NAME));
      } else {
        for (const script of document.scripts) {
          if (script.type === SCRIPT_TYPE) {
            Object.assign(sidecarMap, JSON.parse(script.textContent.trim()));
          }
        }
      }

      const shouldLoadSideCar = Object.keys(sidecarMap).includes("##REMOTE##");

      if (shouldLoadSideCar) {
        const script = document.createElement("script");
        script.src = sidecarMap["##REMOTE##"];
        script.onload = () => {
          // the injected script has loaded and is available on window
          // we can now resolve this Promise
          const proxy = {
            get(request) {
              return window["##REMOTE_GLOBAL##"].get(request);
            },
            init(arg) {
              try {
                return window["##REMOTE_GLOBAL##"].init(arg);
              } catch (e) {
                console.warn("remote container already initialized");
              }
            },
          };

          script.onerror = () => {
            reject("remote container ##REMOTE## failed to load");
          }

          return resolve(proxy);
        };

        document.head.appendChild(script);
      } else {
        return resolve(dummyProxy);
      }
    } else {
      return resolve(dummyProxy);
    }
  });
  /* end */
};

/**
 * Dynamically loads a remote chunk or returns a dummy proxy that does nothing
 * 
 * NOTE: This function body is taken as a string and therefore should have no dependency in scope outside of itself
 */
module.exports = function overridableExternalScriptSource() {
  /* start */
  new Promise((resolve) => {
    const SCRIPT_TYPE = "sidecar";
    const QUERY_PARAM_NAME = `_${SCRIPT_TYPE}`;
    const urlParams = new URLSearchParams(window.location.search);
    const isSidecar = urlParams.get(QUERY_PARAM_NAME) !== null && typeof urlParams.get(QUERY_PARAM_NAME) !== "undefined";
    if (isSidecar) {
      let sidecarMap = {};

      /**
       * Two ways to specify the agile package map:
       * 1. via the URL query string, e.g. ?_sidecar={"remote1": "http://localhost:8080/remoteEntry.js"}
       * 2. via a script tag of type SCRIPT_TYPE, e.g. <script type="[SCRIPT_TYPE]">{"remote1": "http://localhost:8080/remoteEntry.js"}</script>
       */
      if (typeof urlParams.get(QUERY_PARAM_NAME) === "string" && urlParams.get(QUERY_PARAM_NAME).length > 0) {
        sidecarMap = JSON.parse(urlParams.get(QUERY_PARAM_NAME));
      } else {
        for (const script of document.scripts) {
          if (script.type === SCRIPT_TYPE) {
            Object.assign(sidecarMap, JSON.parse(script.textContent.trim()));
          }
        }
      }

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

        resolve(proxy);
      };

      // inject this script with the src set to the versioned remoteEntry.js
      document.head.appendChild(script);
    } else {
      const dummyProxy = {
        get() {
          // This is never called
          return Promise.resolve(() => true);
        },
        init() {
          // This is a dummy init function that get called when the remote container is needed
        },
      };

      resolve(dummyProxy);
    }
  });
  /* end */
};

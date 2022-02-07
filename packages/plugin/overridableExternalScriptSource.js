module.exports = function overridableExternalScriptSource() {
  /* start */
  new Promise((resolve) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAgile = urlParams.get("_agile") !== null && typeof urlParams.get("_agile") !== "undefined";
    if (isAgile) {
      let agileMap = {};

      /**
       * Two ways to specify the agile package map:
       * 1. via the URL query string, e.g. ?_agile={"remote1": "http://localhost:8080/remoteEntry.js"}
       * 2. via a script tag of type "agile", e.g. <script type="agile">{"remote1": "http://localhost:8080/remoteEntry.js"}</script>
       */
      if (typeof urlParams.get("_agile") === "string" && urlParams.get("_agile").length > 0) {
        agileMap = JSON.parse(urlParams.get("_agile"));
      } else {
        for (const script of document.scripts) {
          if (script.type === "agile") {
            Object.assign(agileMap, JSON.parse(script.textContent.trim()));
          }
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
        get: (request) => {
          // This is never called
          return Promise.resolve(() => true);
        },
        init: (arg) => {
          // This is a dummy init function that get called when the remote container is needed
        },
      };

      resolve(dummyProxy);
    }
  });
  /* end */
};

import React from "react";
import ReactDOM from "react-dom";

import { init } from "example-lib";

(async () => {
  const exampleLib = await init();
  console.log(exampleLib);
})();

const App = () => {
  return <div>hello</div>;
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

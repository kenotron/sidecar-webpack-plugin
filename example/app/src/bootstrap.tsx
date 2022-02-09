import React from "react";
import ReactDOM from "react-dom";

import { ExampleLibComponent, getName } from "example-lib";

const App = () => {
  return (
    <div>
      Shared React {React.version}
      <ExampleLibComponent />
      Hello {getName()}
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

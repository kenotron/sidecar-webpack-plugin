import React from "react";
import ReactDOM from "react-dom";

import { ExampleLibComponent, getName, all } from "example-lib";

const App = () => {
  return (
    <div>
      Shared React {React.version}
      <ExampleLibComponent />
      Hello {getName()}, {all.one()}, {all.two()}
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

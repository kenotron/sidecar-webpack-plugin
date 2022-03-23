import React from "react";
import ReactDOM from "react-dom";

import { ExampleLibComponent, getName, all } from "example-lib";
import { FooLibComponent } from "foo-lib";

const App = () => {
  return (
    <div>
      <section>
        <h1>Example Lib Section</h1>
        Shared React {React.version}
        <ExampleLibComponent />
        Hello {getName()}, {all.one()}, {all.two()}
      </section>
      <section>
        <h1>Foo Lib Section</h1>
        <FooLibComponent />
      </section>
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

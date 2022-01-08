import React from "react";
import ReactDOM from "react-dom";

import { init } from "example-lib";

const importer = async () => {
  const m = await import("example-lib");
  const exported = await m.init();
  return { default: exported.ExampleLibComponent };
};

const LazyExampleComponent = React.lazy(() => importer());

const App = () => {
  return (
    <div>
      hello
      <React.Suspense fallback={<div>loading</div>}>
        <LazyExampleComponent />
      </React.Suspense>
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

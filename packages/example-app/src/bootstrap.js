import React from "react";
import ReactDOM from "react-dom";
import { sharedValue } from "example-shared";

import 'example-lib';

const importer = async () => {
  const m = await import("example-lib-agile");
  return { default: m.ExampleLibComponent };
};

const LazyExampleComponent = React.lazy(() => importer());

const App = () => {
  return (
    <div>
      Shared {sharedValue} asd
      <React.Suspense fallback={<div>loading</div>}>
        <LazyExampleComponent />
      </React.Suspense>
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

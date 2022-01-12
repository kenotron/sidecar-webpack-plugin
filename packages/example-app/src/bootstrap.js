import React from "react";
import ReactDOM from "react-dom";

const importer = async () => {
  const m = await import("example-lib");
  return { default: m.ExampleLibComponent };
};

const LazyExampleComponent = React.lazy(() => importer());

const App = () => {
  return (
    <div>
      Shared React {React.version}
      <React.Suspense fallback={<div>loading</div>}>
        <LazyExampleComponent />
      </React.Suspense>
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);

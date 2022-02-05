function cjs(content) {
  const { remote } = this.getOptions();

  const newSources = `
// Step 1: change all exports to imports; these are the concrete implementations
const { getName }  = require("./getName");
const { ExampleLibComponent } = require("./ExampleLibComponent");

// Step 2: declare all imports into moduleExports as variables
let moduleExports = { getName, ExampleLibComponent };

// Step 3: if switchboard condition is met, export those as the implementations of the exports
const query = new URLSearchParams(window.location.search);
if (query.has("_agile")) {
  moduleExports = require("${remote}-agile");
}

module.exports = moduleExports;
`;
  return newSources;
}

function esm(content) {
  const { remote } = this.getOptions();

  const newSources = `
// Step 1: change all exports to imports; these are the concrete implementations
import { getName } from "./getName";
import { ExampleLibComponent } from "./ExampleLibComponent";

// Step 2: declare all imports into moduleExports as variables
let moduleExports = { getName, ExampleLibComponent };

// Step 3: if switchboard condition is met, export those as the implementations of the exports
const query = new URLSearchParams(window.location.search);
if (query.has("_agile")) {
  moduleExports = require("${remote}-agile");
}

export {getName, ExampleLibComponent};
`;
  return newSources;
}

module.exports = esm;

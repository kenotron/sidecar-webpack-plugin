module.exports = function (content) {
  const { remote } = this.getOptions();

  const newSources = `
  const query = new URLSearchParams(window.location.search);
  if (query.has('_agile')) {
    module.exports = require("${remote}-agile");
  } else {
    module.exports = require("./entry");
  }`;
  return newSources;
};

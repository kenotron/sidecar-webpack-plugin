export async function init() {
  // TODO: need a library to standardize this
  const override = window.location.search.includes("test");
  if (override) {
    return await import("example-lib-agile");
  } else {
    return await import("./entry");
  }
}

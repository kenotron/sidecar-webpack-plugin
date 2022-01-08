export async function init() {
  const override = window.location.search.includes("test");
  console.log(override);
  if (override) {
    return await import("example-lib-agile");
  } else {
    return await import("./entry");
  }
}

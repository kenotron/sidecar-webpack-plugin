module.exports.shouldUseAgile = function shouldUseAgile(searchParams) {
  const query = new URLSearchParams(searchParams);
  return query.has("_agile");
};

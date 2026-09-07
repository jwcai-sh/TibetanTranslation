(function exposeRouteUtils(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TibetanRouteUtils = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  function getCloudBookRoute(search) {
    const params = new URLSearchParams(search || "");
    const workflow = params.get("workflow");
    const bookId = (params.get("book_id") || "").trim();
    if (!bookId || (workflow !== "ocr" && workflow !== "translation")) return null;
    return { workflow, bookId };
  }

  return { getCloudBookRoute };
});

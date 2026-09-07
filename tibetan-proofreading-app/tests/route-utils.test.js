const assert = require("node:assert/strict");
const test = require("node:test");

const { getCloudBookRoute } = require("../route-utils.js");

test("getCloudBookRoute restores an OCR project from a book_id URL", () => {
  assert.deepEqual(
    getCloudBookRoute("?workflow=ocr&book_id=book-123"),
    { workflow: "ocr", bookId: "book-123" },
  );
});

test("getCloudBookRoute ignores URLs without a supported workflow", () => {
  assert.equal(getCloudBookRoute("?book_id=book-123"), null);
});

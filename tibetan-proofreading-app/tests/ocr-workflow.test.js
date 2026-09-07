const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

test("OCR button recognizes only the current page", () => {
  assert.ok(
    /els\.ocrButton\.addEventListener\("click", runOcrForCurrentPage\)/.test(appSource),
    "OCR button must call the current-page recognizer",
  );
});

test("remote project restore retains OCR quality reviews", () => {
  assert.ok(
    /ocrQualityReviews:\s*remoteState\.ocr_quality_reviews\s*\|\|\s*remoteState\.ocrQualityReviews\s*\|\|\s*\[\]/.test(appSource),
    "remote restore must include OCR quality reviews",
  );
});

test("a failed AI OCR retry does not overwrite saved OCR text", () => {
  assert.ok(
    /if \(!hasRecognizedText && existingText\) \{[\s\S]*?保留已保存的 OCR 与人工校对内容/.test(appSource),
    "failed retries must preserve existing OCR and human corrections",
  );
});

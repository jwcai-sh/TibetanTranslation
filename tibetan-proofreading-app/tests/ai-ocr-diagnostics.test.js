const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadCompareHelpers() {
  const appPath = path.join(__dirname, "..", "app.js");
  const source = `${fs.readFileSync(appPath, "utf8")}\nmodule.exports = { normalizeOcrCompare, getEffectiveOcrSideLines, makeProofreadAiLine, getSourceLineForRow };`;
  const context = {
    module: { exports: {} },
    window: { addEventListener() {} },
    document: {},
    URLSearchParams,
    console,
  };
  vm.runInNewContext(source, context, { filename: appPath });
  return context.module.exports;
}

test("normalizeOcrCompare preserves an AI Vision line error without text", () => {
  const { normalizeOcrCompare } = loadCompareHelpers();
  const compare = normalizeOcrCompare({
    llm: {
      label: "AI Vision",
      lines: [{ text: "", error: true, errorMessage: "AI Vision upstream HTTP 503" }],
    },
  });

  assert.ok(compare);
  assert.equal(compare.llm.lines[0].error, true);
  assert.equal(compare.llm.lines[0].errorMessage, "AI Vision upstream HTTP 503");
});

test("failed OCR lines retain their diagnostic and source coordinates through rendering", () => {
  const helpers = loadCompareHelpers();
  const bbox = { x: 0.1, y: 0.2, width: 0.7, height: 0.03 };
  const compare = helpers.normalizeOcrCompare({ llm: { lines: [{
    text: "", error: true, errorMessage: "AI Vision upstream HTTP 429",
    bbox, layoutVersion: "current-layout",
  }] } });
  const line = helpers.getEffectiveOcrSideLines(compare.llm)[0];
  const displayed = helpers.makeProofreadAiLine(compare, line, 0);
  assert.equal(displayed.text, "AI Vision upstream HTTP 429");
  assert.equal(displayed.diagnostic, true);
  assert.equal(displayed.layoutVersion, "current-layout");
  assert.equal(helpers.getSourceLineForRow(displayed).bbox.y, 0.2);
});

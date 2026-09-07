const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadCompareHelpers() {
  const appPath = path.join(__dirname, "..", "app.js");
  const source = `${fs.readFileSync(appPath, "utf8")}\nmodule.exports = { normalizeOcrCompare };`;
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

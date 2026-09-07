const assert = require("node:assert/strict");
const test = require("node:test");

const { detectTextLineBands } = require("../line-layout.js");

function makeImage(width, height, bands) {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
  for (const { x = 20, y, w = width - 40, h } of bands) {
    for (let row = y; row < y + h; row += 1) {
      for (let col = x; col < x + w; col += 1) {
        const offset = (row * width + col) * 4;
        pixels[offset] = 20;
        pixels[offset + 1] = 20;
        pixels[offset + 2] = 20;
      }
    }
  }
  return { width, height, data: pixels };
}

test("detectTextLineBands returns one normalized crop per separated text row", () => {
  const image = makeImage(1000, 800, [
    { y: 120, h: 24 },
    { y: 190, h: 28 },
    { y: 270, h: 26 },
  ]);

  const bands = detectTextLineBands(image);

  assert.equal(bands.length, 3);
  assert.deepEqual(bands.map((band) => band.index), [0, 1, 2]);
  assert.ok(bands.every((band) => band.bbox.height > 0 && band.bbox.height < 0.12));
  assert.ok(bands[0].bbox.y < bands[1].bbox.y);
  assert.ok(bands[1].bbox.y < bands[2].bbox.y);
});

test("detectTextLineBands ignores thin full-width page rules", () => {
  const image = makeImage(1000, 800, [
    { x: 40, y: 48, w: 920, h: 2 },
    { y: 180, h: 30 },
    { y: 260, h: 30 },
  ]);

  const bands = detectTextLineBands(image);

  assert.equal(bands.length, 2);
});

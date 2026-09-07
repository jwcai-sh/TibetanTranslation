(function exposeLineLayout(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TibetanLineLayout = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function isDarkPixel(data, offset, threshold) {
    const alpha = data[offset + 3];
    if (!alpha) return false;
    const luminance = data[offset] * 0.2126 + data[offset + 1] * 0.7152 + data[offset + 2] * 0.0722;
    return luminance < threshold;
  }

  function detectTextLineBands(image, options = {}) {
    const width = Number(image?.width) || 0;
    const height = Number(image?.height) || 0;
    const data = image?.data;
    if (!width || !height || !data?.length) return [];

    const darkThreshold = Number(options.darkThreshold) || 220;
    const minInkPerRow = Math.max(3, Math.round(width * (Number(options.minInkRatio) || 0.006)));
    const maxGap = Math.max(2, Math.round(height * (Number(options.maxGapRatio) || 0.01)));
    const minBandHeight = Math.max(5, Math.round(height * (Number(options.minBandHeightRatio) || 0.006)));
    const paddingY = Math.max(3, Math.round(height * (Number(options.paddingYRatio) || 0.008)));
    const paddingX = Math.max(8, Math.round(width * (Number(options.paddingXRatio) || 0.018)));
    const rows = [];

    for (let y = 0; y < height; y += 1) {
      let count = 0;
      for (let x = 0; x < width; x += 1) {
        if (isDarkPixel(data, (y * width + x) * 4, darkThreshold)) count += 1;
      }
      if (count >= minInkPerRow) rows.push(y);
    }

    const bands = [];
    for (const row of rows) {
      const previous = bands[bands.length - 1];
      if (previous && row - previous.lastRow <= maxGap) {
        previous.lastRow = row;
      } else {
        bands.push({ firstRow: row, lastRow: row });
      }
    }

    return bands
      .filter((band) => band.lastRow - band.firstRow + 1 >= minBandHeight)
      .map((band) => {
        let minX = width;
        let maxX = -1;
        for (let y = band.firstRow; y <= band.lastRow; y += 1) {
          for (let x = 0; x < width; x += 1) {
            if (!isDarkPixel(data, (y * width + x) * 4, darkThreshold)) continue;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
          }
        }
        if (maxX < minX) return null;
        const left = clamp(minX - paddingX, 0, width - 1);
        const top = clamp(band.firstRow - paddingY, 0, height - 1);
        const right = clamp(maxX + 1 + paddingX, left + 1, width);
        const bottom = clamp(band.lastRow + 1 + paddingY, top + 1, height);
        return {
          bbox: {
            x: left / width,
            y: top / height,
            width: (right - left) / width,
            height: (bottom - top) / height,
          },
        };
      })
      .filter(Boolean)
      .map((band, index) => ({ ...band, index }));
  }

  return { detectTextLineBands };
});

/**
 * Smart Auto-Cutout / Alpha Keyer for Virtual Try-On
 * Automatically eliminates opaque white/light rectangular boxes, photo frames,
 * and solid white studio backdrops, converting them into 100% transparent alpha PNG/WebP.
 * 
 * Protects clothing interior: starts BFS flood-fill strictly from perimeter pixels,
 * so white graphics, text, collars, and patterns inside the fabric remain untouched.
 */

export const transparencyCache = new Map<string, string>();

export interface RemoveBackgroundOptions {
  colorTolerance?: number; // Distance tolerance from average corner color (default: 28)
  luminanceThreshold?: number; // Minimum brightness to consider background (default: 212)
  saturationMax?: number; // Maximum color saturation difference (default: 30)
  feather?: boolean; // Smooth 1px anti-aliased edge softening (default: true)
  maxDimension?: number; // Max canvas dimension (default: 1024)
  normalizeScale?: boolean; // Automatically scales & centers garment into canonical fashion grid
  slot?: 'slot_top' | 'slot_bottom' | 'slot_outer' | 'slot_shoes' | string;
}

export function removeWhiteBackground(
  imageSource: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  if (!imageSource || imageSource.startsWith('data:image/svg')) {
    return Promise.resolve(imageSource);
  }

  // Instant in-memory cache lookup
  const cached = transparencyCache.get(imageSource);
  if (cached) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const {
          colorTolerance = 28,
          luminanceThreshold = 212,
          saturationMax = 30,
          feather = true,
          maxDimension = 1024,
        } = options;

        let w = img.width;
        let h = img.height;

        // Normalize size if exceeding maxDimension
        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          return resolve(imageSource);
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // 1. Inspect corner pixels: (0,0), (w-1,0), (0,h-1), (w-1,h-1)
        const corners = [
          0,
          (w - 1) * 4,
          ((h - 1) * w) * 4,
          ((h - 1) * w + (w - 1)) * 4,
        ];

        let transparentCornerCount = 0;
        let whiteCornerCount = 0;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;

        for (const idx of corners) {
          const a = data[idx + 3];
          if (a < 15) {
            transparentCornerCount++;
          } else {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const satDiff = Math.max(r, g, b) - Math.min(r, g, b);
            if (r >= luminanceThreshold && g >= luminanceThreshold && b >= luminanceThreshold && satDiff <= saturationMax) {
              whiteCornerCount++;
              rSum += r;
              gSum += g;
              bSum += b;
            }
          }
        }

        // Case A: Image already has transparent alpha corners -> clean PNG, do not modify
        if (transparentCornerCount >= 2 && whiteCornerCount === 0) {
          transparencyCache.set(imageSource, imageSource);
          return resolve(imageSource);
        }

        // Case B: No white/light corners detected -> Not a white box image, preserve as is
        if (whiteCornerCount < 2) {
          transparencyCache.set(imageSource, imageSource);
          return resolve(imageSource);
        }

        // Target background reference color (average of white corners)
        const targetR = rSum / whiteCornerCount;
        const targetG = gSum / whiteCornerCount;
        const targetB = bSum / whiteCornerCount;

        // 2. BFS Flood-Fill from image boundaries inwards
        // Only contiguous border pixels matching white background are keyed out
        const totalPixels = w * h;
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        const isMatchingBg = (pIdx: number): boolean => {
          const a = data[pIdx + 3];
          if (a < 15) return true; // already transparent

          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          // Check brightness and low saturation
          if (r < luminanceThreshold || g < luminanceThreshold || b < luminanceThreshold) {
            return false;
          }
          const satDiff = Math.max(r, g, b) - Math.min(r, g, b);
          if (satDiff > saturationMax) {
            return false;
          }

          const dr = Math.abs(r - targetR);
          const dg = Math.abs(g - targetG);
          const db = Math.abs(b - targetB);

          return dr <= colorTolerance && dg <= colorTolerance && db <= colorTolerance;
        };

        // Seed horizontal borders (top & bottom)
        for (let x = 0; x < w; x++) {
          const topPix = x;
          const btmPix = (h - 1) * w + x;
          if (isMatchingBg(topPix * 4)) {
            visited[topPix] = 1;
            queue[tail++] = topPix;
          }
          if (isMatchingBg(btmPix * 4)) {
            visited[btmPix] = 1;
            queue[tail++] = btmPix;
          }
        }

        // Seed vertical borders (left & right)
        for (let y = 0; y < h; y++) {
          const leftPix = y * w;
          const rightPix = y * w + (w - 1);
          if (!visited[leftPix] && isMatchingBg(leftPix * 4)) {
            visited[leftPix] = 1;
            queue[tail++] = leftPix;
          }
          if (!visited[rightPix] && isMatchingBg(rightPix * 4)) {
            visited[rightPix] = 1;
            queue[tail++] = rightPix;
          }
        }

        // Execute BFS queue
        while (head < tail) {
          const curr = queue[head++];
          const cx = curr % w;
          const cy = Math.floor(curr / w);

          // 4-directional expansion
          // Right
          if (cx + 1 < w) {
            const next = curr + 1;
            if (!visited[next] && isMatchingBg(next * 4)) {
              visited[next] = 1;
              queue[tail++] = next;
            }
          }
          // Left
          if (cx - 1 >= 0) {
            const next = curr - 1;
            if (!visited[next] && isMatchingBg(next * 4)) {
              visited[next] = 1;
              queue[tail++] = next;
            }
          }
          // Down
          if (cy + 1 < h) {
            const next = curr + w;
            if (!visited[next] && isMatchingBg(next * 4)) {
              visited[next] = 1;
              queue[tail++] = next;
            }
          }
          // Up
          if (cy - 1 >= 0) {
            const next = curr - w;
            if (!visited[next] && isMatchingBg(next * 4)) {
              visited[next] = 1;
              queue[tail++] = next;
            }
          }
        }

        // Set all visited pixels to 100% transparent alpha = 0
        for (let i = 0; i < totalPixels; i++) {
          if (visited[i] === 1) {
            data[i * 4 + 3] = 0;
          }
        }

        // 3. Smooth Feathering on Edge Pixels
        if (feather) {
          for (let i = 0; i < totalPixels; i++) {
            if (visited[i] === 0) {
              const cx = i % w;
              const cy = Math.floor(i / w);

              const hasCutoutNeighbor =
                (cx > 0 && visited[i - 1] === 1) ||
                (cx < w - 1 && visited[i + 1] === 1) ||
                (cy > 0 && visited[i - w] === 1) ||
                (cy < h - 1 && visited[i + w] === 1);

              if (hasCutoutNeighbor) {
                const pIdx = i * 4;
                const r = data[pIdx];
                const g = data[pIdx + 1];
                const b = data[pIdx + 2];
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                // If it's a light fringe pixel, soften alpha smoothly
                if (lum > 200) {
                  const factor = Math.max(0, Math.min(1, (248 - lum) / 48));
                  data[pIdx + 3] = Math.round(data[pIdx + 3] * factor);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Optional Bounding-Box Normalization into canonical 1024x1024 fashion grid
        let finalCanvas: HTMLCanvasElement = canvas;
        if (options.normalizeScale) {
          finalCanvas = normalizeGarmentScaleAndPosition(canvas, options.slot);
        }

        // Convert to lightweight WebP with full alpha transparency support
        try {
          const webpData = finalCanvas.toDataURL('image/webp', 0.9);
          if (webpData && webpData.startsWith('data:image/webp')) {
            transparencyCache.set(imageSource, webpData);
            return resolve(webpData);
          }
        } catch {}

        const pngData = finalCanvas.toDataURL('image/png');
        transparencyCache.set(imageSource, pngData);
        resolve(pngData);
      } catch (err) {
        console.warn('[removeWhiteBackground] Processing error:', err);
        resolve(imageSource);
      }
    };

    img.onerror = () => {
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculates the exact bounding box of non-transparent garment pixels.
 */
export function getGarmentBoundingBox(ctx: CanvasRenderingContext2D, width: number, height: number): BoundingBox | null {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 20) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels || maxX <= minX || maxY <= minY) return null;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Normalizes garment framing onto a standardized 1024x1024 canvas.
 * Guarantees that ALL clothing items from ANY AI model have 100% uniform proportions:
 * - Tops/Hoodies: Width is ~78% of canvas, neckline starts at 10% from top.
 * - Bottoms/Pants: Height is ~84% of canvas, waistband starts at 10% from top.
 * - Outerwear: Width is ~82% of canvas, neckline starts at 10% from top.
 * - Shoes: Width is ~72% of canvas, centered horizontally and vertically.
 */
export function normalizeGarmentScaleAndPosition(
  canvas: HTMLCanvasElement,
  slot: 'slot_top' | 'slot_bottom' | 'slot_outer' | 'slot_shoes' | string = 'slot_top'
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const box = getGarmentBoundingBox(ctx, canvas.width, canvas.height);
  if (!box) return canvas;

  const targetSize = 1024;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetSize;
  outCanvas.height = targetSize;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return canvas;

  const aspect = box.width / box.height;

  let targetW: number;
  let targetH: number;
  let targetX: number;
  let targetY: number;

  if (slot === 'slot_bottom') {
    targetH = Math.round(targetSize * 0.84);
    targetW = Math.round(targetH * aspect);
    targetX = Math.round((targetSize - targetW) / 2);
    targetY = Math.round(targetSize * 0.10);
  } else if (slot === 'slot_shoes') {
    targetW = Math.round(targetSize * 0.72);
    targetH = Math.round(targetW / aspect);
    targetX = Math.round((targetSize - targetW) / 2);
    targetY = Math.round((targetSize - targetH) / 2);
  } else if (slot === 'slot_outer') {
    targetW = Math.round(targetSize * 0.82);
    targetH = Math.round(targetW / aspect);
    if (targetH > targetSize * 0.75) {
      targetH = Math.round(targetSize * 0.75);
      targetW = Math.round(targetH * aspect);
    }
    targetX = Math.round((targetSize - targetW) / 2);
    targetY = Math.round(targetSize * 0.10);
  } else {
    // slot_top
    targetW = Math.round(targetSize * 0.78);
    targetH = Math.round(targetW / aspect);
    if (targetH > targetSize * 0.72) {
      targetH = Math.round(targetSize * 0.72);
      targetW = Math.round(targetH * aspect);
    }
    targetX = Math.round((targetSize - targetW) / 2);
    targetY = Math.round(targetSize * 0.10);
  }

  outCtx.drawImage(
    canvas,
    box.minX,
    box.minY,
    box.width,
    box.height,
    targetX,
    targetY,
    targetW,
    targetH
  );

  return outCanvas;
}

/**
 * Image Processor Web Worker
 * Handles heavy image processing off the main thread
 */

/**
 * Extract dominant color from image data
 * @param {ImageData} imageData - Image data
 * @returns {string} RGB color string
 */
function extractDominantColor(imageData) {
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Create a blurred background using image pixels
 * @param {OffscreenCanvasRenderingContext2D} ctx - Canvas context
 * @param {ImageBitmap} imageBitmap - Image bitmap
 * @param {number} canvasSize - Size of the square canvas
 * @param {number} blurIntensity - Blur intensity (0-50)
 */
function createBlurredBackground(ctx, imageBitmap, canvasSize, blurIntensity) {
  const tempCanvas = new OffscreenCanvas(canvasSize, canvasSize);
  const tempCtx = tempCanvas.getContext("2d");

  // Scale and tile the image to fill the canvas
  const scale = Math.max(
    canvasSize / imageBitmap.width,
    canvasSize / imageBitmap.height,
  );
  const scaledWidth = imageBitmap.width * scale;
  const scaledHeight = imageBitmap.height * scale;
  const offsetX = (canvasSize - scaledWidth) / 2;
  const offsetY = (canvasSize - scaledHeight) / 2;

  // Apply blur filter before drawing
  if (blurIntensity > 0) {
    tempCtx.filter = `blur(${blurIntensity}px)`;
  }

  tempCtx.drawImage(imageBitmap, offsetX, offsetY, scaledWidth, scaledHeight);

  // Reset filter for any subsequent operations
  if (blurIntensity > 0) {
    tempCtx.filter = "none";
  }

  // Draw blurred background to main canvas
  ctx.drawImage(tempCanvas, 0, 0);
}

/**
 * Process image in worker
 * @param {ImageBitmap} imageBitmap - Image bitmap
 * @param {Object} options - Processing options
 * @returns {Promise<{blob: Blob, dimensions: Object}>}
 */
async function processImage(imageBitmap, options) {
  const {
    blurIntensity = 15,
    useBlurredBackground = true,
    paddingColor = null,
  } = options;

  try {
    // Determine canvas size (longest dimension)
    const canvasSize = Math.max(imageBitmap.width, imageBitmap.height);

    // Create main canvas
    const canvas = new OffscreenCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    // Determine background color
    let bgColor = paddingColor;

    if (!bgColor) {
      // Extract dominant color by sampling the image
      const tempCanvas = new OffscreenCanvas(
        imageBitmap.width,
        imageBitmap.height,
      );
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(imageBitmap, 0, 0);
      const imageData = tempCtx.getImageData(
        0,
        0,
        imageBitmap.width,
        imageBitmap.height,
      );
      bgColor = extractDominantColor(imageData);
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Create blurred background if enabled
    if (useBlurredBackground) {
      createBlurredBackground(ctx, imageBitmap, canvasSize, blurIntensity);
    }

    // Reset filter for main image
    ctx.filter = "none";

    // Center and draw original image
    const offsetX = (canvasSize - imageBitmap.width) / 2;
    const offsetY = (canvasSize - imageBitmap.height) / 2;
    ctx.drawImage(
      imageBitmap,
      offsetX,
      offsetY,
      imageBitmap.width,
      imageBitmap.height,
    );

    // Convert canvas to blob for transfer
    const blob = await canvas.convertToBlob({ type: "image/png" });

    return {
      blob,
      dimensions: {
        original: { width: imageBitmap.width, height: imageBitmap.height },
        square: { width: canvasSize, height: canvasSize },
      },
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Message handler for worker
 */
self.onmessage = async (event) => {
  const { id, arrayBuffer, fileType, options } = event.data;

  try {
    // Convert arrayBuffer to blob
    const blob = new Blob([arrayBuffer], { type: fileType || 'image/jpeg' });

    // Convert blob to ImageBitmap
    const imageBitmap = await createImageBitmap(blob);

    const result = await processImage(imageBitmap, options);

    // Send result back to main thread (don't transfer blob)
    self.postMessage({
      id,
      success: true,
      result,
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      success: false,
      error: error.message,
    });
  }
};

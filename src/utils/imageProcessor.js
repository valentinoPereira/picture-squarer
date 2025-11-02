/**
 * Image Processor Utility
 * Handles image loading, square conversion, blurred padding, and export
 */

/**
 * Gaussian blur using canvas filter
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} blurRadius - Blur radius in pixels
 */
export const applyGaussianBlur = (ctx, blurRadius) => {
  if (blurRadius > 0) {
    ctx.filter = `blur(${blurRadius}px)`;
  }
};

/**
 * Extract dominant color from image edges for realistic background
 * @param {HTMLImageElement} img - Image element
 * @returns {string} RGB color string
 */
export const extractDominantColor = (img) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  // Sample edges for more natural background
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Create a blurred background using image pixels
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} img - Image element
 * @param {number} canvasSize - Size of the square canvas
 * @param {number} blurIntensity - Blur intensity (0-50)
 */
export const createBlurredBackground = (
  ctx,
  img,
  canvasSize,
  blurIntensity,
) => {
  // Create a temporary canvas for the blurred background
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = canvasSize;
  tempCanvas.height = canvasSize;

  // Scale and tile the image to fill the canvas
  const scale = Math.max(canvasSize / img.width, canvasSize / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const offsetX = (canvasSize - scaledWidth) / 2;
  const offsetY = (canvasSize - scaledHeight) / 2;

  // Apply blur filter before drawing
  if (blurIntensity > 0) {
    tempCtx.filter = `blur(${blurIntensity}px)`;
  }

  tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

  // Reset filter for any subsequent operations
  if (blurIntensity > 0) {
    tempCtx.filter = "none";
  }

  // Draw blurred background to main canvas
  ctx.drawImage(tempCanvas, 0, 0);
};

/**
 * Convert image to square with blurred padding
 * @param {File} file - Image file
 * @param {Object} options - Processing options
 * @param {number} options.blurIntensity - Blur intensity (0-50, default: 15)
 * @param {boolean} options.useBlurredBackground - Whether to use blurred background (default: true)
 * @param {string} options.paddingColor - Custom padding color (optional)
 * @returns {Promise<{canvas: HTMLCanvasElement, url: string}>}
 */
export const processImageToSquare = async (file, options = {}) => {
  const {
    blurIntensity = 15,
    useBlurredBackground = true,
    paddingColor = null,
  } = options;

  return new Promise((resolve, reject) => {
    // Validate file
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Invalid image file"));
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      reject(new Error("File size exceeds 50MB limit"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          // Determine canvas size (longest dimension)
          const canvasSize = Math.max(img.width, img.height);

          // Create main canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          canvas.width = canvasSize;
          canvas.height = canvasSize;

          // Determine background color
          const bgColor = paddingColor || extractDominantColor(img);
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvasSize, canvasSize);

          // Create blurred background if enabled
          if (useBlurredBackground) {
            createBlurredBackground(ctx, img, canvasSize, blurIntensity);
          }

          // Reset filter for main image
          ctx.filter = "none";

          // Center and draw original image
          const offsetX = (canvasSize - img.width) / 2;
          const offsetY = (canvasSize - img.height) / 2;
          ctx.drawImage(img, offsetX, offsetY, img.width, img.height);

          // Create downloadable URL
          const url = canvas.toDataURL("image/png");

          resolve({
            canvas,
            url,
            dimensions: {
              original: { width: img.width, height: img.height },
              square: { width: canvasSize, height: canvasSize },
            },
          });
        } catch (error) {
          reject(new Error(`Image processing failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Convert image to square with blurred padding using Web Worker
 * Processes image off the main thread for better UI responsiveness
 * @param {File} file - Image file
 * @param {Object} options - Processing options
 * @param {number} options.blurIntensity - Blur intensity (0-50, default: 15)
 * @param {boolean} options.useBlurredBackground - Whether to use blurred background (default: true)
 * @param {string} options.paddingColor - Custom padding color (optional)
 * @returns {Promise<{canvas: Object, url: string, blob: Blob, dimensions: Object}>}
 */
export const processImageToSquareWithWorker = async (file, options = {}) => {
  const {
    blurIntensity = 15,
    useBlurredBackground = true,
    paddingColor = null,
  } = options;

  // Validate file
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Invalid image file");
  }

  // Check file size (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File size exceeds 50MB limit");
  }

  // Create worker

  const worker = new Worker(
    new URL("../workers/imageProcessor.worker.js", import.meta.url),

    { type: "module" },
  );

  return new Promise((resolve, reject) => {
    // Create unique ID for this request

    const requestId = Math.random().toString(36).substr(2, 9);

    // Set up message handler

    const handleMessage = async (event) => {
      if (event.data.id !== requestId) {
        return;
      }

      try {
        if (event.data.success) {
          const { blob, dimensions } = event.data.result;

          // Convert blob to data URL

          const reader = new FileReader();

          reader.onload = () => {
            // Create a canvas-like object for compatibility

            const canvas = {
              toDataURL: () => reader.result,

              width: dimensions.square.width,

              height: dimensions.square.height,
            };

            resolve({
              canvas,

              url: reader.result,

              blob,

              dimensions,
            });
          };

          reader.readAsDataURL(blob);
        } else {
          reject(new Error(event.data.error));
        }
      } catch (error) {
        reject(error);
      } finally {
        worker.removeEventListener("message", handleMessage);

        worker.removeEventListener("error", handleError);

        worker.terminate();
      }
    };

    // Set up error handler
    const handleError = (event) => {
      reject(new Error(`Worker error: ${event.message}`));

      worker.removeEventListener("message", handleMessage);

      worker.removeEventListener("error", handleError);

      worker.terminate();
    };

    worker.addEventListener("message", handleMessage);

    worker.addEventListener("error", handleError);

    // Convert file to ArrayBuffer and send to worker

    file
      .arrayBuffer()

      .then((arrayBuffer) => {
        worker.postMessage(
          {
            id: requestId,

            arrayBuffer,

            fileType: file.type,

            options: {
              blurIntensity,

              useBlurredBackground,

              paddingColor,
            },
          },

          [arrayBuffer],
        );
      })

      .catch((error) => {
        reject(
          new Error(`Failed to read file as ArrayBuffer: ${error.message}`),
        );

        worker.removeEventListener("message", handleMessage);

        worker.removeEventListener("error", handleError);

        worker.terminate();
      });
  });
};

/**
 * Export blob to file with optional format conversion
 * @param {Blob} blob - Original blob (PNG from worker)
 * @param {string} filename - Output filename
 * @param {string} format - Desired file format ('png', 'jpg', 'webp')
 * @param {number} quality - JPEG/WebP quality (0-1, default: 0.95)
 * @returns {Promise<void>}
 */
export const downloadBlob = (blob, filename, format = "png", quality = 0.95) => {
  return new Promise((resolve, reject) => {
    // If format is PNG, download the blob directly
    if (format.toLowerCase() === "png") {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve();
      }, 100);
      return;
    }

    // For JPG/WebP, convert from PNG blob to requested format
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Now use toBlob with the desired format and quality
        const mimeType =
          {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            webp: "image/webp",
          }[format.toLowerCase()] || "image/jpeg";

        canvas.toBlob(
          (outputBlob) => {
            try {
              if (!outputBlob) {
                reject(new Error("Failed to generate image blob"));
                return;
              }
              const url = URL.createObjectURL(outputBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve();
              }, 100);
            } catch (error) {
              reject(error);
            }
          },
          mimeType,
          quality,
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
};

/**
 * Export canvas to file with specified format
</parameter>
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} filename - Output filename
 * @param {string} format - File format ('png', 'jpg', 'webp')
 * @param {number} quality - JPEG/WebP quality (0-1, default: 0.95)
 */
export const downloadCanvas = (
  canvas,
  filename,
  format = "png",
  quality = 0.95,
) => {
  return new Promise((resolve, reject) => {
    const mimeType =
      {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
      }[format.toLowerCase()] || "image/png";

    const link = document.createElement("a");

    // Use toBlob for better quality control (toDataURL doesn't properly respect quality in many browsers)
    canvas.toBlob(
      (blob) => {
        try {
          if (!blob) {
            reject(new Error("Failed to generate image blob"));
            return;
          }
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // Clean up the object URL after a delay to ensure download starts
          setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve();
          }, 100);
        } catch (error) {
          reject(error);
        }
      },
      mimeType,
      format.toLowerCase() !== "png" ? quality : undefined,
    );
  });
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} Extension without dot
 */
export const getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};

/**
 * Generate output filename
 * @param {string} originalFilename - Original filename
 * @param {string} format - Output format
 * @returns {string} New filename
 */
export const generateOutputFilename = (originalFilename, format = "png") => {
  const nameWithoutExt = originalFilename.replace(/\.[^.]+$/, "");
  const timestamp = new Date().getTime();
  return `${nameWithoutExt}-squared-${timestamp}.${format}`;
};

/**
 * Validate image dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} Validation result
 */
export const validateImageDimensions = (width, height) => {
  const minDimension = 50;
  const maxDimension = 16000;

  if (width < minDimension || height < minDimension) {
    return {
      valid: false,
      error: "Image is too small (minimum 50x50 pixels)",
    };
  }

  if (width > maxDimension || height > maxDimension) {
    return {
      valid: false,
      error: "Image dimension exceeds maximum (16000 pixels)",
    };
  }

  return { valid: true };
};

/**
 * Get social media preset dimensions
 * @returns {Object} Preset dimensions
 */
export const getSocialMediaPresets = () => {
  return {
    instagram: {
      name: "Instagram (Square)",
      width: 1080,
      height: 1080,
    },
    instagram_profile: {
      name: "Instagram Profile Picture",
      width: 320,
      height: 320,
    },
    twitter: {
      name: "Twitter Profile Picture",
      width: 400,
      height: 400,
    },
    facebook: {
      name: "Facebook Profile Picture",
      width: 320,
      height: 320,
    },
    facebook_cover: {
      name: "Facebook Cover Photo",
      width: 820,
      height: 312,
    },
    tiktok: {
      name: "TikTok Profile Picture",
      width: 200,
      height: 200,
    },
    linkedin: {
      name: "LinkedIn Profile Picture",
      width: 400,
      height: 400,
    },
  };
};

import React, { useEffect, useRef, useState } from "react";
import { useImage } from "../context/ImageContext";
import { processImageToSquareWithWorker } from "../utils/imageProcessor";

/**
 * ImagePreview Component
 * Displays the processed image with live updates based on settings
 */
const ImagePreview = () => {
  const {
    originalImage,
    originalFile,
    setProcessedImage,
    processingOptions,
    setErrorMessage,
  } = useImage();

  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [processedCanvasData, setProcessedCanvasData] = useState(null);

  /**
   * Process image whenever settings change (using Web Worker for responsiveness)
   */
  useEffect(() => {
    if (!originalImage || !originalFile) {
      setProcessedCanvasData(null);
      return;
    }

    const processImage = async () => {
      setIsRendering(true);
      try {
        const result = await processImageToSquareWithWorker(originalFile, {
          blurIntensity: processingOptions.blurIntensity,
          useBlurredBackground: processingOptions.useBlurredBackground,
          paddingColor: processingOptions.paddingColor,
        });

        // Store the processed canvas data for the drawing effect
        setProcessedCanvasData(result);
        setProcessedImage(result.canvas, result.url);
      } catch (err) {
        console.error("[ImagePreview] Processing error:", err);
        setErrorMessage(`Processing error: ${err.message}`);
        setProcessedCanvasData(null);
      } finally {
        setIsRendering(false);
      }
    };

    processImage();
  }, [
    originalImage,
    originalFile,
    processingOptions,
    setProcessedImage,
    setErrorMessage,
  ]);

  /**
   * Draw to canvas once it's mounted and we have processed data
   */
  useEffect(() => {
    if (!canvasRef.current || !processedCanvasData) {
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    const container = canvasRef.current.parentElement;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scaling to fit the entire image
    const scale = Math.min(
      containerWidth / processedCanvasData.canvas.width,
      containerHeight / processedCanvasData.canvas.height,
    );

    // Calculate position to center the image
    const x = (containerWidth - processedCanvasData.canvas.width * scale) / 2;
    const y = (containerHeight - processedCanvasData.canvas.height * scale) / 2;

    // Create image from the data URL to draw it
    const img = new Image();
    img.onload = () => {
      // Account for device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      const scaledWidth = containerWidth * dpr;
      const scaledHeight = containerHeight * dpr;

      // Set canvas resolution for high-DPI displays
      canvasRef.current.width = scaledWidth;
      canvasRef.current.height = scaledHeight;

      // Scale context to match CSS size
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, containerWidth, containerHeight);
      ctx.drawImage(
        img,
        x,
        y,
        processedCanvasData.canvas.width * scale,
        processedCanvasData.canvas.height * scale,
      );
    };
    img.src = processedCanvasData.url;
  }, [processedCanvasData]);

  if (!originalImage) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Upload an image to see preview
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Preview
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {originalImage.width} × {originalImage.height}
        </span>
      </div>

      {/* Canvas Container with Loading Overlay */}
      <div className="relative sm:mb-0">
        <div className="canvas-container overflow-hidden max-h-[80vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center w-full">
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "100%",
              height: "100%",
              display: "block",
              backgroundColor: "var(--canvas-bg-color, #f3f4f6)",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Loading Indicator Overlay */}
        {isRendering && (
          <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full shadow-lg p-3 flex items-center gap-2">
            <div className="animate-spin-custom">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Processing...
            </span>
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">Original Size</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {originalImage.width} × {originalImage.height}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">Output Size</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {Math.max(originalImage.width, originalImage.height)} ×{" "}
            {Math.max(originalImage.width, originalImage.height)}
          </p>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="hidden sm:block bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded p-3">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <span className="font-semibold">Blur Intensity:</span>{" "}
          {processingOptions.blurIntensity}px
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;

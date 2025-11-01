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
      // Only set canvas dimensions and clear right before drawing
      // This prevents blank canvas from being visible
      canvasRef.current.width = containerWidth;
      canvasRef.current.height = containerHeight;

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
        <p className="text-gray-500">Upload an image to see preview</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
        <span className="text-sm text-gray-600">
          {originalImage.width} × {originalImage.height}
        </span>
      </div>

      {/* Canvas Container with Loading Overlay */}
      <div className="relative">
        <div className="canvas-container overflow-hidden max-h-[80vh] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[300px] sm:min-h-[400px] w-full">
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              display: "block",
              backgroundColor: "#f3f4f6",
            }}
          />
        </div>

        {/* Loading Indicator Overlay */}
        {isRendering && (
          <div className="absolute top-3 right-3 bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
            <div className="animate-spin-custom">
              <svg
                className="w-5 h-5 text-blue-600"
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
            <span className="text-sm font-medium text-gray-700">
              Processing...
            </span>
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-600">Original Size</p>
          <p className="font-semibold text-gray-900">
            {originalImage.width} × {originalImage.height}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-gray-600">Output Size</p>
          <p className="font-semibold text-gray-900">
            {Math.max(originalImage.width, originalImage.height)} ×{" "}
            {Math.max(originalImage.width, originalImage.height)}
          </p>
        </div>
      </div>

      {/* Mobile Single Line Info */}
      <div className="sm:hidden text-sm bg-gray-50 p-3 rounded">
        <p className="text-gray-600 text-center">
          <span className="font-semibold">Original:</span>{" "}
          <span className="font-semibold text-gray-900">
            {originalImage.width} × {originalImage.height}
          </span>
          {" | "}
          <span className="font-semibold">Output:</span>{" "}
          <span className="font-semibold text-gray-900">
            {Math.max(originalImage.width, originalImage.height)} ×{" "}
            {Math.max(originalImage.width, originalImage.height)}
          </span>
        </p>
      </div>

      {/* Current Settings Display */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Blur Intensity:</span>{" "}
          {processingOptions.blurIntensity}px
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;

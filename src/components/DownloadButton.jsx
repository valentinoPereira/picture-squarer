import React, { useState } from 'react';
import { useImage } from '../context/ImageContext';
import { downloadCanvas, generateOutputFilename } from '../utils/imageProcessor';

/**
 * DownloadButton Component
 * Allows users to download the processed image in various formats
 */
const DownloadButton = () => {
  const { originalImage, processedCanvas, originalFile } = useImage();

  const [selectedFormat, setSelectedFormat] = useState("png");
  const [quality, setQuality] = useState(95);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!originalImage || !processedCanvas) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Process an image to enable download</p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const filename = generateOutputFilename(
        originalFile.name,
        selectedFormat,
      );
      downloadCanvas(processedCanvas, filename, selectedFormat, quality / 100);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formats = [
    {
      id: "png",
      label: "PNG",
      supportsQuality: false,
      info: "Lossless format. Best for quality, larger file size.",
      extension: "png",
    },
    {
      id: "jpg",
      label: "JPG",
      supportsQuality: true,
      info: "Compressed format. Smaller file size, good for sharing.",
      extension: "jpg",
    },
    {
      id: "webp",
      label: "WebP",
      supportsQuality: true,
      info: "Modern format. Best compression, smaller file size.",
      extension: "webp",
    },
  ];

  const outputDimension = Math.max(originalImage.width, originalImage.height);

  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ready to Download</h3>

      {/* Image Size Info */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
          <span className="font-semibold">Output Dimensions:</span>
          <br />
          {outputDimension} × {outputDimension} pixels
        </p>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          File Format
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedFormat === format.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              <div className="font-semibold text-xs sm:text-sm">{format.label}</div>
              <div className="text-xs opacity-75 mt-1">{format.extension}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Control */}
      {formats.find((f) => f.id === selectedFormat)?.supportsQuality && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="quality-slider"
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Quality / Compression
            </label>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {quality}%
            </span>
          </div>
          <input
            id="quality-slider"
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={isDownloading}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </div>
      )}

      {/* Format Description */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-700 dark:text-gray-300">
          {formats.find((f) => f.id === selectedFormat)?.info}
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
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
            Preparing Download...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download as {selectedFormat.toUpperCase()}
          </>
        )}
      </button>

      {/* Tips Section */}
      <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <li>• PNG is best for preserving quality without compression</li>
          <li>
            • Use JPG or WebP for smaller file sizes perfect for social media
          </li>
          <li>• Higher quality = larger file size (slower uploads)</li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadButton;

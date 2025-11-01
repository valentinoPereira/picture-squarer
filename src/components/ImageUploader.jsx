import React, { useCallback, useRef } from "react";
import { useImage } from "../context/ImageContext";

import { validateImageDimensions } from "../utils/imageProcessor";

/**
 * ImageUploader Component
 * Handles file upload via drag-and-drop or click
 */
const ImageUploader = () => {
  const {
    setImage,
    setIsProcessing,
    setErrorMessage,
    clearError,
    originalImage,
  } = useImage();

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  /**
   * Handle file selection and validation
   */
  const handleFile = useCallback(
    async (file) => {
      clearError();
      setIsProcessing(true);

      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(
            "Please upload a valid image file (JPEG, PNG, WebP, GIF)",
          );
        }

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error("File size exceeds 50MB limit");
        }

        // Load image
        const img = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (e) => {
            const image = new Image();
            image.crossOrigin = "anonymous";

            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Failed to load image"));

            image.src = e.target.result;
          };

          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });

        // Validate dimensions
        const validation = validateImageDimensions(img.width, img.height);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Set image and file in context
        setImage(img, file);
      } catch (err) {
        setErrorMessage(err.message);
        console.error("Image upload error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [setImage, setIsProcessing, setErrorMessage, clearError],
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input value so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFile],
  );

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files?.[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  /**
   * Handle click on upload zone
   */
  const handleZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        className={`upload-zone transition-all duration-200 ${
          isDragging ? "active" : ""
        } ${originalImage ? "opacity-75" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload image file"
        />

        <div className="space-y-3 sm:space-y-4">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div>
            <p className="text-base sm:text-lg font-semibold text-gray-700">
              Drop your image here
            </p>
            <p className="text-sm text-gray-500 mt-1">or tap to browse</p>
          </div>

          {/* Supported Formats */}
          <div className="text-xs sm:text-sm text-gray-500">
            <p>Supported: JPEG, PNG, WebP, GIF</p>
            <p>Maximum size: 50MB</p>
          </div>
        </div>
      </div>

      {/* Show selected file info if image is loaded */}
      {originalImage && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              {originalImage.width} × {originalImage.height}
            </span>
            {" pixels loaded"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

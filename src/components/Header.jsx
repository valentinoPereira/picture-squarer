import React from "react";
import { useImage } from "../context/ImageContext";

/**
 * Header Component
 * Displays app title, description, and reset functionality
 */
const Header = () => {
  const { clearImages, resetOptions, originalImage } = useImage();

  const handleReset = () => {
    if (
      originalImage &&
      window.confirm("Clear all images and reset settings?")
    ) {
      clearImages();
      resetOptions();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Picture Squarer
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Perfect square images for social media
              </p>
            </div>
          </div>

          {/* Reset Button */}
          {originalImage && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 rounded-md transition-colors duration-200 min-h-[44px] sm:min-h-0"
              title="Clear image and reset settings"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
              <span className="hidden sm:inline">Start Over</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

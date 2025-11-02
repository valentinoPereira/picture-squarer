import React from "react";
import { ImageProvider, useImage } from "./context/ImageContext";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import ImagePreview from "./components/ImagePreview";
import SettingsPanel from "./components/SettingsPanel";
import DownloadButton from "./components/DownloadButton";
import "./App.css";

/**
 * Main Application Content
 * Layout and orchestration of all components
 */
function AppContent() {
  const { originalImage, error, clearError } = useImage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800 px-4 py-2 sticky top-12 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 md:py-8 sm:px-6 lg:px-8">
          {!originalImage ? (
            // Upload Step
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Get Started
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  Upload an image to convert it to a perfect square
                </p>
              </div>
              <ImageUploader />
            </div>
          ) : (
            // Processing Step - Two Column Layout
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column - Preview */}
              <div className="lg:col-span-2">
                <ImagePreview />
              </div>

              {/* Right Column - Settings & Download */}
              <div className="space-y-4 sm:space-y-6">
                <SettingsPanel />
                <DownloadButton />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-12 md:mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            <p>Made with ❤️ for Perfect Social Media Profile Pictures</p>
            <p className="mt-2 text-gray-500 dark:text-gray-500">
              © 2024 Picture Squarer by Valentino Pereira. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Root App Component
 * Wraps content with ImageProvider context
 */
function App() {
  return (
    <ImageProvider>
      <AppContent />
    </ImageProvider>
  );
}

export default App;

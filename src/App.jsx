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
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = React.useState(false);

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative">
              {/* Left Column - Preview */}
              <div className="lg:col-span-2">
                <ImagePreview />
              </div>

              {/* Right Column - Settings & Download (Desktop only) */}
              <div className="hidden lg:flex lg:flex-col space-y-4 sm:space-y-6">
                <SettingsPanel isMobileDrawer={false} />
                <DownloadButton />
              </div>

              {/* Mobile Download Button (Below Preview) */}
              <div className="lg:hidden">
                <DownloadButton />
              </div>

              {/* Mobile Settings Drawer Button */}
              <button
                onClick={() => setIsSettingsDrawerOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center transition-all z-40"
                aria-label="Open settings"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Mobile Settings Drawer */}
              {isSettingsDrawerOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsSettingsDrawerOpen(false)}
                  />

                  {/* Drawer */}
                  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-40 settings-drawer">
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>

                    {/* Close Button */}
                    <div className="px-4 pb-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Settings
                      </h3>
                      <button
                        onClick={() => setIsSettingsDrawerOpen(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close settings"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="px-4 py-6 max-h-[80vh] overflow-y-auto pb-8">
                      <SettingsPanel isMobileDrawer={true} />
                    </div>
                  </div>
                </>
              )}
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

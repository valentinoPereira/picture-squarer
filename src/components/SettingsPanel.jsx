import React, { useState, useEffect } from "react";
import { useImage } from "../context/ImageContext";

/**
 * SettingsPanel Component
 * Controls image processing settings like blur intensity, color options, etc.
 */
const SettingsPanel = () => {
  const {
    originalImage,
    processingOptions,
    setBlurIntensity,
    setPaddingColor,
    setUseBlurredBackground,
    resetOptions,
  } = useImage();

  // Local state for slider value (for immediate visual feedback)
  const [localBlurIntensity, setLocalBlurIntensity] = useState(processingOptions.blurIntensity);

  // Debounce timer for updating the actual blur processing
  useEffect(() => {
    const timer = setTimeout(() => {
      setBlurIntensity(localBlurIntensity);
    }, 200); // Wait 200ms after user stops dragging

    return () => clearTimeout(timer);
  }, [localBlurIntensity, setBlurIntensity]);

  // Update local state when context blur intensity changes (e.g., from preset buttons)
  useEffect(() => {
    setLocalBlurIntensity(processingOptions.blurIntensity);
  }, [processingOptions.blurIntensity]);

  if (!originalImage) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Upload an image to adjust settings</p>
      </div>
    );
  }

  const handleBlurChange = (e) => {
    setLocalBlurIntensity(parseInt(e.target.value, 10));
  };

  const handleColorChange = (e) => {
    setPaddingColor(e.target.value);
  };

  const handleToggleBlurredBg = () => {
    setUseBlurredBackground(!processingOptions.useBlurredBackground);
  };

  const handleResetSettings = () => {
    resetOptions();
  };

  return (
    <div className="space-y-6">
      {/* Blur Intensity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Blur Settings
        </h3>

        <div className="space-y-4">
          {/* Toggle Blurred Background */}
          <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Blurred Background</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {processingOptions.useBlurredBackground
                  ? "Using blurred image as padding"
                  : "Using solid color for padding"}
              </p>
            </div>
            <button
              onClick={handleToggleBlurredBg}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
                processingOptions.useBlurredBackground
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              role="switch"
              aria-checked={processingOptions.useBlurredBackground}
            >
              <span
                className={`inline-block h-6 w-6 m-0.5 transform rounded-full bg-white transition-transform ${
                  processingOptions.useBlurredBackground ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Blur Intensity Slider */}
          {processingOptions.useBlurredBackground && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="blur-slider"
                  className="font-medium text-gray-900 dark:text-gray-100"
                >
                  Blur Intensity
                </label>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {localBlurIntensity}px
                </span>
              </div>
              <input
                id="blur-slider"
                type="range"
                min="0"
                max="50"
                value={localBlurIntensity}
                onChange={handleBlurChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>No blur</span>
                <span>Heavy blur</span>
              </div>
            </div>
          )}

          {/* Blur Presets */}
          {processingOptions.useBlurredBackground && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Presets
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 10, 20, 30].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setLocalBlurIntensity(preset);
                      setBlurIntensity(preset);
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      localBlurIntensity === preset
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {preset === 0 ? "None" : `${preset}px`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Padding Color
        </h3>

        {!processingOptions.useBlurredBackground && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={processingOptions.paddingColor || "#ffffff"}
                  onChange={handleColorChange}
                  className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Select Color</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {processingOptions.paddingColor || "Auto (dominant color)"}
                </p>
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Popular Colors
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  "#ffffff",
                  "#000000",
                  "#e5e7eb",
                  "#3b82f6",
                  "#ef4444",
                  "#10b981",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPaddingColor(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      processingOptions.paddingColor === color
                        ? "border-gray-900 dark:border-gray-100"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {processingOptions.useBlurredBackground && (
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
            Color is automatically determined from the image when using blurred
            background.
          </p>
        )}
      </div>

      {/* Reset Button */}
      <div className="card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Restore all settings to defaults
        </p>
        <button onClick={handleResetSettings} className="btn-secondary w-full">
          Reset Settings
        </button>
      </div>

      {/* Info Panel */}
      <div className="card bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Blur makes the padding less distracting</li>
          <li>• Higher blur values = more processing time</li>
          <li>• Use solid colors for sharp, clean edges</li>
          <li>• Perfect for social media profile pictures</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPanel;

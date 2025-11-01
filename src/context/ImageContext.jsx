import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * ImageContext
 * Manages global state for image processing application
 */
const ImageContext = createContext();

/**
 * ImageProvider Component
 * Provides image state and functions to all child components
 */
export function ImageProvider({ children }) {
  // Image state
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [processedCanvas, setProcessedCanvas] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Processing options state
  const [processingOptions, setProcessingOptions] = useState({
    blurIntensity: 15,
    paddingColor: '#ffffff',
    useBlurredBackground: false,
  });

  // Image management functions
  const setImage = useCallback((image, file) => {
    setOriginalImage(image);
    setOriginalFile(file);
    setProcessedCanvas(null);
    setError(null);
  }, []);

  const setProcessedImage = useCallback((canvas) => {
    setProcessedCanvas(canvas);
  }, []);

  const clearImages = useCallback(() => {
    setOriginalImage(null);
    setOriginalFile(null);
    setProcessedCanvas(null);
    setError(null);
  }, []);

  // Error management functions
  const setErrorMessage = useCallback((message) => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Processing options functions
  const setBlurIntensity = useCallback((intensity) => {
    setProcessingOptions(prev => ({
      ...prev,
      blurIntensity: intensity,
    }));
  }, []);

  const setPaddingColor = useCallback((color) => {
    setProcessingOptions(prev => ({
      ...prev,
      paddingColor: color,
    }));
  }, []);

  const setUseBlurredBackground = useCallback((useBlurred) => {
    setProcessingOptions(prev => ({
      ...prev,
      useBlurredBackground: useBlurred,
    }));
  }, []);

  const resetOptions = useCallback(() => {
    setProcessingOptions({
      blurIntensity: 15,
      paddingColor: '#ffffff',
      useBlurredBackground: false,
    });
  }, []);

  const value = {
    // Image state
    originalImage,
    originalFile,
    processedCanvas,
    isProcessing,
    error,

    // Processing options
    processingOptions,

    // Image functions
    setImage,
    setProcessedImage,
    clearImages,
    setIsProcessing,

    // Error functions
    setErrorMessage,
    clearError,

    // Options functions
    setBlurIntensity,
    setPaddingColor,
    setUseBlurredBackground,
    resetOptions,
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
}

/**
 * useImage Hook
 * Custom hook to use the ImageContext
 */
export function useImage() {
  const context = useContext(ImageContext);

  if (!context) {
    throw new Error('useImage must be used within an ImageProvider');
  }

  return context;
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Picture Squarer is a React-based single-page application that converts images to perfect squares with blurred or solid color padding. All image processing happens client-side using the Canvas API.

**Tech Stack:** React 19 + Vite, Tailwind CSS, Canvas API for image processing

## Development Commands

### Starting Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
```

### Building & Testing
```bash
npm run build        # Create production build in dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality checks
```

## Architecture

### State Management Pattern
The app uses **React Context API** (not Redux) for global state management:
- **Single Context:** `ImageContext` in `src/context/ImageContext.jsx`
- **Custom Hook:** `useImage()` - use this to access state/actions in components
- **State Flow:** Upload → ImageContext → Preview/Settings → Canvas Processing → Download

### Core Processing Flow
1. **Upload:** User uploads image via `ImageUploader.jsx` (drag-drop or click)
2. **Validation:** File type, size (<50MB), dimensions (50-16000px) checked
3. **Storage:** Image and File stored in ImageContext
4. **Processing:** `ImagePreview.jsx` calls `processImageToSquare()` from `utils/imageProcessor.js`
5. **Rendering:** Canvas renders square image with blurred/solid background
6. **Settings:** `SettingsPanel.jsx` updates blur intensity, triggers re-render
7. **Export:** `DownloadButton.jsx` exports canvas as PNG/JPG/WebP

### Key Algorithm (imageProcessor.js)
The `processImageToSquare()` function:
1. Loads image from File object
2. Creates square canvas (size = max dimension of original image)
3. Fills background with:
   - Dominant color extracted from image edges, OR
   - Solid color if `useBlurredBackground` is false
4. If blurred background enabled:
   - Scales image to fill canvas
   - Applies CSS `blur()` filter (0-50px)
   - Draws as background layer
5. Centers original image (unblurred) on top
6. Returns canvas element and data URL

**Important:** Blur is applied to a SEPARATE background layer, not the original image.

## Component Responsibilities

### ImageContext.jsx
- **Purpose:** Global state container
- **State:** `originalImage`, `originalFile`, `processedCanvas`, `isProcessing`, `error`, `processingOptions`
- **Actions:** `setImage()`, `setBlurIntensity()`, `setPaddingColor()`, `setUseBlurredBackground()`, `clearImages()`, `resetOptions()`
- **Default Options:** `blurIntensity: 15`, `useBlurredBackground: false`, `paddingColor: '#ffffff'`

### ImageUploader.jsx
- **Purpose:** File upload with validation
- **Accepts:** JPEG, PNG, WebP, GIF (max 50MB, 50x50 to 16000x16000px)
- **Validation Flow:** Check type → Check size → Load image → Validate dimensions → Store in context
- **Errors:** Sets error message in context, displayed by App.jsx

### ImagePreview.jsx
- **Purpose:** Real-time canvas preview
- **Re-renders on:** Image change, blur intensity change, background type change, padding color change
- **Uses:** `processImageToSquare()` to generate canvas
- **Performance:** Uses `useEffect` with dependencies to avoid unnecessary re-processing

### SettingsPanel.jsx
- **Purpose:** Adjust processing options
- **Controls:** Blur slider (0-50px), background toggle, color picker, preset colors, reset button
- **Updates Context:** Directly calls `setBlurIntensity()`, `setUseBlurredBackground()`, `setPaddingColor()`

### DownloadButton.jsx
- **Purpose:** Export canvas to file
- **Formats:** PNG (lossless), JPG (lossy), WebP (modern)
- **Quality Control:** Slider for JPG/WebP (0-1, default 0.95)
- **Naming:** `originalname-squared-timestamp.format`

### Header.jsx
- **Purpose:** App header with reset functionality
- **Reset Button:** Calls `clearImages()` to return to upload state

## Image Processing Functions

### processImageToSquare(file, options)
**Location:** `src/utils/imageProcessor.js`
**Main processing function** - converts image to square with padding
**Options:**
- `blurIntensity` (number, 0-50): Blur radius in pixels
- `useBlurredBackground` (boolean): Use blurred image vs solid color
- `paddingColor` (string): Hex color for solid background mode

**Returns:** `Promise<{ canvas, url, dimensions }>`

### extractDominantColor(img)
Samples image pixels to calculate average RGB color for natural-looking backgrounds

### createBlurredBackground(ctx, img, canvasSize, blurIntensity)
Creates blurred background layer by scaling image to fill canvas and applying CSS filter

### downloadCanvas(canvas, filename, format, quality)
Exports canvas element as downloadable file with specified format and quality

### validateImageDimensions(width, height)
Checks if dimensions are within acceptable range (50-16000px)

## Important Implementation Notes

### Canvas Context Options
Always create canvas context with `{ willReadFrequently: true }` for `extractDominantColor()` operations:
```javascript
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```

### Filter Reset Pattern
After applying blur filter, ALWAYS reset to `'none'` before drawing the original image:
```javascript
ctx.filter = `blur(${blurIntensity}px)`;
ctx.drawImage(/* blurred background */);
ctx.filter = 'none';  // Critical!
ctx.drawImage(/* original image */);
```

### Worker Implementation Available
There's a Web Worker version (`processImageToSquareWithWorker`) for off-main-thread processing, but currently not used in UI. Consider using for large images if performance becomes an issue.

## Styling with Tailwind CSS

- **Configuration:** `tailwind.config.js`
- **Global Styles:** `src/index.css` (Tailwind directives)
- **Component Styles:** `src/App.css` (custom CSS)
- **Responsive Breakpoints:** Mobile-first design with `sm:`, `md:`, `lg:` prefixes
- **Layout:** Two-column layout on desktop (preview + settings), single column on mobile

## Linting & Code Quality

- **ESLint Config:** Flat config in `eslint.config.js`
- **React Rules:** Uses `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
- **Custom Rules:** Ignores unused vars starting with capital letters (React component pattern)
- **Auto-fix:** Run `npm run lint -- --fix` to auto-fix issues

## Performance Considerations

### Processing Speed
- Small images (<1MB): 100-200ms
- Medium images (1-5MB): 300-500ms
- Large images (5-50MB): 1-3 seconds

**Optimization Tips:**
- Lower blur intensity = faster processing
- Disable blurred background for instant processing
- Consider implementing the Web Worker version for images >5MB

### Bundle Size
Current bundle is ~180KB gzipped. Dependencies are minimal and necessary.

### Memory Management
Canvas operations are memory-intensive. The app creates temporary canvases for blur processing which are garbage collected after use.

## Common Development Tasks

### Changing Default Settings
Edit `src/context/ImageContext.jsx`, line 22-26:
```javascript
const [processingOptions, setProcessingOptions] = useState({
  blurIntensity: 15,  // Change default blur
  paddingColor: '#ffffff',  // Change default color
  useBlurredBackground: false,  // Change default background type
});
```

### Adding New Export Format
1. Add format to `downloadCanvas()` mimeType mapping in `imageProcessor.js`
2. Add format option to `DownloadButton.jsx` format selector
3. Test quality slider behavior (only applies to lossy formats)

### Adjusting File Size Limits
Edit `src/utils/imageProcessor.js`, line 119 and `src/components/ImageUploader.jsx` MAX_FILE_SIZE constant

### Adding Social Media Presets
The `getSocialMediaPresets()` function in `imageProcessor.js` contains preset dimensions. These are currently not used in the UI but available for future features.

## Error Handling Pattern

Errors flow through the ImageContext:
1. Component catches error
2. Calls `setErrorMessage(message)` from context
3. `App.jsx` displays error banner at top
4. User can dismiss with `clearError()`

**Always provide user-friendly error messages** - avoid technical jargon.

## Testing Checklist

When making changes, manually test:
- [ ] Upload various image formats (JPEG, PNG, WebP, GIF)
- [ ] Test portrait, landscape, and square images
- [ ] Adjust blur slider across full range (0-50)
- [ ] Toggle between blurred and solid backgrounds
- [ ] Test color picker and preset colors
- [ ] Export in all formats (PNG, JPG, WebP)
- [ ] Test on mobile viewport (resize browser)
- [ ] Verify error messages for invalid files
- [ ] Test very large images (>10MB)

## Deployment Notes

- **Build Command:** `npm run build`
- **Output Directory:** `dist/`
- **Static Site:** No server-side rendering, pure SPA
- **Asset Handling:** Vite handles all asset bundling and optimization
- **Base Path:** Default is `/`, change in `vite.config.js` if deploying to subdirectory

### Vercel Deployment
Vercel auto-detects Vite configuration. No additional config needed.

### Other Platforms
Ensure build command is `npm run build` and publish directory is `dist`.

## Browser Compatibility

Minimum versions:
- Chrome/Edge 90+ (Canvas filter support)
- Firefox 88+
- Safari 14+ (check webkit prefix for blur filter if issues)

**Critical Feature:** CSS `filter: blur()` on canvas context. Older browsers may not support this.

## Future Enhancement Areas

If asked to add features, consider:
- **Batch Processing:** Process multiple images at once
- **Advanced Filters:** Brightness, contrast, saturation controls
- **Custom Aspect Ratios:** Beyond square (16:9, 4:3, etc.)
- **Undo/Redo:** History stack for processing options
- **Keyboard Shortcuts:** For power users
- **PWA Support:** Service worker for offline functionality
- **Social Media Direct Upload:** Integration with platform APIs

# Custom Development instructions for Claude
- Do not write huge summaries
- Do not generate unnecessary markdown files
- Do not do anything else that would distract you from the current task
- Ask the user questions if a requirement is not clear

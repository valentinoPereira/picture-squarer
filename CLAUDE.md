## Project Overview

Picture Squarer is a React-based single-page application that converts images to perfect squares with blurred or solid color padding. All image processing happens client-side using the Canvas API.

**Tech Stack:** React 19 + Vite, Tailwind CSS, Canvas API for image processing

## Bash commands
npm install: Install dependencies
npm run dev: Start dev server at http://localhost:5173
npm run build: Create production build in dist/ folder
npm run preview: Preview production build locally
npm run lint: Run ESLint for code quality checks

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

## Linting & Code Quality

- **ESLint Config:** Flat config in `eslint.config.js`
- **React Rules:** Uses `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
- **Custom Rules:** Ignores unused vars starting with capital letters (React component pattern)
- **Auto-fix:** Run `npm run lint -- --fix` to auto-fix issues

**Always provide user-friendly error messages** - avoid technical jargon.
Do not write huge summaries
Do not generate unnecessary markdown files
Do not do anything else that would distract you from the current task
Ask the user questions if a requirement is not clear

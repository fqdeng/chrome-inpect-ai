# Element Inspector Chrome Extension

A Chrome extension built with Vue 3 for inspecting web page elements. This extension provides a user-friendly interface for examining DOM elements and their properties.

## Video Demo
![Demo Video](image/output.mp4)

## Features

- Element inspection with Vue 3 powered popup interface
- Works on all web pages
- Lightweight and fast
- Modern Manifest V3 implementation

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chrome-inpect-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build:chrome
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:chrome` - Build and prepare for Chrome extension
- `npm run preview` - Preview production build

### Project Structure

```
chrome-inpect-ai/
├── src/
│   ├── components/
│   │   └── InspectorPopup.vue    # Main popup component
│   ├── composables/
│   │   └── useInspectorConfig.js # Configuration composable
│   └── main.js                   # Vue app entry point
├── background.js                 # Service worker
├── content.js                    # Content script
├── content.css                   # Content styles
├── popup.html                    # Extension popup HTML
├── manifest.json                 # Chrome extension manifest
└── icons/                        # Extension icons
```

## Usage

1. Click the Element Inspector icon in your Chrome toolbar
2. The popup will open with the inspection interface
3. Use the Vue-powered interface to inspect elements on the current page

## Permissions

This extension requires the following permissions:
- `activeTab` - Access to the current active tab
- `storage` - Local storage for configuration

## Technologies Used

- Vue 3 - Frontend framework
- Vite - Build tool and development server
- Chrome Extension Manifest V3

## Version

Current version: 1.0.0

## License

[Add your license information here]
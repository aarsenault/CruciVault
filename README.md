# Tao Wallet

A crypto wallet browser extension for the Bittensor network, built with React, TypeScript, Vite, Tailwind CSS, and components from shadcdn.

## Features

- Generate and restore Bittensor wallets
- Securely encrypt and store mnemonics
- Modern, responsive popup UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

This will start the Vite dev server. Open the provided local URL in your browser to preview the popup UI.

### Build for production

```bash
npm run build
```

The production-ready extension will be output to the `dist/` directory.

### Load as a browser extension (Chromium-based browsers)

1. Build the project as above (`npm run build`).
2. Open your browser and go to `chrome://extensions/`.
3. Enable "Developer mode" (toggle in the top right).
4. Click "Load unpacked" and select the `dist/` folder in this project.
5. The Tao Wallet extension should now appear in your extension list. Click its icon to open the popup.

### Lint the code

```bash
npm run lint
```

## Hot Reloading for Extension Development

This project supports automatic extension reloading in Chrome during development using [crx-hotreload](https://github.com/xpl/crx-hotreload).

### How it works
- Any time you change your code, the extension will rebuild and automatically reload itself in Chrome—no need to click the reload button manually.

### Setup (already configured)
- `crx-hotreload.js` is included and copied to the build output.
- The background script imports it for hot reload support.

### Usage
1. Run the watcher to continuously build to `dist/`:
   ```bash
   npm run watch
   ```
2. Load the `dist` folder as an unpacked extension in Chrome (`chrome://extensions/`).
3. When you make changes, the extension will reload itself automatically in Chrome.

If you encounter issues, see the [crx-hotreload documentation](https://github.com/xpl/crx-hotreload) for troubleshooting.

## Project Structure

- `src/` — React source code
- `public/` — Static assets and extension manifest
- `dist/` — Production build output

## License

MIT

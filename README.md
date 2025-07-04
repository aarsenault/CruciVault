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

## Project Structure

- `src/` — React source code
- `public/` — Static assets and extension manifest
- `dist/` — Production build output

## License

MIT

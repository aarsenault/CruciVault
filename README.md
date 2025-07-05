# CruciVault

A secure Bittensor wallet browser extension.

## Features

- Generate and restore Bittensor wallets
- Secure password protection
- Extension auto-locks after a user specified period of inactivity.
- Send and receive TAO (coming soon)
- View transaction history (coming soon)

## UI Screenshots

### Onboarding Flow
#### Welcome Screen
[Screenshot of the initial welcome screen]

#### Security Warning
[Screenshot of the security warning step]

#### Wallet Generation
[Screenshot of the wallet generation step with seed phrase]

#### Seed Phrase Validation
[Screenshot of the seed phrase validation step]

#### Password Setup
[Screenshot of the password creation step]

### Main Application
#### Wallet Home
[Screenshot of the main wallet home screen with balance and address]

#### Send Transaction
[Screenshot of the send transaction interface]

#### Transaction History
[Screenshot of the transaction history view]

#### Settings
[Screenshot of the settings panel with auto-lock configuration]

### Security
#### Lock Screen
[Screenshot of the wallet lock screen with password input]

#### Logout Confirmation
[Screenshot of the logout confirmation dialog]

## UI

### Sidebar vs Popup

This extension loads in a sidebar rather than a popup. This has many benefits:
 - Allows the user to navigate, click on, and interact with pages without forcing the popup closed. Clicking on links from within the extension does not close the extension and can be read simultaneously.
 - Allows the user to define the width and side of the browser they prefer
 - Makes the UI less cramped
 - Replicates a form factor which could easily be duplicated on a mobile device.

### Navigation
- **Onboarding Stepper**: The user is guided through the onboarding flow with a custom stepper.
- **Swipe Navigation**: In the main wallet state, you can navigate between different sections (Home, Send, Transactions, Settings) by swiping left or right on the screen. This provides an intuitive touch-based navigation experience alongside the traditional navigation menu.

## Security

### Locking & Security

- **Auto-lock:** The app automatically locks after a configurable period of inactivity (default: 5 minutes).
- **Auto-lock Timer Setting:** Users can adjust the auto-lock timer in the Settings panel. This allows customization based on security preferences and usage patterns.
- **Mnemonic security:** The mnemonic is never kept in memory when locked, and is only restored after successful unlock.
- **Manual lock:** The user can lock the app at any time from the navigation bar.

### Seed Phrase Protection

- **Fake Display Protection**: When the mnemonic is in "hidden" state, the wallet displays fake text instead of the actual seed phrase. This prevents accidental exposure through browser developer tools, screen captures, or other inspection methods.
- **Explicit Reveal**: The real seed phrase is only displayed when the user explicitly clicks the reveal button, providing an additional layer of security.

### Browser Extension Security

- **Manifest V3**: Built using Chrome's latest extension manifest version with strict Content Security Policy (CSP) for enhanced security.
- **WASM Support**: Requires `wasm-unsafe-eval` in CSP to support cryptographic operations via WebAssembly for optimal performance and security.
- **Chrome API Storage**: All sensitive data is stored locally within the extension's secure context. Less secure settings (wallet labels etc.) are stored in extensions sync settings and can be retrieved if the user logs in via another device.

### Dependency Security

- **Pinned Package Versions**: All Polkadot cryptographic packages are pinned to exact versions to prevent supply chain attacks and ensure reproducible builds. By removing version ranges (^), malicious code cannot be introduced through automatic package updates. This is especially important as we are allowing WASM eval in our csp.
- **Audit Trail**: Specific versions can be audited and verified, providing transparency about exactly what code is running.
- **Controlled Updates**: Any future updates to critical cryptographic dependencies require explicit review and approval.


### Password Strength Requirements

CruciVault uses **zxcvbn** library to measure password strength and enforce security requirements.

#### Strength Levels
- **Minimum Score**: Passwords must achieve a score of **3 (Good)** or higher
- **Real-time Feedback**: Strength is evaluated as you type
- **Detailed Suggestions**: Specific recommendations for improvement
- **Warning Messages**: Alerts about common weak patterns i.e. repeated words or common passwords

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

This will start the Vite dev server and auto reload when changes are detected. To load them in the extension refresh it from `chrome://extensions`

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
5. The CruciVault extension should now appear in your extension list. Pin the icon, and click it to open the extension sidebar.

### Lint the code

```bash
npm run lint
```



## Architecture Decisions

### Project Structure

- `src/` — React source code
- `public/` — Static assets and extension manifest
- `dist/` — Production build output



### Routing Architecture

**Conditional Route Rendering** based on wallet state:

- **No Wallet**: Shows onboarding flow at root path `/`
- **Wallet Locked**: Shows lock screen with all routes redirecting to `/lock`
- **Wallet Unlocked**: Shows main app routes (`/home`, `/send`, `/transactions`, `/settings`)
- **Smart Navigation**: Automatic redirection based on wallet state changes

### Storage Architecture

**Dual Storage Strategy** for security and convenience:

- **Chrome Storage Local**: Sensitive data (encrypted mnemonics) - device-specific, not synced
- **Chrome Storage Sync**: Non-sensitive data (wallet labels, settings) - synced across devices
- **Automatic Separation**: Storage utility automatically routes data based on sensitivity

### Cryptographic Architecture

**Industry-standard encryption** for mnemonic protection:

- **PBKDF2**: Password-based key derivation with 100,000 iterations for brute-force resistance
- **AES-GCM**: Authenticated encryption for confidentiality and integrity
- **Random Salt/IV**: Unique salt and initialization vector for each encryption
- **Base64 Encoding**: Standard encoding for storage compatibility

### Component Architecture

**Modular Design** with clear separation of concerns:

- **Layout Component**: Handles navigation visibility and background effects
- **AppRouter**: Manages route rendering based on application state
- **OnboardingStepper**: Multi-step flow with state preservation between steps
- **Security Components**: Lock screen and security dialogs with consistent UX

### Development Architecture

**TypeScript-first** with modern tooling:

- **Path Aliases**: Clean imports using `@/`, `components/`, `lib/` aliases
- **Vite Build**: Fast development with hot reload for extension development
- **Chrome Extension APIs**: Manifest V3 with strict CSP for security
- **Component Library**: Reusable UI components with consistent styling

### Component Libraries & Dependencies

**Modern UI Stack** built for security and user experience:

- **shadcn/ui**: Primary component library with "new-york" style variant, providing Button, Input, Dialog, Card, Tooltip, Progress, Stepper, and Navigation Menu components
- **Radix UI**: Headless UI primitives for accessibility (Dialog, Navigation Menu, Progress, Slot, Tooltip)
- **Lucide React**: Modern icon library used throughout the application for consistent visual language
- **Tailwind CSS v4**: Utility-first CSS framework with custom neutral theme and CSS variables

**Blockchain & Cryptography**:

- **Polkadot Ecosystem**: `@polkadot/api`, `@polkadot/keyring`, `@polkadot/react-identicon`, `@polkadot/util-crypto`, `@polkadot/wasm-crypto` for Bittensor network interaction
- **Cryptography**: `@scure/bip39`, `bip39`, `zxcvbn` for mnemonic generation and password strength evaluation

**Visual Effects & Development**:

- **Three.js & Vanta**: 3D graphics and animated background effects
- **React 19.1.0**: Latest React with TypeScript and React Router DOM 7.6.3
- **Build Tools**: Vite with React plugin, TypeScript 5.8.3, ESLint, PostCSS

## TODO

### Testing & Quality

- **Unit Tests**: Implement comprehensive test suite for components and utilities
- **ESLint Errors**: Remove remaining ESLint errors and warnings

### Code Quality & Refactoring

- **DRY Principle**: There are examples in the code which for the sake of time have not yet been made DRY (e.g., logout warnings) into reusable components and should not be duplicated as they currently are.
- **Custom Hooks**: Abstract these areas of common functionality into custom hooks for better reusability
- **Component Abstraction**: Extract repeated patterns into dedicated components

### Features & Functionality

- **Transaction History**: Complete and wire up transaction history functionality (started but not fully implemented)
- **Import Wallet**: Create login flow for existing wallet restoration
- **Send Flow**: Configure and implement the send transaction functionality

### UI/UX Improvements

- **State Change Flashes**: Fix occasional UI flashes that occur during state transitions
- **Visual Polish**: Improve overall user experience and visual consistency

## License

MIT

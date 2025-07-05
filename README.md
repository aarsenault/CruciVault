# CruciVault

A secure Bittensor wallet browser extension.

## Features

- Generate and restore Bittensor wallets
- Secure password protection
- Extension auto-locks after a user specified period of inactivity.
- Send and receive TAO (coming soon)
- View transaction history (coming soon)

## UI Walkthrough

### Onboarding Flow

#### Welcome Screen
<img width="400" alt="Welcome Screen" src="https://github.com/user-attachments/assets/d1c98ca0-33d1-49e6-b7a5-dab37190d486" />

#### Security Warning
<img width="400" alt="Security Warning" src="https://github.com/user-attachments/assets/3f93b6fe-8ec6-473f-afa8-9b325c2ab9d3" />

#### Seed Phrase Generation
<img width="400" alt="Seed Phrase Generation" src="https://github.com/user-attachments/assets/19914dc7-6b70-4010-a8c3-4229129bdd65" />

#### Seed Phrase Validation
<img width="400" alt="Seed Phrase Validation" src="https://github.com/user-attachments/assets/3f3e1020-75a0-4714-bedf-c88fabbfdbd8" />

#### Password Setup
<div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0;">
  <img width="300" alt="Password Setup - Step 1" src="https://github.com/user-attachments/assets/9b30cf58-2075-47df-8ab0-47346eb8394c" />
  <img width="300" alt="Password Setup - Step 2" src="https://github.com/user-attachments/assets/c9e46255-dc32-4440-8983-771052c01444" />
  <img width="300" alt="Password Setup - Step 3" src="https://github.com/user-attachments/assets/17d268ea-444a-4c32-a97a-4cfe840a403e" />
  <img width="300" alt="Password Setup - Step 4" src="https://github.com/user-attachments/assets/1d359cb4-0c47-4dff-8bc4-0b9c0189b53a" />
</div>

### Main Application

#### Wallet Home
<img width="400" alt="Wallet Home" src="https://github.com/user-attachments/assets/b987423f-1ce9-4c5d-971e-a183016a43e3" />

#### Settings
<img width="400" alt="Settings" src="https://github.com/user-attachments/assets/3075a719-3913-427e-97c0-3cda028572e2" />

### Security

#### Lock Screen
<img width="400" alt="Lock Screen" src="https://github.com/user-attachments/assets/3c2b0ced-6efd-466a-8f17-fe141bc02b20" />

#### Logout Confirmation
<img width="400" alt="Logout Confirmation" src="https://github.com/user-attachments/assets/7a8be3d3-4826-4ac1-aa1f-ae464de8d030" />

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

### Folder Structure

- `src/` — React source code
- `public/` — Static assets and extension manifest
- `dist/` — Production build output

## UI

### Sidebar vs Popup

This extension loads in a sidebar rather than a popup. This has many benefits:
 - Allows the user to navigate, click on, and interact with pages without forcing the popup closed. Clicking on links from within the extension does not close the extension and can be read simultaneously.
 - Allows the user to define the width and side of the browser they prefer
 - Makes the UI less cramped
 - Replicates a form factor which could easily be duplicated on a mobile device.

### Navigation
- **Onboarding Stepper**: The user is guided through the onboarding flow with a custom stepper.
- **Swipe Navigation**: The main wallet state is goverened by react-router, you can navigate between different sections (Home, Send, Transactions, Settings) from the nav bar and navigate forward or backwards by swiping left or right on the screen as you would in a browser. This provides an intuitive touch-based navigation experience alongside the traditional navigation menu.

### Component Libraries & Dependencies

- **shadcn/ui**: Primary component library with "new-york" style variant, providing Button, Input, Dialog, Card, Tooltip, Progress, Stepper, and Navigation Menu components
- **Radix UI**: Headless UI primitives for accessibility (Dialog, Navigation Menu, Progress, Slot, Tooltip)
- **Lucide React**: Modern icon library used throughout the application for consistent visual language
- **Tailwind CSS v4**: Utility-first CSS framework with custom neutral theme and CSS variables


## Security

### Locking & Security

- **Auto-lock:** The app automatically locks after a configurable period of inactivity (default: 5 minutes).
- **Auto-lock Timer Setting:** Users can adjust the auto-lock timer in the Settings panel. This allows customization based on security preferences and usage patterns.
- **Mnemonic security:** The mnemonic is never kept in memory when locked, and is only restored after successful unlock.
- **Manual lock:** The user can lock the app at any time from the navigation bar.



### Browser Extension Security

- **Manifest V3**: Built using Chrome's latest extension manifest version with strict Content Security Policy (CSP) for enhanced security.
- **WASM Support**: Requires `wasm-unsafe-eval` in CSP to support cryptographic operations via WebAssembly for optimal performance and security.
- **Chrome API Storage**: All sensitive data is stored locally within the extension's secure context. Less secure settings (wallet labels etc.) are stored in extensions sync settings and can be retrieved if the user logs in via another device.
- **Fake Display Protection**: On the mnemonic generation page when the mnemonic is in "hidden" state, the wallet displays fake text instead of the actual seed phrase. This prevents accidental exposure through browser developer tools, screen captures, or other inspection methods.

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


### Storage Architecture

**Dual Storage Strategy** for security and convenience:

- **Chrome Storage Local**: Sensitive data (encrypted mnemonics) - device-specific, not synced across devices
- **Chrome Storage Sync**: Non-sensitive data (wallet labels, settings) - synced across devices
- **Automatic Separation**: Storage utility automatically routes data based on sensitivity

### Cryptographic Architecture

**Industry-standard encryption** for mnemonic protection:

- **PBKDF2**: Password-based key derivation with 100,000 iterations for brute-force resistance
- **AES-GCM**: Authenticated encryption for confidentiality and integrity
- **Random Salt/IV**: Unique salt and initialization vector for each encryption
- **Base64 Encoding**: Standard encoding for storage compatibility


### Development Architecture

**TypeScript-first** with modern tooling:

- **Path Aliases**: Clean imports using `@/`, `components/`, `lib/` aliases
- **Vite Build**: Fast development with hot reload for extension development
- **Chrome Extension APIs**: Manifest V3 with strict CSP for security
- **Component Libraries**: Reusable UI components with consistent styling

## TODO

remaining items to be completed next.

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

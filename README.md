# CruciVault

A secure Bittensor wallet extension for Chrome.

## Features

- Generate and restore Bittensor wallets
- Secure password protection
- Send and receive TAO
- View transaction history
- Auto-lock functionality

## UI

### Navigation
- **Swipe Navigation**: In the main wallet state, you can navigate between different sections (Home, Send, Transactions, Settings) by swiping left or right on the screen. This provides an intuitive touch-based navigation experience alongside the traditional navigation menu.

## Security

### Locking & Security

- **Auto-lock:** The app automatically locks after a configurable period of inactivity (default: 5 minutes).
- **Auto-lock Timer Setting:** Users can adjust the auto-lock timer in the Settings panel, ranging from 1 to 60 minutes. This allows customization based on security preferences and usage patterns.
- **Lock screen:** When locked, the mnemonic is removed from memory and the user must enter their password to unlock.
- **Password:** On first lock, the user sets a password. On subsequent unlocks, the password is required.
- **Mnemonic security:** The mnemonic is never kept in memory when locked, and is only restored after successful unlock.
- **Manual lock:** The user can lock the app at any time from the navigation bar.

### Seed Phrase Protection
- **Fake Display Protection**: When the mnemonic is in "hidden" state, the wallet displays fake text instead of the actual seed phrase. This prevents accidental exposure through browser developer tools, screen captures, or other inspection methods.
- **Explicit Reveal**: The real seed phrase is only displayed when the user explicitly clicks the reveal button, providing an additional layer of security.
- **Blur Effect**: Visual blurring is applied to the mnemonic display area when hidden, making it impossible to read even if partially visible.

### Browser Extension Security
- **Manifest V3**: Built using Chrome's latest extension manifest version with strict Content Security Policy (CSP) for enhanced security.
- **WASM Support**: Requires `wasm-unsafe-eval` in CSP to support cryptographic operations via WebAssembly for optimal performance and security.
- **Local Storage**: All sensitive data is stored locally within the extension's secure context.

### Dependency Security
- **Pinned Package Versions**: All Polkadot cryptographic packages are pinned to exact versions to prevent supply chain attacks and ensure reproducible builds.
- **Supply Chain Attack Prevention**: By removing version ranges (^), malicious code cannot be introduced through automatic package updates.
- **Audit Trail**: Specific versions can be audited and verified, providing transparency about exactly what code is running.
- **Controlled Updates**: Any future updates to critical cryptographic dependencies require explicit review and approval.

#### Why `wasm-unsafe-eval` is Required
The extension requires `wasm-unsafe-eval` in the Content Security Policy because:
- **Cryptographic Performance**: WebAssembly provides significantly faster cryptographic operations compared to pure JavaScript
- **Security Standards**: The Polkadot ecosystem uses WASM for cryptographic functions to meet industry security standards
- **Limited Alternative**: Pure JavaScript fallbacks are available but significantly slower and may not be suitable for production use
- **Controlled Environment**: The extension runs in a controlled environment where the WASM code is bundled with the extension itself, not loaded from external sources

**Note**: While `wasm-unsafe-eval` is required, the extension mitigates risks by:
- Using pinned, audited package versions
- Running in a controlled extension environment
- Not loading WASM from external sources
- Implementing additional security measures like fake mnemonic display

### Password Strength Requirements

CruciVault uses the industry-standard **zxcvbn** library to measure password strength and enforce security requirements.

#### Password Strength Measurement

The app evaluates passwords using multiple criteria:
- **Length**: Longer passwords are generally stronger
- **Character variety**: Mix of uppercase, lowercase, numbers, and symbols
- **Common patterns**: Avoids easily guessable sequences (123456, qwerty, etc.)
- **Dictionary words**: Checks against common word lists and variations
- **Personal information**: Identifies patterns that might be personal (dates, names, etc.)
- **Entropy**: Calculates the actual randomness and unpredictability

#### Strength Levels

Passwords are rated on a 5-point scale:
- **0 (Very Weak)**: Easily guessable, common patterns
- **1 (Weak)**: Simple patterns, short length
- **2 (Acceptable)**: Basic security, but could be stronger
- **3 (Good)**: Meets minimum security requirements
- **4 (Strong)**: High security, difficult to crack

#### Requirements

- **Minimum Score**: Passwords must achieve a score of **3 (Good)** or higher
- **Real-time Feedback**: Strength is evaluated as you type
- **Detailed Suggestions**: Specific recommendations for improvement
- **Warning Messages**: Alerts about common weak patterns

#### Creating Strong Passwords

**Do:**
- Use **12+ characters** minimum
- Mix **uppercase and lowercase** letters
- Include **numbers and symbols**
- Use **random combinations** rather than words
- Consider **passphrases** (multiple random words)
- Use a **password manager** for generation

**Don't:**
- Use personal information (birthdays, names, addresses)
- Use common patterns (123456, qwerty, password)
- Use single dictionary words
- Use keyboard patterns (asdfgh, 1qaz2wsx)
- Reuse passwords from other accounts

#### Examples

**Weak Passwords:**
- `password123` (common word + numbers)
- `123456789` (sequential numbers)
- `qwerty` (keyboard pattern)
- `john1985` (name + year)

**Strong Passwords:**
- `K9#mP$2vN8@xL5` (random characters)
- `correct horse battery staple` (random passphrase)
- `Tr0ub4dor&3` (mixed with substitutions)
- `MyC@t!sC@ll3dFluffy` (personal but complex)

#### Security Benefits

- **Brute Force Protection**: Strong passwords resist automated attacks
- **Dictionary Attack Resistance**: Avoids common word-based attacks
- **Pattern Recognition**: Prevents predictable sequences
- **Entropy Maximization**: Ensures sufficient randomness

### Best Practices
- **Never share your seed phrase** with anyone or any application
- **Keep backups** in secure, offline locations as recommended in the [Bittensor documentation](https://docs.learnbittensor.org/keys/handle-seed-phrase)
- **Use on trusted devices** only, avoiding public or shared computers
- **Regular updates** ensure you have the latest security patches

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
5. The CruciVault extension should now appear in your extension list. Click its icon to open the popup.

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

## Architecture Decisions

### Routing Architecture
The application uses React Router for navigation with a clean separation of concerns:

- **Modular Components**: Each onboarding step is a separate component for maintainability
- **Route-based State**: Uses React Router's location state to pass data between routes
- **URL-based Navigation**: Users can bookmark or share specific steps

### Navigation & Data Persistence
The onboarding flow implements intelligent navigation with data preservation:

- **Data Persistence**: When going back from validation to generate, the mnemonic is preserved
- **No Regeneration**: If returning to generate step with existing data, it won't generate a new wallet
- **Consistent UI**: All back buttons use the same styling and positioning
- **User Experience**: Users can easily navigate back to see their seed phrase during validation

### Security Architecture
Multiple layers of security are implemented throughout the application:

- **Fake Display Protection**: Shows fake text when mnemonic is hidden to prevent inspection attacks
- **Pinned Dependencies**: Critical cryptographic packages are pinned to exact versions
- **CSP Compliance**: Proper Content Security Policy configuration for Chrome extensions
- **State Management**: Sensitive data is passed through secure route state rather than global state

## License

MIT

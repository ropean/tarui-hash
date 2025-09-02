## Project Prompt: Tauri Hash256 (Professional Desktop SHA-256 Hasher)

### Overview

- **Goal**: Professional desktop utility to compute SHA-256 for files with a clean, responsive web-based UI and comprehensive features, built with Tauri for optimal performance and small binary size.
- **Tech**: Tauri 2.x (Rust backend + web frontend), React/TypeScript/Vite for UI, Tailwind CSS for styling.
- **Platforms**: Windows, macOS, Linux (64-bit) - cross-platform deployment.
- **Philosophy**: Lightweight, fast, secure, and professional - leveraging Tauri's native performance while maintaining web development ergonomics.

### Key Features

- **File Input Methods**: Drag-and-drop file hashing, browse dialog, path input with auto-completion, and URL/file path validation.
- **Live Progress Updates**: Real-time progress in window title as percentage during hashing with smooth UI updates via Rust-to-Frontend communication.
- **Cancellation Support**: Cancel button to stop hashing operations with proper state management and cleanup.
- **Hash Outputs**: Both HEX and Base64 formats with copy-to-clipboard functionality, uppercase/lowercase HEX toggle.
- **Auto-Hash**: Automatic hashing when file is selected/pasted/browsed/dropped (configurable).
- **Professional Formatting**: File sizes (bytes/KB/MB/GB), elapsed time (ms/s/m/h), throughput (B/s/KB/s/MB/s/GB/s) with thousands separators and decimal precision.
- **Comprehensive Metadata**: Shows formatted duration, size, throughput, and error feedback.
- **Application Branding**: Professional icon embedded in executable for all platforms.
- **Cross-Platform CI/CD**: GitHub Actions pipeline with automated releases and dynamic versioning.
- **Optimal Distribution**: Small single-binary executables for all target platforms.
- **Security**: Sandboxed file access through Tauri's secure APIs.

### UI/UX Requirements (Web Frontend)

- **Framework**: React 18+ with TypeScript, Vite as build tool, Tailwind CSS for styling.
- **Window**: Centered on screen, professional icon, responsive design.
- **Layout**: Clean, modern interface with proper spacing and typography.
- **Controls**:
  - Path input with validation and submit on Enter key support.
  - Browse button (opens native file dialog via Tauri API).
  - Clear button to reset all inputs and outputs.
  - Cancel button (visible only while hashing).
  - Uppercase HEX toggle.
  - Auto-hash on select toggle.
  - Copy buttons for both HEX and Base64 outputs.
- **Progress**: Visual progress bar during hashing.
- **Status Display**: Shows formatted file path, error messages, or comprehensive metadata (elapsed time, size, throughput).
- **Responsive Design**: Works well on different window sizes.
- **Dark/Light Theme**: System-aware theming with manual override options.

### Behavior & State Management

- **Hash Triggering**:
  - User presses Enter in path input.
  - Auto-hash + new path selected/pasted/browsed/dropped.
- **Progress Updates**: Stream file in chunks (4MB buffer), report bytes processed via Tauri's event system, update window title via timer.
- **Cancellation**: Cancel via Tauri's command system, stop Rust worker, clear progress, restore previous path with comprehensive state restoration.
- **State Management**: React state with proper snapshot/restore for cancel operations, optimistic updates for better UX.
- **Error Handling**: Comprehensive error feedback from Rust backend with user-friendly messages.

### Architecture (Tauri Pattern)

- **Frontend** (`src/`): React + TypeScript + Tailwind CSS
  - `App.tsx`: Main application component
  - `components/`: Reusable UI components (FileInput, HashOutput, ProgressBar, etc.)
  - `hooks/`: Custom React hooks for Tauri commands and state management
  - `utils/`: Formatting utilities and helpers
- **Backend** (`src-tauri/src/`): Rust with Tauri
  - `main.rs`: Application entry point and window setup
  - `commands.rs`: Tauri command handlers for file operations
  - `hash.rs`: SHA-256 computation logic with streaming
  - `models.rs`: Data structures for hash results and progress
- **Build Configuration**:
  - `src-tauri/tauri.conf.json`: Tauri configuration (window settings, bundle options, etc.)
  - `package.json`: Node.js dependencies and scripts
  - `vite.config.ts`: Vite configuration for frontend build

### Important Types & Interfaces

#### Frontend (TypeScript)
```typescript
interface HashResult {
  hex: string;
  base64: string;
  elapsedMs: number;
  bytes: number;
  path: string;
}

interface HashProgress {
  processed: number;
  total: number;
  percent: number;
}

interface AppState {
  pathInput: string;
  hexOutput: string;
  base64Output: string;
  isHashing: boolean;
  uppercase: boolean;
  autoHash: boolean;
  progress: HashProgress | null;
  lastResult: HashResult | null;
  error: string | null;
  previousPath: string | null;
}
```

#### Backend (Rust)
```rust
#[derive(serde::Serialize, serde::Deserialize)]
pub struct HashResult {
    pub hex: String,
    pub base64: String,
    pub elapsed_ms: u128,
    pub bytes: u64,
    pub path: String,
}

#[derive(serde::Serialize, Clone)]
pub struct HashProgress {
    pub processed: u64,
    pub total: u64,
    pub percent: u8,
}
```

### Hashing Strategy (Rust Backend)

- **Crypto Library**: Use `sha2` crate for SHA-256 computation.
- **Streaming**: Read file in chunks (4MB buffer) using `tokio::fs::File` and `tokio::io::AsyncReadExt`.
- **Progress Reporting**: Emit progress events via Tauri's event system during hashing.
- **Cancellation**: Use `tokio::sync::CancellationToken` for cooperative cancellation.
- **Error Handling**: Comprehensive error types with proper conversion to Tauri errors.
- **Performance**: Async I/O with proper buffering for optimal throughput.

```rust
// Core hashing implementation
pub async fn compute_sha256(
    file_path: &str,
    window: &tauri::Window,
    cancellation_token: &CancellationToken,
) -> Result<HashResult, String> {
    // Implementation with streaming, progress events, and cancellation
}
```

### Window & UI Integration

- **Window Title Updates**: Update title via Tauri's window API: `window.set_title()` with progress percentage.
- **File Dialog**: Use Tauri's dialog API: `tauri::api::dialog::FileDialogBuilder`.
- **Clipboard**: Use Tauri's clipboard API for cross-platform clipboard operations.
- **Drag & Drop**: Handle file drops via Tauri's webview events.
- **Icon Management**: Embed icon in binary via Tauri's bundle configuration.

### Build & Release Strategy

- **Development**: `npm run tauri dev` for hot-reloaded development.
- **Production Build**: `npm run tauri build` for optimized cross-platform binaries.
- **CI/CD**: GitHub Actions with matrix builds for Windows, macOS, Linux.
- **Versioning**: Dynamic versioning from git tags, automatic release creation.
- **Distribution**: Single executable files per platform with embedded resources.
- **Size Optimization**: Framework-dependent builds, tree shaking, and minification.

### Tauri Configuration (`tauri.conf.json`)

```json
{
  "productName": "Tauri Hash256",
  "version": "1.0.0",
  "identifier": "com.taurihash.app",
  "bundle": {
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": null
    },
    "icon": [
      "assets/32x32.png",
      "assets/128x128.png",
      "assets/128x128@2x.png",
      "assets/icon.icns",
      "assets/icon.ico"
    ]
  },
  "window": {
    "title": "Tauri Hash256",
    "width": 800,
    "height": 600,
    "resizable": true,
    "center": true
  }
}
```

### Dependencies & Libraries

#### Frontend (`package.json`)
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "vite": "^5.0.0"
  }
}
```

#### Backend (`Cargo.toml`)
```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open"] }
tokio = { version = "1.0", features = ["full"] }
sha2 = "0.10"
hex = "0.4"
base64 = "0.21"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### File Structure Template

```
tauri-hash/
├── src/                    # Frontend (React/TypeScript)
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── FileInput.tsx
│   │   ├── HashOutput.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useHash.ts
│   │   └── useSettings.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── types/
│       └── index.ts
├── src-tauri/              # Backend (Rust/Tauri)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── hash.rs
│   │   └── models.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── assets/                  # Application icons
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── 128x128@2x.png
│   ├── icon.icns
│   └── icon.ico
├── .github/
│   └── workflows/
│       └── release.yml
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Constraints & Style Guidelines

- **Frontend**: Modern React patterns, functional components with hooks, TypeScript strict mode.
- **Backend**: Async Rust with proper error handling, idiomatic Tauri patterns.
- **Code Quality**: ESLint, Prettier, Clippy for consistent formatting.
- **Performance**: Minimize bundle size, optimize re-renders, efficient Rust algorithms.
- **Security**: Follow Tauri's security best practices, validate all inputs.
- **Documentation**: JSDoc for TypeScript, rustdoc for Rust, comprehensive README.

### Current Implementation Status

✅ **Implemented Features:**
- Basic Tauri setup with React frontend
- File selection and drag-drop support
- SHA-256 computation with streaming
- Progress reporting via Tauri events
- Basic UI with Tailwind styling
- Cross-platform build configuration
- GitHub Actions CI/CD pipeline

### Future Enhancements (Optional)

- **Multiple Algorithms**: Support for SHA-1, SHA-512, BLAKE3, etc.
- **Batch Processing**: Multiple file hashing with queue management
- **Hash Verification**: Compare against known checksums
- **Settings Persistence**: Remember user preferences
- **File Integrity Monitoring**: Watch directories for changes
- **Export Results**: Save hash results to file
- **Portable Mode**: Run from USB drives
- **Command-line Interface**: CLI companion for automation
- **Plugin System**: Extensible architecture for custom hashers

### Migration Notes from C# Version

This Tauri version should maintain feature parity with the original C# WPF application while leveraging:
- **Better Performance**: Rust's native speed vs .NET runtime
- **Smaller Binaries**: Single executables without runtime dependencies
- **Cross-Platform**: Native Windows, macOS, and Linux support
- **Modern Web UI**: Better styling and theming capabilities
- **Security**: Tauri's sandboxed approach to file system access

The core logic (4MB buffer streaming, progress reporting, cancellation, formatting) should be directly portable from the C# implementation to maintain consistency.

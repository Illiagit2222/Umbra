<div align="center">
<img width="1920" height="1080" alt="main-banner" src="https://github.com/user-attachments/assets/e20f0928-c618-4f06-a755-de875396f024" />
</div>

# Umbra

A minimalist, highly customizable search launcher for Windows, built with Rust and Tauri.

[![Download Umbra](https://img.shields.io/badge/Download-Umbra_Beta-black?style=for-the-badge&logo=windows)](https://github.com/spectrvm1337/Umbra/releases/latest)

## Features

<div align="center">
<img width="1920" height="1080" alt="instantsearch-banner" src="https://github.com/user-attachments/assets/c15a863a-fbb1-45c3-a232-f1e45abc79ba" />
</div>

**Instant Search**  
Find applications, files, and folders across your system without delay. Fast indexing ensures your results are immediately available.

**Built-in Tools**  
Integrated utilities including a calculator, color picker, dictionary, and seamless web search.

**Workflow Integration**  
Pin frequently used items directly in the launcher. Drag and drop files straight from the search results to other applications.

<div align="center">
<img width="1920" height="1080" alt="themes-banner" src="https://github.com/user-attachments/assets/1d62bb45-786b-4f7f-b6a4-0f452294d602" />
</div>

**Deep Customization**  
Adjust themes, accent colors, window scaling, and hotkeys. Umbra adapts to your visual preferences with a polished, fluid design system.

**High Performance**  
Powered by a native Rust backend. Minimal CPU and memory footprint, keeping your system fast.

## Installation

1. Navigate to the [Releases](https://github.com/spectrvm1337/Umbra/releases) page.
2. Download the latest installer (`Umbra_x64-setup.exe`) or the portable executable (`umbra.exe`).
3. Run the application. Use the default hotkey (`Alt + Space`) to summon the search interface.

## Development

Umbra is built with Node.js and Rust.

### Prerequisites

- Node.js
- Rust toolchain
- Tauri prerequisites for Windows

### Build Instructions

```bash
git clone https://github.com/spectrvm1337/Umbra.git
cd Umbra
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## License

Available under the [MIT License](LICENSE).

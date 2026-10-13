<div align="center">

<img width="1200" height="630" alt="main-banner" src="https://github.com/user-attachments/assets/f8a0ae03-8a41-4d4b-894d-0199e5d1ce64" />

</div>

A minimalist, highly customizable search launcher for Windows, built with Rust and Tauri.

[![Download Umbra](https://img.shields.io/badge/Download-Umbra_Beta-black?style=for-the-badge&logo=windows)](https://github.com/spectrvm1337/Umbra/releases/latest)

## Features

<div align="center">

<img width="1200" height="400" alt="instantsearch-banner" src="https://github.com/user-attachments/assets/bc9ede95-281b-4ad8-9191-cbce91ac8d31" />

</div>

**Instant Search**  

Find applications, files, and folders across your system without delay. Fast indexing ensures your results are immediately available.

**Built-in Tools**  

Integrated utilities including power controls through text (`shutdown`, `restart`, `sleep`), process killing (`kill <name>`) and seamless web search (`!g`, `!yt`, `!gh` and more — type `!help`).

**Workflow Integration**  

Pin frequently used items directly in the launcher. Drag and drop files straight from the search results to other applications.

<div align="center">

<img width="1200" height="400" alt="themes-banner" src="https://github.com/user-attachments/assets/bee0429c-62c8-448a-83ba-b12eb6d5b2e8" />

</div>

**Deep Customization**  

Adjust themes, accent colors, window scaling, and hotkeys. Umbra adapts to your visual preferences with a polished, fluid design system.

**High Performance**  

Powered by a native Rust backend. Minimal CPU and memory footprint, keeping your system fast.

## Installation

1. Navigate to the [Releases](https://github.com/spectrvm1337/Umbra/releases) page.

2. Download the latest installer (`Umbra_x64-setup.exe`) or the portable executable (`umbra.exe`).

3. Run the application. Use the default hotkey (`Alt + Space`) to summon the search interface.

Updates are checked from inside the app: **Settings → Check for updates**. When a newer release

exists, the installer downloads in the background and the button turns into **Install & restart**.

## Where Umbra stores things

Everything lives in a single folder: `%APPDATA%\.Umbra-config`

| File | Purpose |

| --- | --- |

| `config.json` | Settings, theme, hotkey, indexing filters |

| `pins.json` | Pinned launcher entries and their order |

| `frecency_stats.json` | Per-item usage scores used for ranking |

| `themes\*.css` | Your custom themes (see [THEMES.md](THEMES.md)) |

Installations from before 0.1.3 used `%APPDATA%\SpotlightSearch`; those files are copied over

automatically on first launch and the old folder is left untouched.

## Development

Umbra is built with Node.js and Rust. The frontend is plain HTML/CSS/JS — there is no bundler,

so `src\` is served as-is.

### Prerequisites

- Node.js

- Rust toolchain

- [Tauri prerequisites for Windows](https://tauri.app/start/prerequisites/)

### Build Instructions

```bash

git clone https://github.com/spectrvm1337/Umbra.git

cd Umbra

npm install

# Run in development mode

npm run dev

# Build for production

npm run build

# Faster build, unoptimised binary

npm run build:fast

```

Run the Rust unit tests with:

```bash

cargo test --manifest-path src-tauri/Cargo.toml

```

## License

Available under the [MIT License](LICENSE).

@echo off
cd /d "C:\Users\Freezx\Downloads\search"
echo Building debug...
cargo tauri build --debug
echo.
echo Build complete.
pause
//! Screen eyedropper for the colour widget: while picking, a low-level mouse hook
//! swallows the next click, and a 15x15 px square around the cursor is captured
//! ~30 times a second and sent to the page as `color-pick` events.
use std::sync::atomic::{AtomicBool, AtomicU8, Ordering};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use windows_sys::Win32::Foundation::{LPARAM, LRESULT, POINT, WPARAM};
use windows_sys::Win32::Graphics::Gdi::{
    BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC, GetDIBits,
    ReleaseDC, SelectObject, BITMAPINFO, BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS, HGDIOBJ, SRCCOPY,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CallNextHookEx, DispatchMessageW, GetCursorPos, GetMessageW, KillTimer, SetTimer,
    SetWindowsHookExW, TranslateMessage, UnhookWindowsHookEx, MSG, WH_MOUSE_LL, WM_LBUTTONDOWN,
    WM_LBUTTONUP, WM_RBUTTONDOWN, WM_RBUTTONUP, WM_TIMER,
};

/// Side of the captured square, in screen pixels. Odd, so there is a centre pixel.
pub const GRID: i32 = 15;
const FRAME_MS: u32 = 33;
const GIVE_UP_AFTER: Duration = Duration::from_secs(60);

const PENDING: u8 = 0;
const PICKED: u8 = 1;
const CANCELLED: u8 = 2;

static PICKING: AtomicBool = AtomicBool::new(false);
static OUTCOME: AtomicU8 = AtomicU8::new(PENDING);

#[derive(Clone, serde::Serialize)]
struct Frame {
    /// GRID x GRID colours, row by row, as "#rrggbb".
    pixels: Vec<String>,
    /// The centre pixel: the colour that a click would pick.
    color: String,
    done: bool,
    cancelled: bool,
}

/// True while the eyedropper is active; the window must not hide on focus loss then.
pub fn is_picking() -> bool {
    PICKING.load(Ordering::SeqCst)
}

/// Top-down 32-bit BGRA rows from GetDIBits -> "#rrggbb" per pixel.
fn bgra_to_hex(buf: &[u8]) -> Vec<String> {
    buf.chunks_exact(4)
        .map(|p| format!("#{:02x}{:02x}{:02x}", p[2], p[1], p[0]))
        .collect()
}

fn center(pixels: &[String]) -> String {
    pixels.get(pixels.len() / 2).cloned().unwrap_or_else(|| "#000000".into())
}

unsafe fn capture_around_cursor() -> Option<Vec<String>> {
    let mut pt = POINT { x: 0, y: 0 };
    if GetCursorPos(&mut pt) == 0 {
        return None;
    }
    let screen = GetDC(std::ptr::null_mut());
    if screen.is_null() {
        return None;
    }
    let mem = CreateCompatibleDC(screen);
    let bmp = CreateCompatibleBitmap(screen, GRID, GRID);
    let old = SelectObject(mem, bmp as HGDIOBJ);
    BitBlt(mem, 0, 0, GRID, GRID, screen, pt.x - GRID / 2, pt.y - GRID / 2, SRCCOPY);
    let mut info: BITMAPINFO = std::mem::zeroed();
    info.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    info.bmiHeader.biWidth = GRID;
    info.bmiHeader.biHeight = -GRID; // top-down rows
    info.bmiHeader.biPlanes = 1;
    info.bmiHeader.biBitCount = 32;
    info.bmiHeader.biCompression = BI_RGB;
    let mut buf = vec![0u8; (GRID * GRID * 4) as usize];
    let lines = GetDIBits(mem, bmp, 0, GRID as u32, buf.as_mut_ptr() as _, &mut info, DIB_RGB_COLORS);
    SelectObject(mem, old);
    DeleteObject(bmp as HGDIOBJ);
    DeleteDC(mem);
    ReleaseDC(std::ptr::null_mut(), screen);
    (lines > 0).then(|| bgra_to_hex(&buf))
}

unsafe extern "system" fn mouse_proc(code: i32, w_param: WPARAM, l_param: LPARAM) -> LRESULT {
    if code >= 0 && PICKING.load(Ordering::SeqCst) {
        match w_param as u32 {
            WM_LBUTTONDOWN => {
                let _ = OUTCOME.compare_exchange(PENDING, PICKED, Ordering::SeqCst, Ordering::SeqCst);
                return 1;
            }
            WM_RBUTTONDOWN => {
                let _ = OUTCOME.compare_exchange(PENDING, CANCELLED, Ordering::SeqCst, Ordering::SeqCst);
                return 1;
            }
            // The matching button-up must not reach the window under the cursor either.
            WM_LBUTTONUP | WM_RBUTTONUP => return 1,
            _ => {}
        }
    }
    CallNextHookEx(std::ptr::null_mut(), code, w_param, l_param)
}

fn run(app: AppHandle) {
    unsafe {
        let hook = SetWindowsHookExW(WH_MOUSE_LL, Some(mouse_proc), std::ptr::null_mut(), 0);
        if hook.is_null() {
            PICKING.store(false, Ordering::SeqCst);
            let _ = app.emit("color-pick", Frame { pixels: vec![], color: String::new(), done: true, cancelled: true });
            return;
        }
        let timer = SetTimer(std::ptr::null_mut(), 0, FRAME_MS, None);
        let started = Instant::now();
        let mut last = Vec::new();
        let mut msg: MSG = std::mem::zeroed();
        while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
            if msg.message == WM_TIMER {
                if started.elapsed() > GIVE_UP_AFTER {
                    let _ = OUTCOME.compare_exchange(PENDING, CANCELLED, Ordering::SeqCst, Ordering::SeqCst);
                }
                if OUTCOME.load(Ordering::SeqCst) != PENDING {
                    break;
                }
                if let Some(pixels) = capture_around_cursor() {
                    let color = center(&pixels);
                    let _ = app.emit("color-pick", Frame { pixels: pixels.clone(), color, done: false, cancelled: false });
                    last = pixels;
                }
                continue;
            }
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
        KillTimer(std::ptr::null_mut(), timer);
        // Keep swallowing the button-up that follows the picking click.
        std::thread::sleep(Duration::from_millis(150));
        UnhookWindowsHookEx(hook);
        PICKING.store(false, Ordering::SeqCst);
        let cancelled = OUTCOME.load(Ordering::SeqCst) != PICKED;
        let color = if cancelled { String::new() } else { center(&last) };
        let _ = app.emit("color-pick", Frame { pixels: last, color, done: true, cancelled });
    }
}

#[tauri::command]
pub fn start_color_pick(app: AppHandle) -> bool {
    if PICKING.swap(true, Ordering::SeqCst) {
        return false;
    }
    OUTCOME.store(PENDING, Ordering::SeqCst);
    std::thread::spawn(move || run(app));
    true
}

#[tauri::command]
pub fn cancel_color_pick() {
    let _ = OUTCOME.compare_exchange(PENDING, CANCELLED, Ordering::SeqCst, Ordering::SeqCst);
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn converts_bgra_rows_to_hex() {
        assert_eq!(bgra_to_hex(&[0x39, 0x39, 0xc8, 0xff, 0x00, 0x80, 0xff, 0x00]), vec!["#c83939", "#ff8000"]);
    }
    #[test]
    fn the_centre_pixel_is_the_picked_colour() {
        let pixels: Vec<String> = (0..(GRID * GRID)).map(|i| format!("#{:06x}", i)).collect();
        assert_eq!(center(&pixels), format!("#{:06x}", GRID * GRID / 2));
    }
}

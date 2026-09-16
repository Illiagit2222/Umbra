

use std::ffi::c_void;

type HWND = *mut c_void;

const ABM_GETSTATE: u32 = 0x00000004;
const ABS_AUTOHIDE: usize = 1;

#[repr(C)]
struct APPBARDATA {
    cb_size: u32,
    hwnd: HWND,
    callback_message: u32,
    u_callback: usize,
    rc: [i32; 4],
    l_param: isize,
}

extern "system" {
    fn FindWindowW(class_name: *const u16, window_name: *const u16) -> HWND;
    fn SetWindowPos(hwnd: HWND, insert_after: HWND, x: i32, y: i32, cx: i32, cy: i32, flags: u32) -> i32;
    fn SHAppBarMessage(message: u32, data: *mut APPBARDATA) -> usize;
}

const HWND_TOPMOST: HWND = -1isize as HWND;
const SWP_NOMOVE: u32 = 0x0002;
const SWP_NOSIZE: u32 = 0x0001;
const SWP_SHOWWINDOW: u32 = 0x0040;

pub fn show_if_autohide() {
    unsafe {
        let class_name: [u16; 14] = [
            b'S' as u16, b'h' as u16, b'e' as u16, b'l' as u16, b'l' as u16,
            b'_' as u16, b'T' as u16, b'r' as u16, b'a' as u16, b'y' as u16,
            b'W' as u16, b'n' as u16, b'd' as u16, 0,
        ];
        let tray: HWND = FindWindowW(class_name.as_ptr(), std::ptr::null());
        if tray.is_null() {
            return;
        }

        let mut data: APPBARDATA = std::mem::zeroed();
        data.cb_size = std::mem::size_of::<APPBARDATA>() as u32;
        let state = SHAppBarMessage(ABM_GETSTATE, &mut data);

        if state & ABS_AUTOHIDE == 0 {
            return;
        }

        SetWindowPos(tray, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
    }
}

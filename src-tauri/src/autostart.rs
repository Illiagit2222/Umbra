

const RUN_KEY: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";
const VALUE_NAME: &str = "SpotlightSearch";

#[cfg(target_os = "windows")]
fn current_reg_value() -> Option<String> {
    use windows_sys::Win32::System::Registry::*;

    unsafe {
        let subkey: Vec<u16> = RUN_KEY
            .encode_utf16()
            .chain(std::iter::once(0))
            .collect();
        let name: Vec<u16> = VALUE_NAME
            .encode_utf16()
            .chain(std::iter::once(0))
            .collect();

        let mut hkey: HKEY = std::ptr::null_mut();
        let res = RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_READ, &mut hkey);
        if res != 0 || hkey.is_null() {
            return None;
        }
        let mut value_type: u32 = 0;
        let mut data_size: u32 = 0;
        let check = RegQueryValueExW(
            hkey,
            name.as_ptr(),
            std::ptr::null_mut(),
            &mut value_type,
            std::ptr::null_mut(),
            &mut data_size,
        );
        let out = if check == 0 && value_type == REG_SZ && data_size > 0 {
            let mut buf = vec![0u8; data_size as usize];
            let mut sz = data_size;
            let read = RegQueryValueExW(
                hkey,
                name.as_ptr(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                buf.as_mut_ptr(),
                &mut sz,
            );
            if read == 0 {
                let u16buf: Vec<u16> = buf
                    .chunks_exact(2)
                    .map(|c| u16::from_le_bytes([c[0], c[1]]))
                    .take_while(|&c| c != 0)
                    .collect();
                Some(String::from_utf16_lossy(&u16buf))
            } else {
                None
            }
        } else {
            None
        };
        RegCloseKey(hkey);
        out
    }
}

pub fn is_enabled() -> bool {
    #[cfg(target_os = "windows")]
    {
        match (current_reg_value(), std::env::current_exe()) {
            (Some(v), Ok(p)) => {
                let p = p.to_string_lossy().to_string();
                v == p || v == format!("\"{}\"", p)
            }

            (Some(_), Err(_)) => true,
            _ => false,
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

pub fn set_enabled(enable: bool) {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::System::Registry::*;

        if !enable {
            unsafe {
                let subkey: Vec<u16> = RUN_KEY
                    .encode_utf16()
                    .chain(std::iter::once(0))
                    .collect();
                let name: Vec<u16> = VALUE_NAME
                    .encode_utf16()
                    .chain(std::iter::once(0))
                    .collect();
                let mut hkey: HKEY = std::ptr::null_mut();
                let res = RegOpenKeyExW(
                    HKEY_CURRENT_USER,
                    subkey.as_ptr(),
                    0,
                    KEY_READ | KEY_SET_VALUE,
                    &mut hkey,
                );
                if res == 0 && !hkey.is_null() {
                    RegDeleteValueW(hkey, name.as_ptr());
                    RegCloseKey(hkey);
                }
            }
            return;
        }
        ensure_autostart();
    }
    #[allow(unreachable_code)]
    {
        let _ = enable;
    }
}

pub fn ensure_autostart() {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::System::Registry::*;

        unsafe {
            let exe_path = match std::env::current_exe() {
                Ok(p) => p,
                Err(_) => return,
            };
            let path_str = exe_path.to_string_lossy().to_string();
            
            let reg_value = if path_str.contains(' ') {
                format!("\"{}\"", path_str)
            } else {
                path_str.clone()
            };
            let wide: Vec<u16> = reg_value.encode_utf16().chain(std::iter::once(0)).collect();

            let subkey: Vec<u16> = "Software\\Microsoft\\Windows\\CurrentVersion\\Run"
                .encode_utf16()
                .chain(std::iter::once(0))
                .collect();

            let mut hkey: HKEY = std::ptr::null_mut();
            let res = RegOpenKeyExW(
                HKEY_CURRENT_USER,
                subkey.as_ptr(),
                0,
                KEY_READ | KEY_SET_VALUE,
                &mut hkey,
            );
            if res == 0 && !hkey.is_null() {
                let name: Vec<u16> = "SpotlightSearch"
                    .encode_utf16()
                    .chain(std::iter::once(0))
                    .collect();
                let mut value_type: u32 = 0;
                let mut data_size: u32 = 0;
                let check_res = RegQueryValueExW(
                    hkey,
                    name.as_ptr(),
                    std::ptr::null_mut(),
                    &mut value_type,
                    std::ptr::null_mut(),
                    &mut data_size,
                );

                let mut existing_matches = false;
                if check_res == 0 && value_type == REG_SZ && data_size > 0 {
                    let mut buf = vec![0u8; data_size as usize];
                    let mut sz = data_size;
                    let read_res = RegQueryValueExW(
                        hkey,
                        name.as_ptr(),
                        std::ptr::null_mut(),
                        std::ptr::null_mut(),
                        buf.as_mut_ptr(),
                        &mut sz,
                    );
                    if read_res == 0 {
                        let u16buf: Vec<u16> = buf
                            .chunks_exact(2)
                            .map(|c| u16::from_le_bytes([c[0], c[1]]))
                            .take_while(|&c| c != 0)
                            .collect();
                        let existing = String::from_utf16_lossy(&u16buf);
                        existing_matches = existing == reg_value;
                    }
                }

                let should_write = check_res != 0 || value_type != REG_SZ || !existing_matches;

                if should_write {
                    RegSetValueExW(
                        hkey,
                        name.as_ptr(),
                        0,
                        REG_SZ,
                        wide.as_ptr() as *const u8,
                        (wide.len() * 2) as u32,
                    );
                }
                RegCloseKey(hkey);
            }
        }
    }
}

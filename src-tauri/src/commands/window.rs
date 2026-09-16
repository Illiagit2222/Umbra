

use tauri::Manager;

#[tauri::command]
pub fn hide_window(app: tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.hide();
    }
}

#[tauri::command]
pub fn hide_chat_window(app: tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("chat") {
        let _ = w.hide();
    }
}

pub fn place_chat_window(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("chat") else {
        return;
    };
    let (align, mon_idx) = config::get_placement();
    let monitors = window.available_monitors().unwrap_or_default();
    let mon = if mon_idx >= 0 {
        monitors.get(mon_idx as usize).cloned()
    } else {
        None
    }
    .or_else(|| window.current_monitor().ok().flatten())
    .or_else(|| window.primary_monitor().ok().flatten());
    let Some(mon) = mon else { return };

    let scale = window.scale_factor().unwrap_or(1.0);
    let chat_w_logical = 400.0f64;
    let phys_w = (chat_w_logical * scale).round() as i32;
    let (mx, my) = (mon.position().x, mon.position().y);
    let (mw, mh) = (mon.size().width as i32, mon.size().height as i32);

    let on_left = align.ends_with('l');
    let tx = if on_left { mx } else { mx + mw - phys_w };

    let _ = window.set_size(tauri::PhysicalSize::new(phys_w.max(1) as u32, mh.max(1) as u32));
    let _ = window.set_position(tauri::PhysicalPosition::new(tx, my));
}

use crate::config;

fn animate_window_to(window: tauri::WebviewWindow, target_x: i32, target_y: i32) {
    std::thread::spawn(move || {
        let start = window.outer_position().ok();
        let (from_x, from_y) = match start {
            Some(p) => (p.x, p.y),
            None => return,
        };
        if (from_x - target_x).abs() < 2 && (from_y - target_y).abs() < 2 {
            return;
        }

        const BX1: f64 = 0.16;
        const BY1: f64 = 1.0;
        const BX2: f64 = 0.3;
        const BY2: f64 = 1.0;

        fn bez(t: f64, p1: f64, p2: f64) -> f64 {
            
            let u = 1.0 - t;
            3.0 * u * u * t * p1 + 3.0 * u * t * t * p2 + t * t * t
        }
        fn bez_deriv_x(t: f64) -> f64 {
            let u = 1.0 - t;
            3.0 * u * u * BX1 + 6.0 * u * t * (BX2 - BX1) + 3.0 * t * t * (1.0 - BX2)
        }

        let ease = |p: f64| -> f64 {
            if p <= 0.0 {
                return 0.0;
            }
            if p >= 1.0 {
                return 1.0;
            }
            
            let mut t = p;
            for _ in 0..8 {
                let x = bez(t, BX1, BX2) - p;
                if x.abs() < 1e-6 {
                    return bez(t, BY1, BY2);
                }
                let d = bez_deriv_x(t);
                if d.abs() < 1e-6 {
                    break;
                }
                t -= x / d;
                if t < 0.0 {
                    t = 0.0;
                }
                if t > 1.0 {
                    t = 1.0;
                }
            }
            let (mut lo, mut hi) = (0.0f64, 1.0f64);
            for _ in 0..24 {
                let mid = (lo + hi) / 2.0;
                if bez(mid, BX1, BX2) < p {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }
            bez((lo + hi) / 2.0, BY1, BY2)
        };

        let duration_ms = 320u64;
        let started = std::time::Instant::now();
        loop {
            let p = (started.elapsed().as_millis() as f64 / duration_ms as f64).min(1.0);
            let e = ease(p);
            let x = from_x as f64 + (target_x - from_x) as f64 * e;
            let y = from_y as f64 + (target_y - from_y) as f64 * e;
            let _ = window.set_position(tauri::PhysicalPosition::new(
                x.round() as i32,
                y.round() as i32,
            ));
            if p >= 1.0 {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(8));
        }
    });
}

fn placement_target(window: &tauri::WebviewWindow) -> Option<(i32, i32)> {
    let (align, mon_idx) = config::get_placement();
    let monitors = window.available_monitors().ok()?;
    let mon = if mon_idx >= 0 {
        monitors.get(mon_idx as usize).cloned()
    } else {
        None
    }
    .or_else(|| window.current_monitor().ok().flatten())
    .or_else(|| window.primary_monitor().ok().flatten())?;

    let size = window.inner_size().ok()?;
    let (mx, my) = (mon.position().x, mon.position().y);
    let (mw, mh) = (mon.size().width as i32, mon.size().height as i32);
    let (w, h) = (size.width as i32, size.height as i32);

    let (va, ha) = align.split_at(1); 
    let tx = match ha {
        "l" => mx,
        "r" => mx + mw - w,
        _ => mx + (mw - w) / 2,
    };
    let ty = match va {
        "t" => my,
        "b" => my + mh - h,
        _ => my + (mh - h) / 2,
    };
    Some((tx, ty))
}

pub fn place_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        match placement_target(&window) {
            Some((tx, ty)) => animate_window_to(window, tx, ty),
            None => animate_recenter(app),
        }
    }
}

pub fn animate_recenter(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let target = window.current_monitor().ok().flatten().map(|mon| {
            let size = window.inner_size().ok();
            let (mon_pos, mon_size) = (mon.position(), mon.size());
            let (w, h) = match size {
                Some(s) => (s.width as i32, s.height as i32),
                None => (0, 0),
            };
            (
                mon_pos.x + ((mon_size.width as i32) - w) / 2,
                mon_pos.y + ((mon_size.height as i32) - h) / 2,
            )
        });
        if let Some((tx, ty)) = target {
            animate_window_to(window, tx, ty);
        }
    }
}

#[tauri::command]
pub fn recenter_window(app: tauri::AppHandle) {
    animate_recenter(&app);
}

#[tauri::command]
pub fn resize_main_window(app: tauri::AppHandle, width: f64, height: f64) {
    if let Some(w) = app.get_webview_window("main") {
        let width = width.clamp(480.0, 920.0);
        let height = height.clamp(400.0, 900.0);
        let _ = w.set_size(tauri::LogicalSize::new(width, height));
    }
}

#[tauri::command]
pub fn set_window_pin(app: tauri::AppHandle, pinned: bool) -> bool {
    if pinned {
        if let Some(w) = app.get_webview_window("main") {
            if let Ok(p) = w.outer_position() {
                crate::config::set_pinned(true, p.x, p.y);
                return true;
            }
        }
        return false;
    }
    crate::config::set_pinned(false, 0, 0);
    false
}

#[tauri::command]
pub fn get_window_pin() -> bool {
    crate::config::is_pinned()
}

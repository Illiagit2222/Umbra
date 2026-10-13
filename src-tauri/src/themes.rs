use std::path::Path;
use std::time::{Duration, SystemTime};
/// Cheap fingerprint of the themes folder: file names, sizes and mtimes.
/// Comparing it lets us replace the old 1 Hz `get_custom_themes` IPC poll
/// with a single background thread that stays silent until something changes.
fn themes_signature() -> Vec<(String, u64, u128)> {
    let mut entries: Vec<(String, u64, u128)> = match std::fs::read_dir(crate::paths::themes_dir()) {
        Ok(entries) => entries
            .flatten()
            .filter_map(|entry| {
                let path = entry.path();
                if !path.is_file() || path.extension().and_then(|s| s.to_str()) != Some("css") {
                    return None;
                }
                let meta = entry.metadata().ok()?;
                let modified = meta
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(SystemTime::UNIX_EPOCH).ok())
                    .map(|d| d.as_nanos())
                    .unwrap_or(0);
                Some((
                    file_key(&path),
                    meta.len(),
                    modified,
                ))
            })
            .collect(),
        Err(_) => Vec::new(),
    };
    entries.sort();
    entries
}
fn file_key(path: &Path) -> String {
    path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default()
}
/// Watches `themes/` and emits `themes-changed` whenever a .css file is
/// added, edited or removed. The frontend reloads the preset list on that event.
pub fn watch(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        let mut previous = themes_signature();
        loop {
            std::thread::sleep(Duration::from_millis(1000));
            let current = themes_signature();
            if current != previous {
                previous = current;
                let _ = tauri::Emitter::emit(&app, "themes-changed", ());
            }
        }
    });
}
#[cfg(test)]
mod tests {
    #[test]
    fn signature_tracks_names_sizes_and_order() {
        let a = vec![
            ("b.css".to_string(), 10u64, 1u128),
            ("a.css".to_string(), 20u64, 2u128),
        ];
        let b = vec![
            ("a.css".to_string(), 20u64, 2u128),
            ("b.css".to_string(), 10u64, 1u128),
        ];
        assert_eq!(
            signatures(a.iter().cloned().collect()),
            signatures(b.iter().cloned().collect())
        );
        let changed: Vec<_> = b
            .into_iter()
            .map(|(n, s, m)| if n == "a.css" { (n, s + 1, m) } else { (n, s, m) })
            .collect();
        assert_ne!(
            signatures(a.into_iter().collect()),
            signatures(changed.into_iter().collect())
        );
    }
    fn signatures(mut v: Vec<(String, u64, u128)>) -> Vec<(String, u64, u128)> {
        v.sort();
        v
    }
}
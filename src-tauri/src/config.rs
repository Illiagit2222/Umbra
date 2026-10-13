use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{LazyLock, Mutex};
#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    #[serde(default = "default_hotkey")]
    pub hotkey: String,
    #[serde(default = "default_zoom")]
    pub zoom: f64,
    #[serde(default)]
    pub theme: ThemeConfig,

    #[serde(default)]
    pub pinned: bool,
    #[serde(default)]
    pub pin_x: i32,
    #[serde(default)]
    pub pin_y: i32,

    #[serde(default = "default_align")]
    pub align: String,

    #[serde(default)]
    pub monitor: i32,

    #[serde(default = "default_index_excludes")]
    pub index_excludes: Vec<String>,

    #[serde(default)]
    pub disabled_kinds: Vec<u8>,

    #[serde(default)]
    pub disabled_drives: Vec<String>,

    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default = "default_true")]
    pub autostart: bool,
}
impl Default for Config {
    fn default() -> Self {
        Config {
            hotkey: default_hotkey(),
            zoom: default_zoom(),
            theme: ThemeConfig::default(),
            pinned: false,
            pin_x: 0,
            pin_y: 0,
            align: default_align(),
            monitor: 0,
            index_excludes: default_index_excludes(),
            disabled_kinds: vec![],
            disabled_drives: vec![],
            language: default_language(),
            autostart: true,
        }
    }
}
fn default_language() -> String {
    "en".into()
}
pub(crate) const DEFAULT_HOTKEY: &str = "Alt+Space";
fn default_hotkey() -> String {
    DEFAULT_HOTKEY.into()
}
fn default_zoom() -> f64 {
    1.0
}
fn default_true() -> bool {
    true
}
pub(crate) const DEFAULT_INDEX_EXCLUDES: &[&str] = &[
    "windows",
    "program files",
    "program files (x86)",
    "$recycle.bin",
    "system volume information",
    "recovery",
    "perflogs",
    "boot",
    "efi",
    "msocache",
    "programdata",
    "appdata",
    "node_modules",
    ".git",
    ".github",
    "target",
    "build",
    "dist",
    ".vscode",
    ".idea",
    "vendor",
];
fn default_index_excludes() -> Vec<String> {
    DEFAULT_INDEX_EXCLUDES
        .iter()
        .map(|s| s.to_string())
        .collect()
}
fn default_align() -> String {
    "cc".into()
}
#[derive(Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct ThemeConfig {
    pub accent: String,
    pub card_bg: String,
    pub card_alpha: f64,
    pub radius: u32,
    #[serde(default = "default_density")]
    pub density: String,
    pub text: String,
    pub glow: bool,
    pub glow_strength: u32,
    #[serde(default = "default_border_on")]
    pub border_on: bool,
    #[serde(default = "default_border_w")]
    pub border_w: f64,
    #[serde(default = "default_border_pos")]
    pub border_pos: String,

    #[serde(default)]
    pub light_mode: bool,
    #[serde(default)]
    pub custom_theme: Option<String>,
}
fn default_border_on() -> bool {
    true
}
fn default_border_w() -> f64 {
    1.0
}
fn default_border_pos() -> String {
    "inner".into()
}
/// Density presets: `full`, `compact-results`, `compact-full`.
fn default_density() -> String {
    "full".into()
}
impl Default for ThemeConfig {
    fn default() -> Self {
        ThemeConfig {
            accent: "#507090".into(),
            card_bg: "#1e1e1e".into(),
            card_alpha: 1.0,
            radius: 12,
            density: default_density(),
            text: "#e3e3e3".into(),
            glow: false,
            glow_strength: 14,
            border_on: default_border_on(),
            border_w: default_border_w(),
            border_pos: default_border_pos(),
            light_mode: false,
            custom_theme: None,
        }
    }
}
impl ThemeConfig {

    pub fn sanitized(mut self) -> Self {
        self.accent = sanitize_hex(&self.accent, "#507090");
        self.card_bg = sanitize_hex(&self.card_bg, "#1e1e1e");
        self.text = sanitize_hex(&self.text, "#e3e3e3");
        if !self.card_alpha.is_finite() {
            self.card_alpha = 1.0;
        }
        self.card_alpha = self.card_alpha.clamp(0.4, 1.0);
        self.radius = self.radius.clamp(4, 24);
        match self.density.as_str() {
            "compact-results" | "compact-full" => {}
            _ => self.density = default_density(),
        }
        self.glow_strength = self.glow_strength.clamp(0, 40);
        if !self.border_w.is_finite() {
            self.border_w = 1.0;
        }
        self.border_w = self.border_w.clamp(0.0, 8.0);

        match self.border_pos.as_str() {
            "inner" | "outer" => {}
            _ => self.border_pos = "inner".into(),
        }
        self
    }
}
fn sanitize_hex(val: &str, fallback: &str) -> String {
    let v = val.trim();
    let ok =
        v.starts_with('#') && v.len() == 7 && v[1..].chars().all(|c| c.is_ascii_hexdigit());
    if ok {
        v.to_lowercase()
    } else {
        fallback.to_string()
    }
}
struct ConfigState {
    path: PathBuf,
    config: Config,
}
pub fn get_theme() -> ThemeConfig {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.theme.clone()
}
pub fn set_theme(theme: ThemeConfig) -> ThemeConfig {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    let clean = theme.sanitized();
    state.config.theme = clean.clone();
    save(state);
    clean
}
pub fn is_pinned() -> bool {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.pinned
}
pub fn set_pinned(pinned: bool, x: i32, y: i32) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    state.config.pinned = pinned;
    state.config.pin_x = x;
    state.config.pin_y = y;
    save(state);
}
pub fn pinned_position() -> Option<(i32, i32)> {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    let c = &guard.as_ref().unwrap().config;
    if c.pinned {
        Some((c.pin_x, c.pin_y))
    } else {
        None
    }
}
pub fn get_placement() -> (String, i32) {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    let c = &guard.as_ref().unwrap().config;
    let align = if is_valid_align(&c.align) {
        c.align.clone()
    } else {
        default_align()
    };
    (align, c.monitor)
}
pub fn is_valid_align(align: &str) -> bool {
    let b = align.as_bytes();
    b.len() == 2 && matches!(b[0], b't' | b'c' | b'b') && matches!(b[1], b'l' | b'c' | b'r')
}
pub fn set_placement(align: String, monitor: i32) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    state.config.align = align;
    state.config.monitor = monitor;
    save(state);
}
pub fn get_language() -> String {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    let lang = &guard.as_ref().unwrap().config.language;
    match lang.as_str() {
        "en" | "ru" | "ja" | "de" => lang.clone(),
        _ => "en".to_string(),
    }
}
pub fn set_language(lang: String) -> String {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    let clean = match lang.to_lowercase().as_str() {
        "ru" => "ru".to_string(),
        "ja" => "ja".to_string(),
        "de" => "de".to_string(),
        _ => "en".to_string(),
    };
    state.config.language = clean.clone();
    save(state);
    clean
}
static STATE: LazyLock<Mutex<Option<ConfigState>>> = LazyLock::new(|| Mutex::new(None));
fn config_path() -> PathBuf {
    crate::paths::config_file()
}
/// Installs from before 0.1.3 stored an empty hotkey, which the keyboard hook
/// cannot use. Replace anything unusable with the default so the file on disk
/// matches what the app actually runs with.
fn normalise_hotkey(config: &mut Config) {
    if !crate::keyboard_hook::is_supported_hotkey(&config.hotkey) {
        config.hotkey = DEFAULT_HOTKEY.to_string();
    }
}
fn ensure_loaded() {
    let mut guard = STATE.lock().unwrap();
    if guard.is_some() {
        return;
    }
    let path = config_path();
    let mut config: Config = crate::storage::load_json(&path);
    normalise_hotkey(&mut config);
    *guard = Some(ConfigState { path, config });
}
pub fn get_autostart() -> bool {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.autostart
}
pub fn set_autostart(enable: bool) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    state.config.autostart = enable;
    save(state);
}
pub fn get_hotkey() -> String {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.hotkey.clone()
}
pub fn set_hotkey(key: &str) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    state.config.hotkey = key.to_string();
    save(state);
}
pub fn get_zoom() -> f64 {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    let zoom = guard.as_ref().unwrap().config.zoom;
    if zoom > 0.0 { zoom } else { 1.0 }
}
pub fn set_zoom(zoom: f64) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    state.config.zoom = zoom.clamp(0.5, 2.0);
    save(state);
}
pub fn get_index_excludes() -> Vec<String> {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.index_excludes.clone()
}
pub fn get_default_index_excludes() -> Vec<String> {
    DEFAULT_INDEX_EXCLUDES
        .iter()
        .map(|s| s.to_string())
        .collect()
}
pub fn set_index_excludes(excludes: Vec<String>) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    let mut clean: Vec<String> = excludes
        .into_iter()
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty() && s.len() < 200)
        .collect();
    clean.sort();
    clean.dedup();
    state.config.index_excludes = clean;
    save(state);
}
pub fn get_disabled_kinds() -> Vec<u8> {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.disabled_kinds.clone()
}
pub fn set_disabled_kinds(kinds: Vec<u8>) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    let mut clean: Vec<u8> = kinds.into_iter().filter(|&k| k <= 10).collect();
    clean.sort();
    clean.dedup();
    state.config.disabled_kinds = clean;
    save(state);
}
fn save(state: &ConfigState) {
    if let Ok(json) = serde_json::to_string_pretty(&state.config) {
        let _ = crate::storage::write_atomic(&state.path, json);
    }
}
pub fn get_disabled_drives() -> Vec<String> {
    ensure_loaded();
    let guard = STATE.lock().unwrap();
    guard.as_ref().unwrap().config.disabled_drives.clone()
}
pub fn set_disabled_drives(drives: Vec<String>) {
    ensure_loaded();
    let mut guard = STATE.lock().unwrap();
    let state = guard.as_mut().unwrap();
    let mut clean: Vec<String> = drives
        .into_iter()
        .map(|s| s.trim().to_uppercase())
        .filter(|s| !s.is_empty())
        .collect();
    clean.sort();
    clean.dedup();
    state.config.disabled_drives = clean;
    save(state);
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn align_validation_rejects_bad_values_without_panicking() {
        for ok in ["tl", "cc", "br", "tc"] {
            assert!(is_valid_align(ok), "{ok}");
        }
        for bad in ["", "c", "ccc", "xx", "яя", "cя", "CC"] {
            assert!(!is_valid_align(bad), "{bad}");
        }
    }
    #[test]
    fn unusable_hotkeys_are_replaced_with_the_default() {
        let missing: Config = serde_json::from_str(r#"{"zoom": 1.0}"#).unwrap();
        assert_eq!(missing.hotkey, DEFAULT_HOTKEY, "missing field");
        let mut empty: Config = serde_json::from_str(r#"{"hotkey": "", "zoom": 1.0}"#).unwrap();
        normalise_hotkey(&mut empty);
        assert_eq!(empty.hotkey, DEFAULT_HOTKEY, "empty string from 0.1.2");
        let mut junk: Config = serde_json::from_str(r#"{"hotkey": "Ctrl+-", "zoom": 1.0}"#).unwrap();
        normalise_hotkey(&mut junk);
        assert_eq!(junk.hotkey, DEFAULT_HOTKEY, "unhookable combo");
        let mut good: Config =
            serde_json::from_str(r#"{"hotkey": "Ctrl+Shift+P", "zoom": 1.0}"#).unwrap();
        normalise_hotkey(&mut good);
        assert_eq!(good.hotkey, "Ctrl+Shift+P", "valid hotkey is kept");
    }
    #[test]
    fn autostart_preference_defaults_to_on_and_is_remembered() {
        let old: Config = serde_json::from_str(r#"{"hotkey": "Alt+Space", "zoom": 1.0}"#).unwrap();
        assert!(old.autostart);
        let off: Config =
            serde_json::from_str(r#"{"hotkey": "Alt+Space", "zoom": 1.0, "autostart": false}"#).unwrap();
        assert!(!off.autostart);
        let roundtrip: Config = serde_json::from_str(&serde_json::to_string(&off).unwrap()).unwrap();
        assert!(!roundtrip.autostart);
    }
    #[test]
    fn density_keeps_known_modes_and_falls_back_to_full() {
        for mode in ["full", "compact-results", "compact-full"] {
            let theme = ThemeConfig {
                density: mode.into(),
                ..Default::default()
            };
            assert_eq!(theme.sanitized().density, mode);
        }
        let bogus = ThemeConfig {
            density: "nonsense".into(),
            ..Default::default()
        };
        assert_eq!(bogus.sanitized().density, "full");
    }
    #[test]
    fn a_config_written_before_density_existed_still_loads() {
        // 0.1.3 and earlier stored `cardH`; it is gone, and the replacement
        // must fall back to the default rather than failing to parse.
        let cfg: Config = serde_json::from_str(r#"{"cardH": 64, "zoom": 1.0}"#).unwrap();
        assert_eq!(cfg.theme.density, "full");
    }
}

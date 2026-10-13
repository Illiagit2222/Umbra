use crate::updater;
#[tauri::command]
pub fn get_app_version() -> String {
    updater::current_version().to_string()
}
#[tauri::command]
pub async fn check_for_updates() -> Result<updater::UpdateInfo, String> {
    tauri::async_runtime::spawn_blocking(updater::check)
        .await
        .map_err(|e| format!("update check crashed: {e}"))?
}
/// Kicks off a background download; progress and completion arrive as events.
#[tauri::command]
pub fn download_update(
    app: tauri::AppHandle,
    url: String,
    file_name: String,
    size: u64,
) -> Result<(), String> {
    if !updater::is_trusted_host(&url) {
        return Err("refusing to download from an untrusted host".to_string());
    }
    if updater::safe_file_name(&file_name).is_none() {
        return Err("unusable asset name".to_string());
    }
    updater::start_download(app, url, file_name, size);
    Ok(())
}
/// Launches the installer and quits Umbra so it can replace our own binary.
#[tauri::command]
pub fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    updater::install(app)
}
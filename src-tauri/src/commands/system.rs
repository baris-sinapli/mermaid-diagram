use crate::utils::platform::{DefaultDirectories, PlatformInfo};
use tauri::command;
use std::env;

#[command]
pub async fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    let platform = PlatformInfo::new();
    
    Ok(SystemInfo {
        os: platform.os,
        arch: platform.arch,
        is_windows: platform.is_windows,
        is_linux: platform.is_linux,
        is_macos: platform.is_macos,
        temp_dir: DefaultDirectories::temp().to_string_lossy().to_string(),
        current_dir: env::current_dir()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default(),
        home_dir: DefaultDirectories::home()
            .map(|p| p.to_string_lossy().to_string()),
        documents_dir: DefaultDirectories::documents()
            .map(|p| p.to_string_lossy().to_string()),
        downloads_dir: DefaultDirectories::downloads()
            .map(|p| p.to_string_lossy().to_string()),
    })
}

#[command]
pub async fn get_default_directories() -> Result<DefaultDirectoriesInfo, String> {
    Ok(DefaultDirectoriesInfo {
        home: DefaultDirectories::home()
            .map(|p| p.to_string_lossy().to_string()),
        documents: DefaultDirectories::documents()
            .map(|p| p.to_string_lossy().to_string()),
        desktop: DefaultDirectories::desktop()
            .map(|p| p.to_string_lossy().to_string()),
        downloads: DefaultDirectories::downloads()
            .map(|p| p.to_string_lossy().to_string()),
        temp: Some(DefaultDirectories::temp().to_string_lossy().to_string()),
        app_data: DefaultDirectories::app_data()
            .map(|p| p.to_string_lossy().to_string()),
    })
}

#[command]
pub async fn open_file_location(path: String) -> Result<(), String> {
    use crate::utils::platform::open_with_default_app;
    
    let path_buf = std::path::PathBuf::from(&path);
    let location = if path_buf.is_file() {
        path_buf.parent().unwrap_or(&path_buf).to_string_lossy().to_string()
    } else {
        path
    };
    
    open_with_default_app(&location)
}

#[command]
pub async fn get_environment_variable(key: String) -> Result<Option<String>, String> {
    Ok(env::var(&key).ok())
}

#[command]
pub async fn list_environment_variables() -> Result<Vec<EnvVar>, String> {
    let vars: Vec<EnvVar> = env::vars()
        .map(|(key, value)| EnvVar { key, value })
        .collect();
    
    Ok(vars)
}

#[derive(serde::Serialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub is_windows: bool,
    pub is_linux: bool,
    pub is_macos: bool,
    pub temp_dir: String,
    pub current_dir: String,
    pub home_dir: Option<String>,
    pub documents_dir: Option<String>,
    pub downloads_dir: Option<String>,
}

#[derive(serde::Serialize)]
pub struct DefaultDirectoriesInfo {
    pub home: Option<String>,
    pub documents: Option<String>,
    pub desktop: Option<String>,
    pub downloads: Option<String>,
    pub temp: Option<String>,
    pub app_data: Option<String>,
}

#[derive(serde::Serialize)]
pub struct EnvVar {
    pub key: String,
    pub value: String,
}
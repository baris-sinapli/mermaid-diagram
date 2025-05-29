use crate::models::{FileOperationResult, MermaidFile, RecentFile};
use crate::services::FileService;
use std::sync::Mutex;
use tauri::{command, State};

pub type FileServiceState = Mutex<FileService>;

#[command]
pub async fn read_mermaid_file(
    path: String,
    service: State<'_, FileServiceState>,
) -> Result<MermaidFile, String> {
    log::info!("Reading file: {}", path);
    let mut service = service.lock().unwrap();
    service.read_file(&path)
}

#[command]
pub async fn write_mermaid_file(
    path: String,
    content: String,
    service: State<'_, FileServiceState>,
) -> Result<FileOperationResult, String> {
    log::info!("Writing file: {}", path);
    log::debug!("Content length: {}", content.len());
    
    let mut service = service.lock().unwrap();
    service.write_file(&path, &content)
}

#[command]
pub async fn get_recent_files(
    service: State<'_, FileServiceState>,
) -> Result<Vec<RecentFile>, String> {
    let service = service.lock().unwrap();
    Ok(service.get_recent_files().to_vec())
}

#[command]
pub async fn clear_recent_files(
    service: State<'_, FileServiceState>,
) -> Result<(), String> {
    let mut service = service.lock().unwrap();
    service.clear_recent_files();
    log::info!("Recent files cleared");
    Ok(())
}

#[command]
pub async fn validate_file_path(
    path: String,
    service: State<'_, FileServiceState>,
) -> Result<bool, String> {
    let service = service.lock().unwrap();
    service.validate_file(&path)
}

#[command]
pub async fn get_file_info(
    path: String,
    service: State<'_, FileServiceState>,
) -> Result<MermaidFile, String> {
    let service = service.lock().unwrap();
    service.get_file_info(&path)
}

#[command]
pub async fn find_mermaid_files_in_directory(
    directory_path: String,
    recursive: bool,
    service: State<'_, FileServiceState>,
) -> Result<Vec<String>, String> {
    log::info!("Scanning directory: {} (recursive: {})", directory_path, recursive);
    
    let service = service.lock().unwrap();
    let paths = service.find_mermaid_files(&directory_path, recursive)?;
    
    let path_strings: Vec<String> = paths
        .into_iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect();
    
    log::info!("Found {} mermaid files", path_strings.len());
    Ok(path_strings)
}
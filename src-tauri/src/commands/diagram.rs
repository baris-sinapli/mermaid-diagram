use crate::models::{DiagramOptions, DiagramResult};
use crate::services::MmdcService;
use crate::utils::path::{generate_output_path, ensure_directory_exists};
use std::sync::Mutex;
use tauri::{command, State};

pub type MmdcServiceState = Mutex<MmdcService>;

#[command]
pub async fn check_mmdc(service: State<'_, MmdcServiceState>) -> Result<String, String> {
    let mut service = service.lock().unwrap();
    service.check_availability()
}

#[command]
pub async fn generate_diagram(
    code: String,
    options: DiagramOptions,
    service: State<'_, MmdcServiceState>,
) -> Result<DiagramResult, String> {
    log::info!("Generating diagram with format: {}", options.format);
    log::debug!("Code length: {}", code.len());
    
    if code.trim().is_empty() {
        return Ok(DiagramResult::error(
            "Empty mermaid code provided".to_string(),
            0,
        ));
    }
    
    let output_dir = std::env::temp_dir();
    ensure_directory_exists(&output_dir)
        .map_err(|e| format!("Failed to ensure temp directory exists: {}", e))?;
    
    let output_path = generate_output_path(
        &output_dir,
        "mermaid_diagram",
        &options.format.to_string(),
    );
    
    log::info!("Output path: {}", output_path.display());
    
    let mut service = service.lock().unwrap();
    Ok(service.generate_diagram(&code, &options, &output_path))
}

#[command]
pub async fn generate_diagram_to_file(
    code: String,
    options: DiagramOptions,
    output_path: String,
    service: State<'_, MmdcServiceState>,
) -> Result<DiagramResult, String> {
    log::info!("Generating diagram to custom path: {}", output_path);
    log::debug!("Code length: {}", code.len());
    
    if code.trim().is_empty() {
        return Ok(DiagramResult::error(
            "Empty mermaid code provided".to_string(),
            0,
        ));
    }
    
    let output_path = std::path::PathBuf::from(output_path);
    
    // Ensure parent directory exists
    if let Some(parent) = output_path.parent() {
        ensure_directory_exists(parent)
            .map_err(|e| format!("Failed to ensure output directory exists: {}", e))?;
    }
    
    let mut service = service.lock().unwrap();
    Ok(service.generate_diagram(&code, &options, &output_path))
}
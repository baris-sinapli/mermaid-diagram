use crate::models::{DiagramOptions, DiagramResult, DiagramFormat};
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

#[command]
pub async fn generate_preview_svg(
    code: String,
    theme: Option<String>,
    service: State<'_, MmdcServiceState>,
) -> Result<String, String> {
    if code.trim().is_empty() {
        return Err("Empty mermaid code provided".to_string());
    }
    
    let mut service = service.lock().unwrap();
    
    let background = match theme.as_deref() {
        Some("dark") => "#0f0f23",
        Some("light") => "#ffffff",
        _ => "transparent"
    };

    let options = DiagramOptions {
        format: DiagramFormat::Svg,
        width: Some(800),
        height: Some(600),
        background: background.to_string(),
        theme: theme.clone(),
    };
    
    let output_dir = std::env::temp_dir();
    let output_path = output_dir.join(format!("preview_{}.svg", 
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
    ));
    
    let result = service.generate_diagram(&code, &options, &output_path);
    
    if result.success {
        match std::fs::read_to_string(&output_path) {
            Ok(mut svg_content) => {
                if theme.as_deref() == Some("dark") {
                    svg_content = svg_content.replace("<svg", &format!("<svg style=\"background-color: {}\"", background));
                }

                let _ = std::fs::remove_file(&output_path);
                Ok(svg_content)
            }
            Err(e) => Err(format!("Failed to read SVG: {}", e))
        }
    } else {
        Err(result.error_message.unwrap_or("Unknown error".to_string()))
    }
}
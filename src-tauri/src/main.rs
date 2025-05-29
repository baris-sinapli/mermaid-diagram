#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Instant;
use std::io::Write;

#[derive(Debug, Deserialize)]
struct DiagramOptions {
    format: String,
    width: Option<u32>,
    height: Option<u32>,
    background: String,
}

#[derive(Debug, Serialize)]
struct DiagramResult {
    success: bool,
    output_path: Option<String>,
    error_message: Option<String>,
    generation_time: u64,
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
async fn check_mmdc() -> Result<String, String> {
    if let Some(mmdc_path) = find_mmdc_executable() {
        match Command::new(&mmdc_path).arg("--version").output() {
            Ok(output) => {
                if output.status.success() {
                    let version = String::from_utf8_lossy(&output.stdout);
                    Ok(format!("✅ mmdc found at {}: {}", mmdc_path, version.trim()))
                } else {
                    let error = String::from_utf8_lossy(&output.stderr);
                    Err(format!("❌ mmdc error at {}: {}", mmdc_path, error))
                }
            }
            Err(e) => Err(format!("❌ mmdc execution error: {}", e)),
        }
    } else {
        let attempted_paths = get_mmdc_paths();
        Err(format!(
            "❌ mmdc not found. Attempted paths:\n{}",
            attempted_paths.join("\n")
        ))
    }
}

#[command]
async fn generate_diagram(code: String, options: DiagramOptions) -> Result<DiagramResult, String> {
    let start_time = Instant::now();
    
    // Unique output file
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    let output_dir = std::env::temp_dir();
    let output_filename = format!("mermaid_diagram_{}.{}", timestamp, options.format);
    let output_path = output_dir.join(&output_filename);
    
    println!("Generating diagram to: {:?}", output_path);
    println!("Input code:\n{}", code);
    println!("Code length: {}", code.len());
    
    // Find working mmdc command
    let mmdc_path = find_mmdc_executable().unwrap_or_else(|| {
        println!("Warning: mmdc not found, falling back to 'mmdc'");
        "mmdc".to_string()
    });
    
    // Build mmdc command
    let mut cmd = Command::new(&mmdc_path);
    cmd.arg("-i").arg("-") // read from stdin
       .arg("-o").arg(&output_path);
    
    // Add optional parameters
    if let Some(width) = options.width {
        if width > 0 {
            cmd.arg("-w").arg(width.to_string());
        }
    }
    
    if let Some(height) = options.height {
        if height > 0 {
            cmd.arg("-H").arg(height.to_string());
        }
    }
    
    if !options.background.trim().is_empty() && options.background != "transparent" {
        cmd.arg("-b").arg(&options.background);
    }
    
    // Execute command
    match cmd
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
    {
        Ok(mut child) => {
            // Write mermaid code to stdin
            if let Some(stdin) = child.stdin.as_mut() {
                println!("Writing to stdin: {}", code);
                if let Err(e) = stdin.write_all(code.as_bytes()) {
                    return Ok(DiagramResult {
                        success: false,
                        output_path: None,
                        error_message: Some(format!("Stdin yazma hatası: {}", e)),
                        generation_time: start_time.elapsed().as_millis() as u64,
                    });
                }
                // Close stdin to signal end of input
                let _ = stdin;
            }
            
            match child.wait_with_output() {
                Ok(output) => {
                    let generation_time = start_time.elapsed().as_millis() as u64;
                    
                    if output.status.success() {
                        // Check if file actually exists
                        if output_path.exists() {
                            Ok(DiagramResult {
                                success: true,
                                output_path: Some(output_path.to_string_lossy().to_string()),
                                error_message: None,
                                generation_time,
                            })
                        } else {
                            Ok(DiagramResult {
                                success: false,
                                output_path: None,
                                error_message: Some("Dosya oluşturuldu ama bulunamadı".to_string()),
                                generation_time,
                            })
                        }
                    } else {
                        let error_msg = String::from_utf8_lossy(&output.stderr);
                        Ok(DiagramResult {
                            success: false,
                            output_path: None,
                            error_message: Some(format!("mmdc hatası: {}", error_msg)),
                            generation_time,
                        })
                    }
                }
                Err(e) => Ok(DiagramResult {
                    success: false,
                    output_path: None,
                    error_message: Some(format!("Komut çalıştırma hatası: {}", e)),
                    generation_time: start_time.elapsed().as_millis() as u64,
                }),
            }
        }
        Err(e) => Ok(DiagramResult {
            success: false,
            output_path: None,
            error_message: Some(format!("mmdc başlatılamadı: {}. mmdc kurulu mu?", e)),
            generation_time: start_time.elapsed().as_millis() as u64,
        }),
    }
}

use std::env;
use std::path::PathBuf;

fn get_npm_global_path() -> Option<PathBuf> {
    // Try to get npm global path using npm command
    if let Ok(output) = Command::new("npm").args(&["root", "-g"]).output() {
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let npm_root = PathBuf::from(path_str);
            let bin_path = npm_root.parent()?.join("bin");
            if bin_path.exists() {
                return Some(bin_path);
            }
        }
    }
    
    None
}

fn get_mmdc_paths() -> Vec<String> {
    let mut paths = vec!["mmdc".to_string()];
    
    // Try npm global path first (cross-platform)
    if let Some(npm_bin) = get_npm_global_path() {
        let mmdc_path = npm_bin.join("mmdc");
        paths.push(mmdc_path.to_string_lossy().to_string());
        
        #[cfg(target_os = "windows")]
        {
            let mmdc_cmd_path = npm_bin.join("mmdc.cmd");
            paths.push(mmdc_cmd_path.to_string_lossy().to_string());
        }
    }
    
    // Platform-specific fallback paths
    #[cfg(target_os = "windows")]
    {
        paths.push("mmdc.cmd".to_string());
        
        if let Ok(home) = env::var("USERPROFILE") {
            let npm_path = PathBuf::from(home).join("AppData").join("Roaming").join("npm");
            paths.push(npm_path.join("mmdc.cmd").to_string_lossy().to_string());
            paths.push(npm_path.join("mmdc").to_string_lossy().to_string());
        }
        
        if let Ok(appdata) = env::var("APPDATA") {
            let npm_path = PathBuf::from(appdata).join("npm");
            paths.push(npm_path.join("mmdc.cmd").to_string_lossy().to_string());
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        if let Ok(home) = env::var("HOME") {
            // Common npm global locations on Linux
            paths.push(format!("{}/.npm-global/bin/mmdc", home));
            paths.push(format!("{}/.local/bin/mmdc", home));
        }
        
        paths.push("/usr/local/bin/mmdc".to_string());
        paths.push("/usr/bin/mmdc".to_string());
    }
    
    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = env::var("HOME") {
            paths.push(format!("{}/.npm-global/bin/mmdc", home));
        }
        
        paths.push("/usr/local/bin/mmdc".to_string());
        paths.push("/opt/homebrew/bin/mmdc".to_string());
    }
    
    paths
}

fn find_mmdc_executable() -> Option<String> {
    let paths = get_mmdc_paths();
    
    for path in paths {
        println!("Trying mmdc path: {}", path);
        if let Ok(output) = Command::new(&path).arg("--version").output() {
            if output.status.success() {
                println!("Found working mmdc at: {}", path);
                return Some(path);
            }
        }
    }
    
    None
}

fn main() {
    println!("Starting Mermaid GUI v2.0...");
    
    // Log platform info
    println!("Platform: {}", env::consts::OS);
    println!("Architecture: {}", env::consts::ARCH);
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, check_mmdc, generate_diagram])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
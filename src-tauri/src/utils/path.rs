use crate::utils::platform::get_npm_binary_name;
use std::env;
use std::path::PathBuf;
use std::process::Command;

/// Get npm global path dynamically
pub fn get_npm_global_path() -> Option<PathBuf> {
    // Try to get npm global path using npm command
    let npm_cmd = get_npm_binary_name();
    
    if let Ok(output) = Command::new(npm_cmd).args(&["root", "-g"]).output() {
        if output.status.success() {
            let path_lossy = String::from_utf8_lossy(&output.stdout);
            let path_str = path_lossy.trim();
            let npm_root = PathBuf::from(path_str);
            let bin_path = npm_root.parent()?.join("bin");
            if bin_path.exists() {
                return Some(bin_path);
            }
        }
    }
    
    None
}

/// Get all possible mmdc executable paths for current platform
pub fn get_mmdc_paths() -> Vec<String> {
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
        paths.extend(get_windows_mmdc_paths());
    }
    
    #[cfg(target_os = "linux")]
    {
        paths.extend(get_linux_mmdc_paths());
    }
    
    #[cfg(target_os = "macos")]
    {
        paths.extend(get_macos_mmdc_paths());
    }
    
    paths
}

#[cfg(target_os = "windows")]
fn get_windows_mmdc_paths() -> Vec<String> {
    let mut paths = vec!["mmdc.cmd".to_string()];
    
    if let Ok(home) = env::var("USERPROFILE") {
        let npm_path = PathBuf::from(home).join("AppData").join("Roaming").join("npm");
        paths.push(npm_path.join("mmdc.cmd").to_string_lossy().to_string());
        paths.push(npm_path.join("mmdc").to_string_lossy().to_string());
    }
    
    if let Ok(appdata) = env::var("APPDATA") {
        let npm_path = PathBuf::from(appdata).join("npm");
        paths.push(npm_path.join("mmdc.cmd").to_string_lossy().to_string());
    }
    
    paths
}

#[cfg(target_os = "linux")]
fn get_linux_mmdc_paths() -> Vec<String> {
    let mut paths = Vec::new();
    
    if let Ok(home) = env::var("HOME") {
        // Common npm global locations on Linux
        paths.push(format!("{}/.npm-global/bin/mmdc", home));
        paths.push(format!("{}/.local/bin/mmdc", home));
        paths.push(format!("{}/bin/mmdc", home));
    }
    
    paths.push("/usr/local/bin/mmdc".to_string());
    paths.push("/usr/bin/mmdc".to_string());
    
    paths
}

#[cfg(target_os = "macos")]
fn get_macos_mmdc_paths() -> Vec<String> {
    let mut paths = Vec::new();
    
    if let Ok(home) = env::var("HOME") {
        paths.push(format!("{}/.npm-global/bin/mmdc", home));
        paths.push(format!("{}/.local/bin/mmdc", home));
    }
    
    paths.push("/usr/local/bin/mmdc".to_string());
    paths.push("/opt/homebrew/bin/mmdc".to_string());
    
    paths
}

/// Generate a unique output file path
pub fn generate_output_path(
    base_dir: &std::path::Path,
    filename: &str,
    extension: &str,
) -> PathBuf {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    let filename = format!("{}_{}.{}", filename, timestamp, extension);
    base_dir.join(filename)
}

/// Ensure directory exists, create if necessary
pub fn ensure_directory_exists(path: &std::path::Path) -> Result<(), String> {
    if !path.exists() {
        std::fs::create_dir_all(path)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    } else if !path.is_dir() {
        return Err("Path exists but is not a directory".to_string());
    }
    Ok(())
}
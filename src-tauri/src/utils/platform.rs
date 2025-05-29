use std::env;
use std::path::PathBuf;

/// Platform information
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub is_windows: bool,
    pub is_linux: bool,
    pub is_macos: bool,
}

impl PlatformInfo {
    pub fn new() -> Self {
        let os = env::consts::OS.to_string();
        Self {
            is_windows: os == "windows",
            is_linux: os == "linux", 
            is_macos: os == "macos",
            arch: env::consts::ARCH.to_string(),
            os,
        }
    }
}

impl Default for PlatformInfo {
    fn default() -> Self {
        Self::new()
    }
}

/// Get platform-specific default directories
pub struct DefaultDirectories;

impl DefaultDirectories {
    /// Get user's home directory
    pub fn home() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            env::var("USERPROFILE").ok().map(PathBuf::from)
        }
        
        #[cfg(not(target_os = "windows"))]
        {
            env::var("HOME").ok().map(PathBuf::from)
        }
    }
    
    /// Get user's documents directory
    pub fn documents() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            Self::home().map(|h| h.join("Documents"))
        }
        
        #[cfg(target_os = "macos")]
        {
            Self::home().map(|h| h.join("Documents"))
        }
        
        #[cfg(target_os = "linux")]
        {
            // Try XDG first, fallback to ~/Documents
            if let Ok(xdg_docs) = env::var("XDG_DOCUMENTS_DIR") {
                Some(PathBuf::from(xdg_docs))
            } else {
                Self::home().map(|h| h.join("Documents"))
            }
        }
    }
    
    /// Get user's desktop directory
    pub fn desktop() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            Self::home().map(|h| h.join("Desktop"))
        }
        
        #[cfg(target_os = "macos")]
        {
            Self::home().map(|h| h.join("Desktop"))
        }
        
        #[cfg(target_os = "linux")]
        {
            if let Ok(xdg_desktop) = env::var("XDG_DESKTOP_DIR") {
                Some(PathBuf::from(xdg_desktop))
            } else {
                Self::home().map(|h| h.join("Desktop"))
            }
        }
    }
    
    /// Get application data directory
    pub fn app_data() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            env::var("APPDATA").ok().map(PathBuf::from)
        }
        
        #[cfg(target_os = "macos")]
        {
            Self::home().map(|h| h.join("Library").join("Application Support"))
        }
        
        #[cfg(target_os = "linux")]
        {
            if let Ok(xdg_config) = env::var("XDG_CONFIG_HOME") {
                Some(PathBuf::from(xdg_config))
            } else {
                Self::home().map(|h| h.join(".config"))
            }
        }
    }
    
    /// Get temporary directory
    pub fn temp() -> PathBuf {
        env::temp_dir()
    }
    
    /// Get downloads directory
    pub fn downloads() -> Option<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            Self::home().map(|h| h.join("Downloads"))
        }
        
        #[cfg(target_os = "macos")]
        {
            Self::home().map(|h| h.join("Downloads"))
        }
        
        #[cfg(target_os = "linux")]
        {
            if let Ok(xdg_download) = env::var("XDG_DOWNLOAD_DIR") {
                Some(PathBuf::from(xdg_download))
            } else {
                Self::home().map(|h| h.join("Downloads"))
            }
        }
    }
}

/// Platform-specific executable extensions
pub fn get_executable_extension() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        ".exe"
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        ""
    }
}

/// Platform-specific script extensions
pub fn get_script_extensions() -> Vec<&'static str> {
    #[cfg(target_os = "windows")]
    {
        vec![".cmd", ".bat", ".ps1"]
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        vec![".sh"]
    }
}

/// Get platform-specific path separator
pub fn get_path_separator() -> char {
    #[cfg(target_os = "windows")]
    {
        ';'
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        ':'
    }
}

/// Platform-specific npm binary name
pub fn get_npm_binary_name() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        "npm.cmd"
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        "npm"
    }
}

/// Platform-specific node binary name  
pub fn get_node_binary_name() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        "node.exe"
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        "node"
    }
}

/// Get system-wide binary paths
pub fn get_system_binary_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    
    #[cfg(target_os = "windows")]
    {
        // Windows system paths
        if let Ok(system32) = env::var("SYSTEMROOT") {
            paths.push(PathBuf::from(system32).join("System32"));
        }
        paths.push(PathBuf::from("C:\\Windows\\System32"));
        
        // Program Files
        if let Ok(pf) = env::var("PROGRAMFILES") {
            paths.push(PathBuf::from(pf));
        }
        if let Ok(pf86) = env::var("PROGRAMFILES(X86)") {
            paths.push(PathBuf::from(pf86));
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        paths.extend([
            PathBuf::from("/usr/local/bin"),
            PathBuf::from("/usr/bin"),
            PathBuf::from("/bin"),
            PathBuf::from("/usr/local/sbin"),
            PathBuf::from("/usr/sbin"),
            PathBuf::from("/sbin"),
        ]);
    }
    
    #[cfg(target_os = "macos")]
    {
        paths.extend([
            PathBuf::from("/usr/local/bin"),
            PathBuf::from("/usr/bin"),
            PathBuf::from("/bin"),
            PathBuf::from("/usr/sbin"),
            PathBuf::from("/sbin"),
            PathBuf::from("/opt/homebrew/bin"), // Apple Silicon Homebrew
        ]);
    }
    
    paths
}

/// Check if running in development mode
pub fn is_development() -> bool {
    cfg!(debug_assertions)
}

/// Check if running in release mode
pub fn is_release() -> bool {
    !cfg!(debug_assertions)
}

/// Get platform-specific file associations
pub fn get_mermaid_file_extensions() -> Vec<&'static str> {
    vec![".mmd", ".mermaid", ".md"] // .md için Mermaid blocks
}

/// Platform-specific shell command
pub fn get_shell_command() -> (&'static str, Vec<&'static str>) {
    #[cfg(target_os = "windows")]
    {
        ("cmd", vec!["/C"])
    }
    
    #[cfg(target_os = "linux")]
    {
        ("sh", vec!["-c"])
    }
    
    #[cfg(target_os = "macos")]
    {
        ("sh", vec!["-c"])
    }
}

/// Open file/URL with default system application
pub fn open_with_default_app(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(&["/C", "start", "", path])
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_platform_info() {
        let info = PlatformInfo::new();
        assert!(!info.os.is_empty());
        assert!(!info.arch.is_empty());
        
        // Only one should be true
        let platform_count = [info.is_windows, info.is_linux, info.is_macos]
            .iter()
            .filter(|&&x| x)
            .count();
        assert_eq!(platform_count, 1);
    }
    
    #[test]
    fn test_default_directories() {
        // These might be None in some environments, but shouldn't panic
        let _ = DefaultDirectories::home();
        let _ = DefaultDirectories::documents();
        let _ = DefaultDirectories::desktop();
        let _ = DefaultDirectories::app_data();
        
        // Temp should always exist
        let temp = DefaultDirectories::temp();
        assert!(temp.exists());
    }
    
    #[test]
    fn test_binary_names() {
        let npm = get_npm_binary_name();
        let node = get_node_binary_name();
        
        assert!(!npm.is_empty());
        assert!(!node.is_empty());
        
        #[cfg(target_os = "windows")]
        {
            assert!(npm.ends_with(".cmd"));
            assert!(node.ends_with(".exe"));
        }
    }
    
    #[test]
    fn test_file_extensions() {
        let extensions = get_mermaid_file_extensions();
        assert!(!extensions.is_empty());
        assert!(extensions.contains(&".mmd"));
    }
}
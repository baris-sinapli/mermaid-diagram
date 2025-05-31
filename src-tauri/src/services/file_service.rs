use crate::models::{FileOperationResult, MermaidFile, RecentFile};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

pub struct FileService {
    recent_files: Vec<RecentFile>,
}

impl FileService {
    pub fn new() -> Self {
        Self {
            recent_files: Vec::new(),
        }
    }

    /// Read a mermaid file from disk
    pub fn read_file<P: AsRef<Path>>(&mut self, path: P) -> Result<MermaidFile, String> {
        let path = path.as_ref();
        
        if !path.exists() {
            return Err(format!("File does not exist: {}", path.display()));
        }

        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file: {}", e))?;

        let metadata = fs::metadata(path)
            .map_err(|e| format!("Failed to get file metadata: {}", e))?;

        let mermaid_file = MermaidFile {
            path: path.to_path_buf(),
            content,
            last_modified: metadata.modified().ok(),
            size: Some(metadata.len()),
        };

        // Add to recent files
        self.add_to_recent_files(path);

        Ok(mermaid_file)
    }

    /// Write content to a mermaid file
    pub fn write_file<P: AsRef<Path>>(
        &mut self,
        path: P,
        content: &str,
    ) -> Result<FileOperationResult, String> {
        let path = path.as_ref();

        // Create parent directories if they don't exist
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create directories: {}", e))?;
            }
        }

        fs::write(path, content)
            .map_err(|e| format!("Failed to write file: {}", e))?;

        // Add to recent files
        self.add_to_recent_files(path);

        Ok(FileOperationResult::success(
            format!("File saved successfully: {}", path.display()),
            Some(path.to_string_lossy().to_string()),
        ))
    }

    /// Get list of recent files
    pub fn get_recent_files(&self) -> &[RecentFile] {
        &self.recent_files
    }

    /// Clear recent files list
    pub fn clear_recent_files(&mut self) {
        self.recent_files.clear();
    }

    /// Check if file exists and is readable
    pub fn validate_file<P: AsRef<Path>>(&self, path: P) -> Result<bool, String> {
        let path = path.as_ref();
        
        if !path.exists() {
            return Ok(false);
        }

        if !path.is_file() {
            return Err("Path is not a file".to_string());
        }

        // Try to read the file to check permissions
        match fs::read_to_string(path) {
            Ok(_) => Ok(true),
            Err(e) => Err(format!("File is not readable: {}", e)),
        }
    }

    /// Get file info without reading content
    pub fn get_file_info<P: AsRef<Path>>(&self, path: P) -> Result<MermaidFile, String> {
        let path = path.as_ref();
        
        if !path.exists() {
            return Err(format!("File does not exist: {}", path.display()));
        }

        let metadata = fs::metadata(path)
            .map_err(|e| format!("Failed to get file metadata: {}", e))?;

        Ok(MermaidFile {
            path: path.to_path_buf(),
            content: String::new(), // Don't read content for info only
            last_modified: metadata.modified().ok(),
            size: Some(metadata.len()),
        })
    }

    /// Find mermaid files in a directory
    pub fn find_mermaid_files<P: AsRef<Path>>(
        &self,
        directory: P,
        recursive: bool,
    ) -> Result<Vec<PathBuf>, String> {
        let directory = directory.as_ref();
        
        if !directory.exists() {
            return Err(format!("Directory does not exist: {}", directory.display()));
        }

        if !directory.is_dir() {
            return Err("Path is not a directory".to_string());
        }

        let mut mermaid_files = Vec::new();
        
        self.scan_directory(directory, recursive, &mut mermaid_files)?;
        
        Ok(mermaid_files)
    }

    fn scan_directory(
        &self,
        directory: &Path,
        recursive: bool,
        results: &mut Vec<PathBuf>,
    ) -> Result<(), String> {
        let entries = fs::read_dir(directory)
            .map_err(|e| format!("Failed to read directory: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
            let path = entry.path();

            if path.is_file() {
                if let Some(extension) = path.extension() {
                    if extension == "mmd" || extension == "mermaid" {
                        results.push(path);
                    }
                }
            } else if path.is_dir() && recursive {
                self.scan_directory(&path, recursive, results)?;
            }
        }

        Ok(())
    }

    fn add_to_recent_files<P: AsRef<Path>>(&mut self, path: P) {
        let path = path.as_ref();
        let path_str = path.to_string_lossy().to_string();
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        // Remove if already exists
        self.recent_files.retain(|f| f.path != path_str);

        // Add to front
        self.recent_files.insert(
            0,
            RecentFile {
                path: path_str,
                name,
                last_opened: SystemTime::now(),
            },
        );

        // Keep only last 10 files
        self.recent_files.truncate(10);
    }
}

impl Default for FileService {
    fn default() -> Self {
        Self::new()
    }
}
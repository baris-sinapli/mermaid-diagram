use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MermaidFile {
    pub path: PathBuf,
    pub content: String,
    pub last_modified: Option<std::time::SystemTime>,
    pub size: Option<u64>,
}

#[derive(Debug, Serialize, Clone)]
pub struct FileOperationResult {
    pub success: bool,
    pub message: String,
    pub path: Option<String>,
}

impl FileOperationResult {
    pub fn success(message: String, path: Option<String>) -> Self {
        Self {
            success: true,
            message,
            path,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            message,
            path: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentFile {
    pub path: String,
    pub name: String,
    pub last_opened: std::time::SystemTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BatchProcessOptions {
    pub input_directory: String,
    pub output_directory: String,
    pub file_pattern: String, // e.g., "*.mmd"
    pub output_format: super::DiagramFormat,
    pub preserve_structure: bool,
}
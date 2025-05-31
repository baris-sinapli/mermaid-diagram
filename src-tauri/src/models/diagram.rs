use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Clone)]
pub struct DiagramOptions {
    pub format: DiagramFormat,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub background: String,
    pub theme: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum DiagramFormat {
    Png,
    Svg,
    Pdf,
    Jpg,
}

impl std::fmt::Display for DiagramFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DiagramFormat::Png => write!(f, "png"),
            DiagramFormat::Svg => write!(f, "svg"),
            DiagramFormat::Pdf => write!(f, "pdf"),
            DiagramFormat::Jpg => write!(f, "jpg"),
        }
    }
}

#[derive(Debug, Serialize, Clone)]
pub struct DiagramResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub error_message: Option<String>,
    pub generation_time: u64,
    pub file_size: Option<u64>,
}

impl DiagramResult {
    pub fn success(output_path: String, generation_time: u64, file_size: Option<u64>) -> Self {
        Self {
            success: true,
            output_path: Some(output_path),
            error_message: None,
            generation_time,
            file_size,
        }
    }

    pub fn error(error_message: String, generation_time: u64) -> Self {
        Self {
            success: false,
            output_path: None,
            error_message: Some(error_message),
            generation_time,
            file_size: None,
        }
    }
}
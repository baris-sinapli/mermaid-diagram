use crate::models::{DiagramOptions, DiagramResult};
use crate::utils::path::get_mmdc_paths;
use std::io::Write;
use std::process::Command;
use std::time::Instant;

pub struct MmdcService {
    mmdc_path: Option<String>,
}

impl MmdcService {
    pub fn new() -> Self {
        Self { mmdc_path: None }
    }

    /// Find and cache the mmdc executable path
    pub fn initialize(&mut self) -> Result<(), String> {
        self.mmdc_path = self.find_mmdc_executable();
        if self.mmdc_path.is_some() {
            Ok(())
        } else {
            Err("mmdc executable not found".to_string())
        }
    }

    /// Check if mmdc is available and return version info
    pub fn check_availability(&mut self) -> Result<String, String> {
        if self.mmdc_path.is_none() {
            self.initialize()?;
        }

        if let Some(ref path) = self.mmdc_path {
            match Command::new(path).arg("--version").output() {
                Ok(output) => {
                    if output.status.success() {
                        let version = String::from_utf8_lossy(&output.stdout);
                        Ok(format!("✅ mmdc found at {}: {}", path, version.trim()))
                    } else {
                        let error = String::from_utf8_lossy(&output.stderr);
                        Err(format!("❌ mmdc error at {}: {}", path, error))
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

    /// Generate diagram from mermaid code
    pub fn generate_diagram(
        &mut self,
        code: &str,
        options: &DiagramOptions,
        output_path: &std::path::Path,
    ) -> DiagramResult {
        let start_time = Instant::now();

        // Ensure mmdc is available
        if self.mmdc_path.is_none() {
            if let Err(e) = self.initialize() {
                return DiagramResult::error(e, start_time.elapsed().as_millis() as u64);
            }
        }

        let mmdc_path = match &self.mmdc_path {
            Some(path) => path,
            None => {
                return DiagramResult::error(
                    "mmdc not available".to_string(),
                    start_time.elapsed().as_millis() as u64,
                );
            }
        };

        // Build command
        let mut cmd = Command::new(mmdc_path);
        cmd.arg("-i").arg("-").arg("-o").arg(output_path);

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

        if let Some(ref theme) = options.theme {
            cmd.arg("-t").arg(theme);
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
                    if let Err(e) = stdin.write_all(code.as_bytes()) {
                        return DiagramResult::error(
                            format!("Failed to write to stdin: {}", e),
                            start_time.elapsed().as_millis() as u64,
                        );
                    }
                    let _ = stdin; // Close stdin
                }

                match child.wait_with_output() {
                    Ok(output) => {
                        let generation_time = start_time.elapsed().as_millis() as u64;

                        if output.status.success() {
                            // Check if file exists and get size
                            if output_path.exists() {
                                let file_size = std::fs::metadata(output_path)
                                    .ok()
                                    .map(|meta| meta.len());

                                DiagramResult::success(
                                    output_path.to_string_lossy().to_string(),
                                    generation_time,
                                    file_size,
                                )
                            } else {
                                DiagramResult::error(
                                    "File was not created".to_string(),
                                    generation_time,
                                )
                            }
                        } else {
                            let error_msg = String::from_utf8_lossy(&output.stderr);
                            DiagramResult::error(
                                format!("mmdc error: {}", error_msg),
                                generation_time,
                            )
                        }
                    }
                    Err(e) => DiagramResult::error(
                        format!("Command execution error: {}", e),
                        start_time.elapsed().as_millis() as u64,
                    ),
                }
            }
            Err(e) => DiagramResult::error(
                format!("Failed to start mmdc: {}", e),
                start_time.elapsed().as_millis() as u64,
            ),
        }
    }

    fn find_mmdc_executable(&self) -> Option<String> {
        let paths = get_mmdc_paths();

        for path in paths {
            log::debug!("Trying mmdc path: {}", path);
            if let Ok(output) = Command::new(&path).arg("--version").output() {
                if output.status.success() {
                    log::info!("Found working mmdc at: {}", path);
                    return Some(path);
                }
            }
        }

        None
    }
}

impl Default for MmdcService {
    fn default() -> Self {
        Self::new()
    }
}
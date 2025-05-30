pub mod path;
pub mod platform;

// Re-export specific items we use
pub use path::{get_mmdc_paths, get_npm_global_path, generate_output_path, ensure_directory_exists};
pub use platform::{DefaultDirectories, PlatformInfo, open_with_default_app};
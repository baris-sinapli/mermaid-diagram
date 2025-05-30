pub mod diagram;
pub mod file_ops;
pub mod system;

// Re-export specific items we actually use
pub use diagram::{check_mmdc, generate_diagram, generate_diagram_to_file, MmdcServiceState};
pub use file_ops::{
    clear_recent_files, find_mermaid_files_in_directory, get_file_info, get_recent_files,
    read_mermaid_file, validate_file_path, write_mermaid_file, FileServiceState,
};
pub use system::{
    get_default_directories, get_environment_variable, get_system_info, greet, 
    list_environment_variables, open_file_location,
};
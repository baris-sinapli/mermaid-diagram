// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;
mod utils;

use commands::{
    check_mmdc, generate_diagram, generate_diagram_to_file, MmdcServiceState,
    clear_recent_files, find_mermaid_files_in_directory, get_file_info, get_recent_files,
    read_mermaid_file, validate_file_path, write_mermaid_file, FileServiceState,
    get_default_directories, get_environment_variable, get_system_info, greet, 
    list_environment_variables, open_file_location,
};
use services::{FileService, MmdcService};
use std::env;

fn main() {
    env_logger::init();
    
    log::info!("Starting Mermaid GUI v2.0...");
    log::info!("Platform: {} {}", env::consts::OS, env::consts::ARCH);
    
    let mmdc_service = MmdcService::new();
    let file_service = FileService::new();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(MmdcServiceState::new(mmdc_service))
        .manage(FileServiceState::new(file_service))
        .invoke_handler(tauri::generate_handler![
            // System commands
            greet,
            get_system_info,
            get_default_directories,
            get_environment_variable,
            list_environment_variables,
            open_file_location,
            // Diagram commands
            check_mmdc,
            generate_diagram,
            generate_diagram_to_file,
            // File operation commands
            read_mermaid_file,
            write_mermaid_file,
            get_recent_files,
            clear_recent_files,
            validate_file_path,
            get_file_info,
            find_mermaid_files_in_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
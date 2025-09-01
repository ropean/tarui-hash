// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod hash;
mod models;

use commands::{HashState, compute_sha256, cancel_hash};

fn main() {
    tauri::Builder::default()
        .manage(HashState::new())
        .invoke_handler(tauri::generate_handler![
            compute_sha256,
            cancel_hash,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

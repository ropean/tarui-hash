use std::path::Path;
use std::time::Instant;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, BufReader};
use tokio::sync::CancellationToken;
use sha2::{Sha256, Digest};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use tauri::Window;

use crate::models::{HashResult, HashProgress};

const CHUNK_SIZE: usize = 4 * 1024 * 1024; // 4MB chunks

pub async fn compute_sha256(
    file_path: &str,
    window: &Window,
    cancellation_token: &CancellationToken,
) -> Result<HashResult, String> {
    let path = Path::new(file_path);
    
    // Validate file exists and is readable
    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }
    
    if !path.is_file() {
        return Err(format!("Path is not a file: {}", file_path));
    }

    let start_time = Instant::now();
    
    // Get file size
    let metadata = tokio::fs::metadata(path)
        .await
        .map_err(|e| format!("Failed to read file metadata: {}", e))?;
    
    let file_size = metadata.len();
    
    // Open file for reading
    let file = File::open(path)
        .await
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    let mut reader = BufReader::new(file);
    let mut hasher = Sha256::new();
    let mut buffer = vec![0u8; CHUNK_SIZE];
    let mut total_processed = 0u64;
    
    loop {
        // Check for cancellation
        if cancellation_token.is_cancelled() {
            return Err("Hash operation was cancelled".to_string());
        }
        
        let bytes_read = reader
            .read(&mut buffer)
            .await
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        if bytes_read == 0 {
            break; // End of file
        }
        
        // Update hash with chunk
        hasher.update(&buffer[..bytes_read]);
        total_processed += bytes_read as u64;
        
        // Emit progress event
        let progress = HashProgress::new(total_processed, file_size);
        window.emit("hash-progress", &progress)
            .map_err(|e| format!("Failed to emit progress event: {}", e))?;
    }
    
    // Finalize hash
    let hash_bytes = hasher.finalize();
    let hex_hash = hex::encode(hash_bytes);
    let base64_hash = BASE64.encode(hash_bytes);
    
    let elapsed_ms = start_time.elapsed().as_millis();
    
    Ok(HashResult {
        hex: hex_hash,
        base64: base64_hash,
        elapsed_ms,
        bytes: file_size,
        path: file_path.to_string(),
    })
}

use tokio::sync::{Mutex, CancellationToken};
use tauri::{command, State, Window};

use crate::hash::compute_sha256;
use crate::models::HashResult;

pub struct HashState {
    pub cancellation_token: Mutex<Option<CancellationToken>>,
}

impl HashState {
    pub fn new() -> Self {
        Self {
            cancellation_token: Mutex::new(None),
        }
    }
}

#[command]
pub async fn compute_sha256(
    file_path: String,
    window: Window,
    state: State<'_, HashState>,
) -> Result<HashResult, String> {
    // Cancel any existing hash operation
    {
        let mut token_guard = state.cancellation_token.lock().await;
        if let Some(token) = token_guard.take() {
            token.cancel();
        }
    }
    
    // Create new cancellation token
    let cancellation_token = CancellationToken::new();
    {
        let mut token_guard = state.cancellation_token.lock().await;
        *token_guard = Some(cancellation_token.clone());
    }
    
    // Compute hash
    let result = compute_sha256(&file_path, &window, &cancellation_token).await;
    
    // Clear cancellation token
    {
        let mut token_guard = state.cancellation_token.lock().await;
        *token_guard = None;
    }
    
    result
}

#[command]
pub async fn cancel_hash(state: State<'_, HashState>) -> Result<(), String> {
    let mut token_guard = state.cancellation_token.lock().await;
    if let Some(token) = token_guard.take() {
        token.cancel();
    }
    Ok(())
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct HashResult {
    pub hex: String,
    pub base64: String,
    pub elapsed_ms: u128,
    pub bytes: u64,
    pub path: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct HashProgress {
    pub processed: u64,
    pub total: u64,
    pub percent: u8,
}

impl HashProgress {
    pub fn new(processed: u64, total: u64) -> Self {
        let percent = if total > 0 {
            ((processed as f64 / total as f64) * 100.0) as u8
        } else {
            0
        };
        
        Self {
            processed,
            total,
            percent,
        }
    }
}

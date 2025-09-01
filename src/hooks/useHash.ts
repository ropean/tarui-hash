import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/dialog';
import { HashResult, HashProgress } from '../types';
import { isValidFilePath, sanitizePath } from '../utils/validators';

export function useHash() {
  const [isHashing, setIsHashing] = useState(false);
  const [progress, setProgress] = useState<HashProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const computeHash = useCallback(async (filePath: string): Promise<HashResult | null> => {
    if (!isValidFilePath(filePath)) {
      setError('Invalid file path');
      return null;
    }

    const sanitizedPath = sanitizePath(filePath);
    setIsHashing(true);
    setProgress(null);
    setError(null);

    try {
      // Listen for progress updates
      const unlisten = await listen('hash-progress', (event) => {
        setProgress(event.payload as HashProgress);
      });

      // Compute hash
      const result = await invoke<HashResult>('compute_sha256', { 
        filePath: sanitizedPath 
      });

      unlisten();
      setIsHashing(false);
      setProgress(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsHashing(false);
      setProgress(null);
      return null;
    }
  }, []);

  const cancelHash = useCallback(async () => {
    try {
      await invoke('cancel_hash');
      setIsHashing(false);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel hash operation');
    }
  }, []);

  const browseFile = useCallback(async (): Promise<string | null> => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'All Files',
          extensions: ['*']
        }]
      });

      if (selected && !Array.isArray(selected)) {
        return selected;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open file dialog');
      return null;
    }
  }, []);

  return {
    isHashing,
    progress,
    error,
    computeHash,
    cancelHash,
    browseFile,
    clearError: () => setError(null)
  };
}

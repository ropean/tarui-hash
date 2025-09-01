import { useState, useCallback, useEffect } from 'react';
import { FileInput } from './components/FileInput';
import { ProgressBar } from './components/ProgressBar';
import { HashOutput } from './components/HashOutput';
import { useHash } from './hooks/useHash';
import { useSettings } from './hooks/useSettings';
import { HashResult } from './types';

function App() {
  const [pathInput, setPathInput] = useState('');
  const [lastResult, setLastResult] = useState<HashResult | null>(null);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  const { isHashing, progress, error, computeHash, cancelHash, browseFile, clearError } = useHash();
  const { settings, updateSetting } = useSettings();

  const handlePathChange = useCallback((path: string) => {
    setPathInput(path);
    clearError();
  }, [clearError]);

  const handleHash = useCallback(async () => {
    if (!pathInput.trim()) return;

    setPreviousPath(pathInput);
    const result = await computeHash(pathInput);
    
    if (result) {
      setLastResult(result);
      // Update window title with completion
      document.title = `Tauri Hash256 - ${result.path}`;
    }
  }, [pathInput, computeHash]);

  const handleCancel = useCallback(async () => {
    await cancelHash();
    // Restore previous path on cancellation
    if (previousPath) {
      setPathInput(previousPath);
    }
    // Restore window title
    document.title = 'Tauri Hash256';
  }, [cancelHash, previousPath]);

  const handleBrowse = useCallback(async (): Promise<string | null> => {
    const selected = await browseFile();
    if (selected) {
      setPathInput(selected);
      if (settings.autoHash) {
        // Small delay to ensure state is updated
        setTimeout(() => handleHash(), 100);
      }
    }
    return selected;
  }, [browseFile, settings.autoHash, handleHash]);

  const handleAutoHashChange = useCallback((enabled: boolean) => {
    updateSetting('autoHash', enabled);
  }, [updateSetting]);

  const handleUppercaseChange = useCallback((enabled: boolean) => {
    updateSetting('uppercase', enabled);
  }, [updateSetting]);

  // Update window title during hashing
  useEffect(() => {
    if (isHashing && progress) {
      document.title = `Tauri Hash256 - ${progress.percent}%`;
    } else if (!isHashing) {
      document.title = 'Tauri Hash256';
    }
  }, [isHashing, progress]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tauri Hash256
          </h1>
          <p className="text-lg text-gray-600">
            Professional SHA-256 File Hasher
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* File Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              File Selection
            </h2>
            <FileInput
              pathInput={pathInput}
              onPathChange={handlePathChange}
              onBrowse={handleBrowse}
              onHash={handleHash}
              isHashing={isHashing}
              autoHash={settings.autoHash}
              onAutoHashChange={handleAutoHashChange}
              error={error}
            />
          </div>

          {/* Progress Section */}
          {isHashing && progress && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProgressBar progress={progress} onCancel={handleCancel} />
            </div>
          )}

          {/* Results Section */}
          {lastResult && !isHashing && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <HashOutput
                result={lastResult}
                uppercase={settings.uppercase}
                onUppercaseChange={handleUppercaseChange}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Built with Tauri, React, and Rust</p>
        </div>
      </div>
    </div>
  );
}

export default App;

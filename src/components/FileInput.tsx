import { useState, useCallback } from 'react';

interface FileInputProps {
  pathInput: string;
  onPathChange: (path: string) => void;
  onBrowse: () => Promise<string | null>;
  onHash: () => void;
  isHashing: boolean;
  autoHash: boolean;
  onAutoHashChange: (enabled: boolean) => void;
  error: string | null;
}

export function FileInput({
  pathInput,
  onPathChange,
  onBrowse,
  onHash,
  isHashing,
  autoHash,
  onAutoHashChange,
  error
}: FileInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePathSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (pathInput.trim() && !isHashing) {
      onHash();
    }
  }, [pathInput, isHashing, onHash]);

  const handleBrowse = useCallback(async () => {
    const selected = await onBrowse();
    if (selected) {
      onPathChange(selected);
      if (autoHash) {
        onHash();
      }
    }
  }, [onBrowse, onPathChange, autoHash, onHash]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // In Tauri 1.0, we can get the file path from the File object
      const file = files[0];
      const filePath = (file as any).path || file.name;
      onPathChange(filePath);
      if (autoHash) {
        onHash();
      }
    }
  }, [onPathChange, autoHash, onHash]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        onPathChange(text.trim());
        if (autoHash) {
          onHash();
        }
      }
    } catch (err) {
      console.warn('Failed to read clipboard:', err);
    }
  }, [onPathChange, autoHash, onHash]);

  const handleClear = useCallback(() => {
    onPathChange('');
  }, [onPathChange]);

  return (
    <div className="space-y-4">
      {/* File Path Input */}
      <form onSubmit={handlePathSubmit} className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={pathInput}
            onChange={(e) => onPathChange(e.target.value)}
            placeholder="Enter file path, drag & drop, or paste from clipboard"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isHashing}
          />
          <button
            type="button"
            onClick={handleBrowse}
            disabled={isHashing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Browse
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isHashing || !pathInput}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
        
        {pathInput && (
          <button
            type="submit"
            disabled={isHashing}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isHashing ? 'Hashing...' : 'Compute Hash'}
          </button>
        )}
      </form>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-gray-600">
          Drag & drop a file here, or{' '}
          <button
            type="button"
            onClick={handlePaste}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            paste from clipboard
          </button>
        </p>
      </div>

      {/* Settings */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoHash}
            onChange={(e) => onAutoHashChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Auto-hash on file selection</span>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}

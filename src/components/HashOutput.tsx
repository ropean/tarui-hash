import { useCallback } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { HashResult } from '../types';
import { formatBytes, formatDuration, formatThroughput } from '../utils/formatters';

interface HashOutputProps {
  result: HashResult;
  uppercase: boolean;
  onUppercaseChange: (enabled: boolean) => void;
}

export function HashOutput({ result, uppercase, onUppercaseChange }: HashOutputProps) {
  const { hex, base64, elapsedMs, bytes, path } = result;
  
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const displayHex = uppercase ? hex.toUpperCase() : hex.toLowerCase();
  
  return (
    <div className="space-y-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      {/* File Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">File Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Path:</span>
            <p className="text-gray-600 break-all">{path}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Size:</span>
            <p className="text-gray-600">{formatBytes(bytes)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <p className="text-gray-600">{formatDuration(elapsedMs)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Throughput:</span>
            <p className="text-gray-600">{formatThroughput(bytes, elapsedMs)}</p>
          </div>
        </div>
      </div>

      {/* Hash Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">SHA-256 Hash</h3>
        
        {/* HEX Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Hexadecimal</label>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => onUppercaseChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Uppercase</span>
              </label>
              <button
                onClick={() => copyToClipboard(displayHex)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="p-3 bg-white border border-gray-300 rounded-md font-mono text-sm break-all">
            {displayHex}
          </div>
        </div>

        {/* Base64 Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Base64</label>
            <button
              onClick={() => copyToClipboard(base64)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Copy
            </button>
          </div>
          <div className="p-3 bg-white border border-gray-300 rounded-md font-mono text-sm break-all">
            {base64}
          </div>
        </div>
      </div>
    </div>
  );
}

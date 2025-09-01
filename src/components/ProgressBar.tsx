import { HashProgress } from '../types';
import { formatBytes, formatNumber } from '../utils/formatters';

interface ProgressBarProps {
  progress: HashProgress;
  onCancel: () => void;
}

export function ProgressBar({ progress, onCancel }: ProgressBarProps) {
  const { processed, total, percent } = progress;
  
  return (
    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900">
          Computing SHA-256...
        </span>
        <span className="text-sm text-blue-700">
          {percent}%
        </span>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-blue-700">
        <span>
          {formatBytes(processed)} / {formatBytes(total)}
        </span>
        <span>
          {formatNumber(processed)} / {formatNumber(total)} bytes
        </span>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

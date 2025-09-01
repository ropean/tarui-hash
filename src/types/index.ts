export interface HashResult {
  hex: string;
  base64: string;
  elapsedMs: number;
  bytes: number;
  path: string;
}

export interface HashProgress {
  processed: number;
  total: number;
  percent: number;
}

export interface AppState {
  pathInput: string;
  hexOutput: string;
  base64Output: string;
  isHashing: boolean;
  uppercase: boolean;
  autoHash: boolean;
  progress: HashProgress | null;
  lastResult: HashResult | null;
  error: string | null;
  previousPath: string | null;
}

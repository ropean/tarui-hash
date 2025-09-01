export function isValidFilePath(path: string): boolean {
  // Basic validation for file paths
  if (!path || path.trim() === '') return false;
  
  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(path)) return false;
  
  // Check for valid file extension or directory structure
  if (path.includes('\\') || path.includes('/')) return true;
  
  // Simple file with extension
  if (path.includes('.')) return true;
  
  return false;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizePath(path: string): string {
  return path.trim().replace(/["']/g, '');
}

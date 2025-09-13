// Utility to get the correct Socket.IO URL for client connections
export function getSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  const protocol = window.location.protocol;
  const host = window.location.host;
  
  // In development, always use localhost:3000
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  return `${protocol}//${host}`;
}

export const resolveBackendUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

  if (!envUrl) {
    return '';
  }

  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const isLocal = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');

    // In preview/production HTTPS, connecting to http://localhost fails with Mixed Content / Network Error
    if (isHttps && isLocal) {
      return '';
    }

    // If running on port 3000 or any unified port, localhost:5000 is invalid
    if (isLocal && window.location.port !== '5000') {
      return '';
    }
  }

  return envUrl;
};

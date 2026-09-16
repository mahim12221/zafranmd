export const resolveBackendUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

  if (!envUrl) {
    return '';
  }

  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const isLocal = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');

    if (isHttps && isLocal) {
      return '';
    }

    if (isLocal && window.location.port !== '5000') {
      return '';
    }
  }

  return envUrl;
};

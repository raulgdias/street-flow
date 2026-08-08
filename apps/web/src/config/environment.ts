const defaultApiUrl = 'http://localhost:3000';

export const apiBaseUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL?.trim() ?? ''
  : defaultApiUrl;

export const buildApiUrl = (path: string) => {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  return `${baseUrl}${path}`;
};

const defaultApiUrl = "http://localhost:3000";

export const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL?.trim() ||
      process.env.API_BASE_URL?.trim() ||
      ""
    : defaultApiUrl;

export const buildApiUrl = (path: string) => {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  return `${baseUrl}${path}`;
};

export const normalizeImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("data:") || /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return buildApiUrl(normalizedPath);
};

import { API_ORIGIN, PUBLIC_URL_PREFIX_RE } from '../config/apiOrigin';
/**
 * Builds a full URL for an image stored on the SayHey API server
 * @param imagePath - The image path or key from the database
 * @param userId - Optional user/listener ID for constructing paths
 * @returns Full URL to the image
 */
export function buildImageUrl(imagePath: string | null | undefined, userId?: number): string | null {
  if (!imagePath) return null;

  const baseUrl = `${API_ORIGIN}/public/`;

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with 'uploads', use it directly
  if (imagePath.startsWith('uploads')) {
    return `${baseUrl}${imagePath}`;
  }

  // If we have a userId, construct the path as 'uploads/user/{userId}/{filename}'
  if (userId) {
    // Remove base URL if present in the path
    const cleanPath = imagePath.replace(PUBLIC_URL_PREFIX_RE, '');
    return `${baseUrl}uploads/user/${userId}/${cleanPath}`;
  }

  // Otherwise, just prepend the base URL
  const cleanPath = imagePath.replace(PUBLIC_URL_PREFIX_RE, '');
  return `${baseUrl}${cleanPath}`;
}


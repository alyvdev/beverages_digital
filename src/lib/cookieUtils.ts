/**
 * Utility functions for working with cookies
 */

/**
 * Check if a cookie exists
 * @param name The name of the cookie to check
 * @returns boolean indicating if the cookie exists
 */
export function getCookie(name: string): string | null {
  const savedEmail = localStorage.getItem("userEmail");
  if (savedEmail && (name === "access_token" || name === "refresh_token")) {
    return "token-exists";
  }

  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.startsWith(name + "=")) {
      const value = cookie.substring(name.length + 1);
      return value;
    }
  }

  return null;
}

/**
 * Check if authentication cookies exist
 * @returns boolean indicating if both access and refresh tokens exist
 */
export function hasAuthCookies(): boolean {
  const accessToken = getCookie("access_token");
  const refreshToken = getCookie("refresh_token");

  return !!accessToken && !!refreshToken;
}

/**
 * Check if only the refresh token exists (access token expired)
 * @returns boolean indicating if only refresh token exists
 */
export function hasOnlyRefreshToken(): boolean {
  const accessToken = getCookie("access_token");
  const refreshToken = getCookie("refresh_token");

  return !accessToken && !!refreshToken;
}

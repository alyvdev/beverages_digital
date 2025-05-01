/**
 * Utility functions for working with cookies
 */

/**
 * Check if a cookie exists
 * @param name The name of the cookie to check
 * @returns string value of cookie or null if it doesn't exist
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");

  // Debug cookie search
  // console.log(`Searching for cookie: ${name}`);
  // console.log(`All cookies: ${document.cookie}`);

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.startsWith(name + "=")) {
      const value = cookie.substring(name.length + 1);
      // console.log(`Found cookie ${name}: ${value.substring(0, 10)}...`);
      return value;
    }
  }

  // console.log(`Cookie ${name} not found`);
  return null;
}

/**
 * Check if authentication cookies exist
 * @returns boolean indicating if both access and refresh tokens exist
 */
export function hasAuthCookies(): boolean {
  // Direct check for cookies in document.cookie
  const cookieStr = document.cookie;

  // More precise check for cookies - look for the exact cookie name followed by =
  // This avoids false positives from partial matches
  const hasAccess = cookieStr
    .split(";")
    .some((c) => c.trim().startsWith("access_token="));
  const hasRefresh = cookieStr
    .split(";")
    .some((c) => c.trim().startsWith("refresh_token="));

  // For debugging
  // console.log("Cookie string:", cookieStr);
  // console.log("Has access token:", hasAccess);
  // console.log("Has refresh token:", hasRefresh);

  return hasAccess && hasRefresh;
}

/**
 * Check if only the refresh token exists (access token expired)
 * @returns boolean indicating if only refresh token exists
 */
export function hasOnlyRefreshToken(): boolean {
  // Direct check for cookies in document.cookie
  const cookieStr = document.cookie;

  // More precise check for cookies - look for the exact cookie name followed by =
  // This avoids false positives from partial matches
  const hasAccess = cookieStr
    .split(";")
    .some((c) => c.trim().startsWith("access_token="));
  const hasRefresh = cookieStr
    .split(";")
    .some((c) => c.trim().startsWith("refresh_token="));

  return !hasAccess && hasRefresh;
}

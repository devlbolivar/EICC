"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CsrfTokenData {
  token: string;
  expiresIn: number; // seconds
}

interface UseCsrfTokenReturn {
  /** The current CSRF token */
  token: string | null;
  /** Whether the token is being fetched */
  loading: boolean;
  /** Error message if token fetch failed */
  error: string | null;
  /** Fetch a new CSRF token */
  refreshToken: () => Promise<string | null>;
  /** Get headers with CSRF token included */
  getHeaders: (additionalHeaders?: HeadersInit) => HeadersInit;
  /** Make a fetch request with CSRF token automatically included */
  fetchWithCsrf: (url: string, options?: RequestInit) => Promise<Response>;
}

const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_ENDPOINT = "/api/csrf";
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000; // Refresh 1 minute before expiry

/**
 * Hook for managing CSRF tokens in React components
 *
 * Features:
 * - Automatically fetches token on mount
 * - Auto-refreshes before expiration
 * - Handles 403 errors by refreshing token
 * - Provides helper methods for making authenticated requests
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { token, loading, fetchWithCsrf, refreshToken } = useCsrfToken();
 *
 *   const handleSubmit = async (data) => {
 *     const response = await fetchWithCsrf('/api/user/profile', {
 *       method: 'PUT',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data),
 *     });
 *
 *     if (!response.ok) {
 *       // Handle error
 *     }
 *   };
 *
 *   if (loading) return <Spinner />;
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCsrfToken(): UseCsrfTokenReturn {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures in timers
  const tokenRef = useRef<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch a new CSRF token from the server
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(CSRF_ENDPOINT, {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch CSRF token: ${response.status}`);
      }

      const data: { success: boolean; data: CsrfTokenData } = await response.json();

      if (!data.success || !data.data?.token) {
        throw new Error("Invalid CSRF token response");
      }

      const newToken = data.data.token;
      const expiresInMs = data.data.expiresIn * 1000;

      setToken(newToken);
      tokenRef.current = newToken;

      // Schedule automatic refresh before token expires
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const refreshDelay = Math.max(0, expiresInMs - TOKEN_REFRESH_BUFFER_MS);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken();
      }, refreshDelay);

      return newToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch CSRF token";
      setError(errorMessage);
      console.error("CSRF token fetch error:", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get headers object with CSRF token included
   */
  const getHeaders = useCallback(
    (additionalHeaders?: HeadersInit): HeadersInit => {
      const headers: Record<string, string> = {};

      // Add additional headers first
      if (additionalHeaders) {
        if (additionalHeaders instanceof Headers) {
          additionalHeaders.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(additionalHeaders)) {
          additionalHeaders.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          Object.assign(headers, additionalHeaders);
        }
      }

      // Add CSRF token
      const currentToken = tokenRef.current;
      if (currentToken) {
        headers[CSRF_HEADER_NAME] = currentToken;
      }

      return headers;
    },
    []
  );

  /**
   * Make a fetch request with CSRF token automatically included
   * Handles 403 errors by refreshing token and retrying once
   */
  const fetchWithCsrf = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Ensure we have a token
      let currentToken = tokenRef.current;
      if (!currentToken) {
        currentToken = await refreshToken();
        if (!currentToken) {
          throw new Error("Failed to obtain CSRF token");
        }
      }

      // Merge headers
      const headers = getHeaders(options.headers);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || "include",
      });

      // Handle CSRF token expiration/invalid
      if (response.status === 403) {
        const errorData = await response.clone().json().catch(() => ({}));

        // Check if it's a CSRF error
        if (
          errorData.error?.includes("CSRF") ||
          errorData.error?.includes("csrf")
        ) {
          console.warn("CSRF token invalid or expired, refreshing...");

          // Refresh token and retry once
          const newToken = await refreshToken();
          if (newToken) {
            const retryHeaders = getHeaders(options.headers);

            return fetch(url, {
              ...options,
              headers: retryHeaders,
              credentials: options.credentials || "include",
            });
          }
        }
      }

      return response;
    },
    [refreshToken, getHeaders]
  );

  // Fetch token on mount
  useEffect(() => {
    refreshToken();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshToken]);

  return {
    token,
    loading,
    error,
    refreshToken,
    getHeaders,
    fetchWithCsrf,
  };
}

/**
 * Higher-order function to wrap API calls with CSRF protection
 *
 * @example
 * ```ts
 * const updateProfile = withCsrfProtection(async (data, fetchWithCsrf) => {
 *   const response = await fetchWithCsrf('/api/user/profile', {
 *     method: 'PUT',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data),
 *   });
 *   return response.json();
 * });
 * ```
 */
export function withCsrfProtection<T extends unknown[], R>(
  fn: (
    fetchWithCsrf: UseCsrfTokenReturn["fetchWithCsrf"],
    ...args: T
  ) => Promise<R>
) {
  return async (
    fetchWithCsrf: UseCsrfTokenReturn["fetchWithCsrf"],
    ...args: T
  ): Promise<R> => {
    return fn(fetchWithCsrf, ...args);
  };
}

export default useCsrfToken;

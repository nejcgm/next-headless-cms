import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { logger } from "./logger";

// Lazy import unstable_cache to avoid client-side errors
let unstableCache: typeof import("next/cache").unstable_cache | undefined;
if (typeof window === "undefined") {
  // Server-side only
  unstableCache = require("next/cache").unstable_cache;
}

// Axios instance with defaults
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request/response interceptors for logging
axiosInstance.interceptors.request.use(
  (config) => {
    logger.debug(`Axios Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error("Axios Request Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      logger.error(`Axios Response Error: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      logger.error("Axios Network Error: No response received");
    } else {
      logger.error(`Axios Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export interface ApiClientOptions {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Next.js cache configuration - uses unstable_cache under the hood */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

async function makeAxiosRequest<T>(url: string, options: ApiClientOptions): Promise<T> {
  const { params, body, headers, timeout } = options;

  const config: AxiosRequestConfig = {
    method: body ? "POST" : "GET",
    url,
    params,
    data: body,
    headers,
    timeout,
  };

  const response = await axiosInstance.request<T>(config);
  return response.data;
}

/**
 * Generic API client using axios with optional Next.js caching support.
 * When `next` option is provided, uses unstable_cache for server-side caching.
 */
export async function apiClient<T = unknown>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const { next, ...axiosOptions } = options;

  // If no caching requested, or on client-side, make direct request
  if (!next || !unstableCache) {
    return makeAxiosRequest<T>(url, axiosOptions);
  }

  // Use Next.js unstable_cache for server-side caching
  const cachedRequest = unstableCache(
    async () => makeAxiosRequest<T>(url, axiosOptions),
    [url, JSON.stringify(axiosOptions.params), JSON.stringify(axiosOptions.body)],
    {
      revalidate: next.revalidate === false ? undefined : next.revalidate,
      tags: next.tags,
    }
  );

  return cachedRequest();
}

/**
 * Direct axios request without caching - for simple use cases.
 */
export async function axiosRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<T>(config);
  return response.data;
}

/**
 * Get the axios instance for advanced usage (interceptors, etc.)
 */
export { axiosInstance };

import "server-only";

import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { unstable_cache } from "next/cache";
import { logger } from "./logger";

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export async function apiClient<T = unknown>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const { next, ...axiosOptions } = options;

  if (!next) {
    return makeAxiosRequest<T>(url, axiosOptions);
  }

  const cachedRequest = unstable_cache(
    async () => makeAxiosRequest<T>(url, axiosOptions),
    [url, JSON.stringify(axiosOptions.params), JSON.stringify(axiosOptions.body)],
    {
      revalidate: next.revalidate === false ? undefined : next.revalidate,
      tags: next.tags,
    }
  );

  return cachedRequest();
}

export async function axiosRequest<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<T>(config);
  return response.data;
}

export { axiosInstance };

// API utility functions for retry logic and rate limiting

import pRetry, { AbortError } from "p-retry";
import PQueue from "p-queue";
import axios, { AxiosError } from "axios";
import { config } from "../config/index.js";

// Rate limiting queue (5 requests per second by default)
const apiQueue = new PQueue({
  intervalCap: config.apiRateLimit,
  interval: 1000,
  timeout: 30000,
});

/**
 * Retry options for API calls
 */
const retryOptions = {
  retries: 3,
  factor: 2, // Exponential backoff
  minTimeout: 1000,
  maxTimeout: 5000,
  onFailedAttempt: (error: any) => {
    console.log(
      `[API Retry] Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
    );
  },
};

/**
 * Execute an API call with retry logic and rate limiting
 */
export async function apiCall<T>(
  name: string,
  fn: () => Promise<T>,
  options?: any
): Promise<T> {
  return apiQueue.add(async () => {
    return pRetry(async () => {
      try {
        return await fn();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          // Don't retry on 4xx errors (except 429 rate limit)
          if (
            axiosError.response &&
            axiosError.response.status >= 400 &&
            axiosError.response.status < 500 &&
            axiosError.response.status !== 429
          ) {
            throw new AbortError(
              `API call failed with status ${axiosError.response.status}: ${name}`
            );
          }

          console.error(`[API Error] ${name}:`, axiosError.message);
        }

        throw error;
      }
    }, { ...retryOptions, ...options });
  }) as Promise<T>;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 429;
  }
  return false;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
}

/**
 * Get queue statistics
 */
export function getQueueStats() {
  return {
    size: apiQueue.size,
    pending: apiQueue.pending,
    isPaused: apiQueue.isPaused,
  };
}

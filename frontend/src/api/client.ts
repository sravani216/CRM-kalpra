// Centralized API Client with automatic Bearer token, 401 handling, and GitHub Pages demo mock fallback
import { mockEngine } from './mockEngine';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode: number;
  errors?: any;
  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function isGitHubPagesOrStatic(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io');
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = options.method || 'GET';

  // 1. If on GitHub Pages, directly use mockEngine so HTTPS static host never fails
  if (isGitHubPagesOrStatic()) {
    let bodyData = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        bodyData = JSON.parse(options.body);
      } catch (e) {}
    }
    return mockEngine.handleRequest<T>(endpoint, method, bodyData);
  }

  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.hash !== '#/login' && window.location.pathname !== '/login') {
        window.location.hash = '#/login';
      }
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${res.status}`,
        res.status,
        data.errors
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // If backend connection fails locally, fall back to mockEngine seamlessly
    console.warn(`API call to ${url} failed, falling back to in-memory mock engine:`, err.message);
    let bodyData = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        bodyData = JSON.parse(options.body);
      } catch (e) {}
    }
    return mockEngine.handleRequest<T>(endpoint, method, bodyData);
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    if (isGitHubPagesOrStatic()) {
      return mockEngine.handleRequest<T>(endpoint, 'GET', undefined, params);
    }
    return request<T>(url, { method: 'GET' });
  },

  post: <T = any>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch: <T = any>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put: <T = any>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: <T = any>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' });
  },

  upload: <T = any>(endpoint: string, formData: FormData) => {
    if (isGitHubPagesOrStatic()) {
      return mockEngine.handleRequest<T>(endpoint, 'POST', formData);
    }
    return request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  },
};

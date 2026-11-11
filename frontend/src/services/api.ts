import { handleMockRequest } from './mockEngine';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  [key: string]: any;
}

class ApiService {
  private isStaticOrGitHubPages(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    // GitHub Pages or HTTPS static hosting cannot hit insecure localhost:5000 directly
    return host.includes('github.io') || (protocol === 'https:' && !API_BASE_URL.startsWith('https:'));
  }

  private getToken(): string | null {
    return localStorage.getItem('kalpra_crm_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isMock = this.isStaticOrGitHubPages();

    if (isMock) {
      const method = options.method || 'GET';
      let bodyData = undefined;
      if (options.body && typeof options.body === 'string') {
        try {
          bodyData = JSON.parse(options.body);
        } catch (e) {}
      }
      return handleMockRequest(endpoint, method, bodyData);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 401) {
        localStorage.removeItem('kalpra_crm_token');
        localStorage.removeItem('kalpra_crm_user');
        window.location.hash = '#/login';
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err: any) {
      console.warn(`Local API at ${url} unavailable or blocked, falling back to mock engine:`, err?.message);
      // Fallback to mock engine gracefully if local backend is down
      const method = options.method || 'GET';
      let bodyData = undefined;
      if (options.body && typeof options.body === 'string') {
        try {
          bodyData = JSON.parse(options.body);
        } catch (e) {}
      }
      return handleMockRequest(endpoint, method, bodyData);
    }
  }

  get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) query = `?${qs}`;
    }
    if (this.isStaticOrGitHubPages()) {
      return handleMockRequest(`${endpoint}${query}`, 'GET', undefined, params);
    }
    return this.request<T>(`${endpoint}${query}`, { method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile(file: File): Promise<{ success: boolean; fileUrl: string; filename: string }> {
    if (this.isStaticOrGitHubPages()) {
      return handleMockRequest('/upload', 'POST');
    }

    try {
      const url = `${API_BASE_URL}/upload`;
      const token = this.getToken();
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await res.json();
    } catch (e) {
      return handleMockRequest('/upload', 'POST');
    }
  }
}

export const api = new ApiService();

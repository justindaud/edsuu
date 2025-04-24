import { Session } from 'next-auth'

// Generic response type for API calls
export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Common request options type
export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  session?: Session | null
  headers?: Record<string, string>
}

export async function fetchFromAPI<T>(
  endpoint: string,
  options: APIRequestOptions = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    body,
    session,
    headers = {},
  } = options

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api${endpoint}`
  
  const requestHeaders: Record<string, string> = {
    ...headers,
    'Content-Type': 'application/json',
    ...(session?.user?.accessToken && { 'Authorization': `Bearer ${session.user.accessToken}` })
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }

    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Utility functions for common CRUD operations
export const api = {
  get: async <T>(endpoint: string, session?: Session | null) => 
    fetchFromAPI<T>(endpoint, { session }),

  post: async <T>(endpoint: string, body: any, session?: Session | null) =>
    fetchFromAPI<T>(endpoint, { method: 'POST', body, session }),

  put: async <T>(endpoint: string, body: any, session?: Session | null) =>
    fetchFromAPI<T>(endpoint, { method: 'PUT', body, session }),

  patch: async <T>(endpoint: string, body: any, session?: Session | null) =>
    fetchFromAPI<T>(endpoint, { method: 'PATCH', body, session }),

  delete: async <T>(endpoint: string, session?: Session | null) =>
    fetchFromAPI<T>(endpoint, { method: 'DELETE', session })
} 
import { auth } from './auth';

export async function fetchFromCoreAPI(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  const token = session?.user?.accessToken;

  const API_URL = process.env.CORE_API_URL || 'http://localhost:3003';
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    console.error(`Core API Error (${res.status}):`, await res.text());
    throw new Error(`Failed to fetch from Core API: ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const jsonRes = await res.json();
    if (jsonRes && jsonRes.success !== undefined && 'data' in jsonRes) {
      return jsonRes.data;
    }
    return jsonRes;
  }
  
  return res.text();
}

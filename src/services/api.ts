import { Location } from '../types/location';
import { wixAuth } from './wixAuth';

// Production API URL with /api prefix
const API_URL = process.env.REACT_APP_API_URL || 'https://mapsy-api.nextechspires.com/api';

/**
 * Make an authenticated API request using Wix fetchWithAuth
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await wixAuth.fetchWithAuth(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  // Handle 204 No Content (e.g., DELETE requests)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Make a FormData request (for file uploads)
 */
async function apiFormDataRequest<T>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await wixAuth.fetchWithAuth(url, {
    method,
    body: formData,
    // Don't set Content-Type - fetchWithAuth handles FormData correctly
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Widget type for the widget selector
export interface Widget {
  compId: string;
  widgetName: string;
  defaultView: 'map' | 'list';
  createdAt: string;
  updatedAt: string;
}

export const api = {
  // Get all widgets for the current instance
  getWidgets: async (): Promise<Widget[]> => {
    return apiRequest<Widget[]>('/widgets', { method: 'GET' });
  },

  getLocations: async (): Promise<Location[]> => {
    return apiRequest<Location[]>('/locations', { method: 'GET' });
  },

  createLocation: async (formData: FormData): Promise<Location> => {
    return apiFormDataRequest<Location>('/locations', formData, 'POST');
  },

  updateLocation: async (id: string, formData: FormData): Promise<Location> => {
    return apiFormDataRequest<Location>(`/locations/${id}`, formData, 'POST');
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiRequest<void>(`/locations/${id}`, { method: 'DELETE' });
  },
};

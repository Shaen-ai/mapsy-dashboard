import { Location } from '../types/location';
import { wixAuth } from './wixAuth';

// Production API URL with /api prefix
const API_URL = process.env.REACT_APP_API_URL || 'https://mapsy-api.nextechspires.com/api';
console.log('[Mapsy Dashboard] API URL:', API_URL);

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

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    return api.getLocations();
  },

  getOne: async (id: string | number): Promise<Location> => {
    return apiRequest<Location>(`/locations/${id}`, { method: 'GET' });
  },

  create: async (formData: FormData): Promise<Location> => {
    return api.createLocation(formData);
  },

  update: async (id: string | number, formData: FormData): Promise<Location> => {
    return api.updateLocation(String(id), formData);
  },

  delete: async (id: string | number): Promise<void> => {
    return api.deleteLocation(String(id));
  },
};

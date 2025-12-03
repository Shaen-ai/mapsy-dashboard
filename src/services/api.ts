import axios from 'axios';
import { Location } from '../types/location';
import { wixAuth } from './wixAuth';

// Production API URL with /api prefix - v1.0.2
const API_URL = process.env.REACT_APP_API_URL || 'https://mapsy-api.nextechspires.com/api';
console.log('[Mapsy Dashboard] API URL:', API_URL);

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include Wix instance token
apiClient.interceptors.request.use(
  (config) => {
    const instanceToken = wixAuth.getInstanceToken();
    const compId = wixAuth.getCompId();

    if (instanceToken) {
      config.headers.Authorization = `Bearer ${instanceToken}`;
      console.log('[API] Added Wix instance token to request');
    }

    if (compId) {
      config.headers['X-Wix-Comp-Id'] = compId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    const response = await apiClient.get('/widgets');
    return response.data;
  },

  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get('/locations');
    return response.data;
  },

  createLocation: async (location: FormData): Promise<Location> => {
    const response = await apiClient.post('/locations', location, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateLocation: async (id: string, location: FormData): Promise<Location> => {
    const response = await apiClient.post(`/locations/${id}`, location, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },
};

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    const response = await api.getLocations();
    return response;
  },

  getOne: async (id: string | number): Promise<Location> => {
    const response = await apiClient.get(`/locations/${id}`);
    return response.data;
  },

  create: async (location: FormData): Promise<Location> => {
    return api.createLocation(location);
  },

  update: async (id: string | number, location: FormData): Promise<Location> => {
    return api.updateLocation(String(id), location);
  },

  delete: async (id: string | number): Promise<void> => {
    return api.deleteLocation(String(id));
  },
};
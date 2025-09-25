import axios from 'axios';
import { Location } from '../types/location';

// Production API URL with /api prefix - v1.0.2
const API_URL = process.env.REACT_APP_API_URL || 'https://mapsy-api.nextechspires.com/api';
console.log('[Mapsy Dashboard] API URL:', API_URL);

export const api = {
  getLocations: async (): Promise<Location[]> => {
    const response = await axios.get(`${API_URL}/locations`);
    return response.data;
  },

  createLocation: async (location: FormData): Promise<Location> => {
    const response = await axios.post(`${API_URL}/locations`, location, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateLocation: async (id: string, location: FormData): Promise<Location> => {
    const response = await axios.post(`${API_URL}/locations/${id}`, location, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/locations/${id}`);
  },
};

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    const response = await api.getLocations();
    return response;
  },

  getOne: async (id: string | number): Promise<Location> => {
    const response = await axios.get(`${API_URL}/locations/${id}`);
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
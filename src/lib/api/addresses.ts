import axios from 'axios';
import { Address, CreateAddressRequest } from '@/types/frontend';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Address API
export const addressesApi = {
  // Get user's addresses
  getAddresses: async (): Promise<{
    success: boolean;
    data?: Address[];
    message: string;
  }> => {
    try {
      const response = await api.get('/api/addresses');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to fetch addresses'
        : 'Failed to fetch addresses';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Get specific address
  getAddress: async (addressId: string): Promise<{
    success: boolean;
    data?: Address;
    message: string;
  }> => {
    try {
      const response = await api.get(`/api/addresses/${addressId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to fetch address'
        : 'Failed to fetch address';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Create new address
  createAddress: async (addressData: CreateAddressRequest): Promise<{
    success: boolean;
    data?: Address;
    message: string;
  }> => {
    try {
      const response = await api.post('/api/addresses', addressData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to create address'
        : 'Failed to create address';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Update address
  updateAddress: async (addressId: string, addressData: Partial<CreateAddressRequest>): Promise<{
    success: boolean;
    data?: Address;
    message: string;
  }> => {
    try {
      const response = await api.put(`/api/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to update address'
        : 'Failed to update address';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Delete address
  deleteAddress: async (addressId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.delete(`/api/addresses/${addressId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to delete address'
        : 'Failed to delete address';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

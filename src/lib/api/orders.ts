import axios from 'axios';
import { 
  Order, 
  CreateOrderRequest, 
  OrderListResponse,
  CheckoutSummary,
  CreatePaymentIntentRequest,
  PaymentIntentResponse
} from '@/types/frontend';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Orders API
export const ordersApi = {
  // Get user's orders with pagination
  getOrders: async (page = 1, limit = 10, status?: string): Promise<{
    success: boolean;
    data?: OrderListResponse;
    message: string;
  }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await api.get(`/api/orders?${params}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to create order'
        : 'Failed to create order';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Get specific order
  getOrder: async (orderId: string): Promise<{
    success: boolean;
    data?: Order;
    message: string;
  }> => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to fetch order'
        : 'Failed to fetch order';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<{
    success: boolean;
    data?: Order;
    message: string;
  }> => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to create order'
        : 'Failed to create order';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<{
    success: boolean;
    data?: Order;
    message: string;
  }> => {
    try {
      const response = await api.put(`/api/orders/${orderId}`, { 
        status: 'CANCELLED' 
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to cancel order'
        : 'Failed to cancel order';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

// Checkout API
export const checkoutApi = {
  // Get checkout summary
  getCheckoutSummary: async (): Promise<{
    success: boolean;
    data?: CheckoutSummary;
    message: string;
  }> => {
    try {
      const response = await api.get('/api/checkout/summary');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to fetch checkout summary'
        : 'Failed to fetch checkout summary';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Create payment intent
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<{
    success: boolean;
    data?: PaymentIntentResponse;
    message: string;
  }> => {
    try {
      const response = await api.post('/api/checkout/create-payment-intent', data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to create payment intent'
        : 'Failed to create payment intent';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

export default api;

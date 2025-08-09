import axios from "axios";
import { PaymentMethod, CreatePaymentMethodRequest } from "@/types/frontend";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL
      : "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Payment Methods API
export const paymentMethodsApi = {
  // Get user's payment methods
  getPaymentMethods: async (): Promise<{
    success: boolean;
    data?: PaymentMethod[];
    message: string;
  }> => {
    try {
      const response = await api.get("/api/payment-methods");
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch payment methods"
        : "Failed to fetch payment methods";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Get specific payment method
  getPaymentMethod: async (
    paymentMethodId: string
  ): Promise<{
    success: boolean;
    data?: PaymentMethod;
    message: string;
  }> => {
    try {
      const response = await api.get(`/api/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to fetch payment method"
        : "Failed to fetch payment method";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Save new payment method
  savePaymentMethod: async (
    paymentMethodData: CreatePaymentMethodRequest
  ): Promise<{
    success: boolean;
    data?: PaymentMethod;
    message: string;
  }> => {
    try {
      const response = await api.post(
        "/api/payment-methods",
        paymentMethodData
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to save payment method"
        : "Failed to save payment method";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Update payment method
  updatePaymentMethod: async (
    paymentMethodId: string,
    data: Partial<{
      billingName: string;
      billingEmail: string;
      isDefault: boolean;
    }>
  ): Promise<{
    success: boolean;
    data?: PaymentMethod;
    message: string;
  }> => {
    try {
      const response = await api.put(
        `/api/payment-methods/${paymentMethodId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update payment method"
        : "Failed to update payment method";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Delete payment method
  deletePaymentMethod: async (
    paymentMethodId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.delete(
        `/api/payment-methods/${paymentMethodId}`
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete payment method"
        : "Failed to delete payment method";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

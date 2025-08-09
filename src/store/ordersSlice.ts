import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '@/lib/api/orders';
import { Order, CreateOrderRequest } from '@/types/frontend';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  actionLoading: string | null; // For specific loading states
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: null,
  actionLoading: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string } = {}) => {
    const response = await ordersApi.getOrders(page, limit, status);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (orderId: string) => {
    const response = await ordersApi.getOrder(orderId);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderRequest) => {
    const response = await ordersApi.createOrder(orderData);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string) => {
    const response = await ordersApi.cancelOrder(orderId);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setActionLoading: (state, action: PayloadAction<string | null>) => {
      state.actionLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });

    // Fetch single order
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order';
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.actionLoading = 'creating';
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.error.message || 'Failed to create order';
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state, action) => {
        state.actionLoading = `cancelling-${action.meta.arg}`;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = null;
        // Update the order in the list
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        // Update current order if it's the same
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.error.message || 'Failed to cancel order';
      });
  },
});

export const { clearError, clearCurrentOrder, setActionLoading } = ordersSlice.actions;
export default ordersSlice.reducer;

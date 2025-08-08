import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchCart, removeItemFromCart, updateCartItemQuantity } from '@/lib/api/cart';
import { Cart } from '@/types/frontend';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  actionLoading: null,
};

// Async thunks
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCart();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to load cart');
      }
    } catch (error) {
      return rejectWithValue('Failed to load cart. Please try again.');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await removeItemFromCart(itemId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to remove item');
      }
    } catch (error) {
      return rejectWithValue('Failed to remove item from cart');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await updateCartItemQuantity(itemId, quantity);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      return rejectWithValue('Failed to update quantity');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
    },
    setActionLoading: (state, action: PayloadAction<string | null>) => {
      state.actionLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load cart
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove item
    builder
      .addCase(removeFromCart.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.actionLoading = null;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Update quantity
    builder
      .addCase(updateQuantity.pending, (state, action) => {
        state.actionLoading = action.meta.arg.itemId;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.actionLoading = null;
        state.error = null;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearCart, setActionLoading, clearError } = cartSlice.actions;
export default cartSlice.reducer;

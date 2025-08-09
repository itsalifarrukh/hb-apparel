import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchWishlist,
  removeItemFromWishlist,
  addToCartFromWishlist,
  moveAllToCart,
} from '@/lib/api/wishlist';
import { Wishlist } from '@/types/frontend';

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  bulkActionLoading: boolean;
}

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
  actionLoading: null,
  bulkActionLoading: false,
};

// Async thunks
export const loadWishlist = createAsyncThunk(
  'wishlist/loadWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWishlist();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to load wishlist');
      }
    } catch {
      return rejectWithValue('Failed to load wishlist. Please try again.');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await removeItemFromWishlist(productId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to remove item');
      }
    } catch {
      return rejectWithValue('Failed to remove item from wishlist');
    }
  }
);

export const addToCartFromWishlistAction = createAsyncThunk(
  'wishlist/addToCart',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await addToCartFromWishlist(productId);
      if (response.success) {
        // After successfully adding to cart, remove from wishlist
        const removeResponse = await removeItemFromWishlist(productId);
        if (removeResponse.success) {
          return { productId, wishlist: removeResponse.data, message: 'Item added to cart and removed from wishlist' };
        } else {
          // If removal fails, still return success for cart addition but with a warning
          return { productId, message: 'Item added to cart but failed to remove from wishlist' };
        }
      } else {
        return rejectWithValue(response.message || 'Failed to add item to cart');
      }
    } catch {
      return rejectWithValue('Failed to add item to cart');
    }
  }
);

export const moveAllToCartAction = createAsyncThunk(
  'wishlist/moveAllToCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await moveAllToCart();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to move items to cart');
      }
    } catch {
      return rejectWithValue('Failed to move items to cart');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlist = null;
    },
    setActionLoading: (state, action: PayloadAction<string | null>) => {
      state.actionLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load wishlist
    builder
      .addCase(loadWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.error = null;
      })
      .addCase(loadWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove item
    builder
      .addCase(removeFromWishlist.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.actionLoading = null;
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Add to cart
    builder
      .addCase(addToCartFromWishlistAction.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(addToCartFromWishlistAction.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.error = null;
        // Update wishlist if removal was successful
        if (action.payload.wishlist) {
          state.wishlist = action.payload.wishlist;
        }
      })
      .addCase(addToCartFromWishlistAction.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });

    // Move all to cart
    builder
      .addCase(moveAllToCartAction.pending, (state) => {
        state.bulkActionLoading = true;
      })
      .addCase(moveAllToCartAction.fulfilled, (state, action) => {
        state.bulkActionLoading = false;
        state.wishlist = action.payload.wishlist;
        state.error = null;
      })
      .addCase(moveAllToCartAction.rejected, (state, action) => {
        state.bulkActionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist, setActionLoading, clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;

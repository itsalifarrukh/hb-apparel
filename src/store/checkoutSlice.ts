import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { checkoutApi } from '@/lib/api/orders';
import { CheckoutSummary, CreatePaymentIntentRequest, PaymentIntentResponse } from '@/types/frontend';

interface CheckoutState {
  checkoutSummary: CheckoutSummary | null;
  paymentIntent: PaymentIntentResponse | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
  selectedShippingAddressId: string | null;
  selectedBillingAddressId: string | null;
  selectedPaymentMethodId: string | null;
  useShippingAsBilling: boolean;
  actionLoading: string | null;
}

const initialState: CheckoutState = {
  checkoutSummary: null,
  paymentIntent: null,
  loading: false,
  error: null,
  currentStep: 1, // 1: Address, 2: Payment, 3: Review, 4: Complete
  selectedShippingAddressId: null,
  selectedBillingAddressId: null,
  selectedPaymentMethodId: null,
  useShippingAsBilling: true,
  actionLoading: null,
};

// Async thunks
export const fetchCheckoutSummary = createAsyncThunk(
  'checkout/fetchCheckoutSummary',
  async () => {
    const response = await checkoutApi.getCheckoutSummary();
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const createPaymentIntent = createAsyncThunk(
  'checkout/createPaymentIntent',
  async (data: CreatePaymentIntentRequest) => {
    const response = await checkoutApi.createPaymentIntent(data);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setSelectedShippingAddress: (state, action: PayloadAction<string | null>) => {
      state.selectedShippingAddressId = action.payload;
      // Auto-set billing address if using shipping as billing
      if (state.useShippingAsBilling) {
        state.selectedBillingAddressId = action.payload;
      }
    },
    setSelectedBillingAddress: (state, action: PayloadAction<string | null>) => {
      state.selectedBillingAddressId = action.payload;
    },
    setSelectedPaymentMethod: (state, action: PayloadAction<string | null>) => {
      state.selectedPaymentMethodId = action.payload;
    },
    setUseShippingAsBilling: (state, action: PayloadAction<boolean>) => {
      state.useShippingAsBilling = action.payload;
      if (action.payload) {
        state.selectedBillingAddressId = state.selectedShippingAddressId;
      } else {
        state.selectedBillingAddressId = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    resetCheckout: (state) => {
      state.currentStep = 1;
      state.selectedShippingAddressId = null;
      state.selectedBillingAddressId = null;
      state.selectedPaymentMethodId = null;
      state.useShippingAsBilling = true;
      state.paymentIntent = null;
      state.error = null;
    },
    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setActionLoading: (state, action: PayloadAction<string | null>) => {
      state.actionLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch checkout summary
    builder
      .addCase(fetchCheckoutSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckoutSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutSummary = action.payload;
        
        // Auto-select default addresses if available
        const defaultShipping = action.payload.addresses.find(addr => 
          addr.isDefault && (addr.type === 'SHIPPING' || addr.type === 'BOTH')
        );
        const defaultBilling = action.payload.addresses.find(addr => 
          addr.isDefault && (addr.type === 'BILLING' || addr.type === 'BOTH')
        );
        
        if (defaultShipping && !state.selectedShippingAddressId) {
          state.selectedShippingAddressId = defaultShipping.id;
        }
        if (defaultBilling && !state.selectedBillingAddressId) {
          state.selectedBillingAddressId = defaultBilling.id;
        }
        
        // Auto-select default payment method
        const defaultPaymentMethod = action.payload.paymentMethods.find(pm => pm.isDefault);
        if (defaultPaymentMethod && !state.selectedPaymentMethodId) {
          state.selectedPaymentMethodId = defaultPaymentMethod.id!;
        }
        
        state.error = null;
      })
      .addCase(fetchCheckoutSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch checkout summary';
      });

    // Create payment intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.actionLoading = 'payment-intent';
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.paymentIntent = action.payload;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.error.message || 'Failed to create payment intent';
      });
  },
});

export const {
  setCurrentStep,
  setSelectedShippingAddress,
  setSelectedBillingAddress,
  setSelectedPaymentMethod,
  setUseShippingAsBilling,
  clearError,
  clearPaymentIntent,
  resetCheckout,
  nextStep,
  previousStep,
  setActionLoading,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

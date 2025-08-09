"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedShippingAddress,
  setSelectedBillingAddress,
  setUseShippingAsBilling,
  nextStep,
  clearError,
} from "@/store/checkoutSlice";
import { addressesApi } from "@/lib/api/addresses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AddressForm } from "@/components/checkout/forms/AddressForm";
import { AddressSelector } from "@/components/checkout/forms/AddressSelector";
import { MapPin, Plus, ArrowRight } from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  company: z.string().optional(),
  streetLine1: z.string().min(1, "Street address is required"),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().optional(),
  saveForFuture: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function AddressStep() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [showNewBillingForm, setShowNewBillingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    checkoutSummary,
    selectedShippingAddressId,
    selectedBillingAddressId,
    useShippingAsBilling,
    error,
  } = useAppSelector((state) => state.checkout);

  const shippingForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      company: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phoneNumber: '',
      saveForFuture: false,
    }
  });

  const billingForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      company: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phoneNumber: '',
      saveForFuture: false,
    }
  });

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const handleShippingAddressSelect = (addressId: string | null) => {
    dispatch(setSelectedShippingAddress(addressId));
  };

  const handleBillingAddressSelect = (addressId: string | null) => {
    dispatch(setSelectedBillingAddress(addressId));
  };

  const handleUseShippingAsBilling = (checked: boolean) => {
    dispatch(setUseShippingAsBilling(checked));
  };

  const handleShippingFormSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      const { saveForFuture, ...addressData } = data;

      const response = await addressesApi.createAddress({
        ...addressData,
        type: "SHIPPING",
        isDefault: saveForFuture,
      });

      if (response.success && response.data) {
        dispatch(setSelectedShippingAddress(response.data.id));
        setShowNewShippingForm(false);
        toast({
          title: "Success",
          description: "Shipping address saved successfully",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save shipping address';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBillingFormSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      const { saveForFuture, ...addressData } = data;

      const response = await addressesApi.createAddress({
        ...addressData,
        type: "BILLING",
        isDefault: saveForFuture,
      });

      if (response.success && response.data) {
        dispatch(setSelectedBillingAddress(response.data.id));
        setShowNewBillingForm(false);
        toast({
          title: "Success",
          description: "Billing address saved successfully",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save billing address';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    // Validate that we have the required addresses
    if (!selectedShippingAddressId && !showNewShippingForm) {
      toast({
        title: "Shipping Address Required",
        description: "Please select or add a shipping address",
        variant: "destructive",
      });
      return;
    }

    if (
      !useShippingAsBilling &&
      !selectedBillingAddressId &&
      !showNewBillingForm
    ) {
      toast({
        title: "Billing Address Required",
        description: "Please select or add a billing address",
        variant: "destructive",
      });
      return;
    }

    dispatch(nextStep());
  };

  if (!checkoutSummary) {
    return null;
  }

  const addresses = checkoutSummary.addresses;
  const shippingAddresses = addresses.filter(
    (addr) => addr.type === "SHIPPING" || addr.type === "BOTH"
  );
  const billingAddresses = addresses.filter(
    (addr) => addr.type === "BILLING" || addr.type === "BOTH"
  );

  return (
    <div className="space-y-6">
      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewShippingForm ? (
            <>
              <AddressSelector
                addresses={shippingAddresses}
                selectedAddressId={selectedShippingAddressId}
                onAddressSelect={handleShippingAddressSelect}
              />

              <Button
                variant="outline"
                onClick={() => setShowNewShippingForm(true)}
                className="w-full gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add New Shipping Address
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">New Shipping Address</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewShippingForm(false)}
                >
                  Cancel
                </Button>
              </div>

              <AddressForm
                form={shippingForm}
                onSubmit={handleShippingFormSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Save Shipping Address"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Use Shipping as Billing Checkbox */}
      <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
        <Checkbox
          id="use-shipping-as-billing"
          checked={useShippingAsBilling}
          onCheckedChange={handleUseShippingAsBilling}
        />
        <label
          htmlFor="use-shipping-as-billing"
          className="text-sm font-medium cursor-pointer"
        >
          Use shipping address as billing address
        </label>
      </div>

      {/* Billing Address */}
      {!useShippingAsBilling && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewBillingForm ? (
              <>
                <AddressSelector
                  addresses={billingAddresses}
                  selectedAddressId={selectedBillingAddressId}
                  onAddressSelect={handleBillingAddressSelect}
                />

                <Button
                  variant="outline"
                  onClick={() => setShowNewBillingForm(true)}
                  className="w-full gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add New Billing Address
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">New Billing Address</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewBillingForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <AddressForm
                  form={billingForm}
                  onSubmit={handleBillingFormSubmit}
                  isSubmitting={isSubmitting}
                  submitLabel="Save Billing Address"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 hover:shadow-lg transition-all duration-300 text-primary-foreground" 
          size="lg"
        >
          Continue to Payment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

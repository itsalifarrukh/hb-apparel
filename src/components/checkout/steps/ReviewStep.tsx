"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOrder } from "@/store/ordersSlice";
import { previousStep, nextStep, createPaymentIntent, setCurrentStep } from "@/store/checkoutSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Edit,
  Building,
  Phone,
  Zap,
} from "lucide-react";
import { UnsavedStripePaymentForm } from "@/components/checkout/forms/UnsavedStripePaymentForm";
import Image from "next/image";

export function ReviewStep() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [unsavedPaymentMethodId, setUnsavedPaymentMethodId] = useState<string | null>(null);
  const [showUnsavedPaymentForm, setShowUnsavedPaymentForm] = useState(false);

  const {
    checkoutSummary,
    selectedShippingAddressId,
    selectedBillingAddressId,
    selectedPaymentMethodId,
    useShippingAsBilling,
  } = useAppSelector((state) => state.checkout);


  const handleBack = () => {
    dispatch(previousStep());
  };

  const handlePlaceOrderWithUnsavedPayment = async (stripePaymentMethodId: string) => {
    if (!checkoutSummary) return;

    try {
      setIsPlacingOrder(true);

      // Validate required fields
      if (!selectedShippingAddressId) {
        throw new Error('Please select a shipping address');
      }
      
      if (!useShippingAsBilling && !selectedBillingAddressId) {
        throw new Error('Please select a billing address');
      }

      // Create payment intent with the unsaved Stripe payment method
      const paymentIntentData = {
        shippingAddressId: selectedShippingAddressId || undefined,
        billingAddressId: useShippingAsBilling ? selectedShippingAddressId || undefined : selectedBillingAddressId || undefined,
        // Don't pass a saved paymentMethodId, create with Stripe payment method directly
        unsavedStripePaymentMethodId: stripePaymentMethodId,
        savePaymentMethod: false,
      };

      console.log('Creating payment intent for unsaved payment method:', paymentIntentData);
      
      try {
        // Create a custom payment intent for unsaved payment methods
        const response = await fetch('/api/checkout/create-payment-intent-unsaved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentIntentData),
        });
        
        const paymentIntentResult = await response.json();
        if (!response.ok) {
          throw new Error(paymentIntentResult.message || 'Payment intent creation failed');
        }
        
        console.log('Payment intent created successfully:', paymentIntentResult);
      } catch (paymentError: any) {
        console.warn('Payment intent creation failed:', paymentError);
        const msg = paymentError?.message || 'Payment authorization failed';
        toast({
          title: 'Payment Error',
          description: msg,
          variant: 'destructive',
        });
        return; // Stop here if payment fails
      }

      // Create the order
      const orderData = {
        shippingAddressId: selectedShippingAddressId || undefined,
        billingAddressId: useShippingAsBilling ? selectedShippingAddressId || undefined : selectedBillingAddressId || undefined,
        // Don't include a paymentMethodId for unsaved payments
      };

      console.log('Creating order with data:', orderData);
      
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      console.log('Order created successfully:', result);

      // Move to completion step explicitly
      dispatch(setCurrentStep(4));

      toast({
        title: "Order Placed and Paid!",
        description: `Your order #${result.orderNumber} has been placed and payment processed.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      console.error('Error during order placement:', error);
      
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutSummary) return;

    try {
      setIsPlacingOrder(true);

      // Validate required fields
      if (!selectedShippingAddressId) {
        throw new Error('Please select a shipping address');
      }
      
      if (!useShippingAsBilling && !selectedBillingAddressId) {
        throw new Error('Please select a billing address');
      }

      // Create the order first
      const orderData = {
        shippingAddressId: selectedShippingAddressId || undefined,
        billingAddressId: useShippingAsBilling ? selectedShippingAddressId || undefined : selectedBillingAddressId || undefined,
        paymentMethodId: selectedPaymentMethodId || undefined,
      };

      console.log('Creating order with data:', orderData);
      
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      console.log('Order created successfully:', result);

      // Now create payment intent with the orderId if we have a saved payment method
      if (selectedPaymentMethodId) {
        const paymentIntentData = {
          orderId: result.id, // Link payment intent to the order
          paymentMethodId: selectedPaymentMethodId || undefined,
          savePaymentMethod: false,
        };

        console.log('Creating payment intent with orderId:', paymentIntentData);
        
        try {
          const paymentIntentResult = await dispatch(createPaymentIntent(paymentIntentData)).unwrap();
          console.log('Payment intent created successfully:', paymentIntentResult);
        } catch (paymentError: any) {
          console.warn('Payment intent creation failed:', paymentError);
          const msg = paymentError?.message || 'Payment authorization failed';
          toast({
            title: 'Payment Error',
            description: msg,
            variant: 'destructive',
          });
          return; // Stop here if payment fails
        }
      } else {
        console.log('No saved payment method selected, skipping payment intent creation');
      }

      // Move to completion step explicitly
      dispatch(setCurrentStep(4));

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${result.orderNumber} has been placed.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      console.error('Error during order placement:', error);
      
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!checkoutSummary) {
    return null;
  }

  const { cart, orderSummary, addresses, paymentMethods } = checkoutSummary;

  // Find selected addresses and payment method
  const shippingAddress = addresses.find(
    (addr) => addr.id === selectedShippingAddressId
  );
  const billingAddress = useShippingAsBilling
    ? shippingAddress
    : addresses.find((addr) => addr.id === selectedBillingAddressId);
  const paymentMethod = paymentMethods.find(
    (pm) => pm.id === selectedPaymentMethodId
  );

  return (
    <div className="space-y-6">
      {/* Order Items Review */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order Items ({cart.itemCount})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/cart")}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Cart
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
              >
                {/* Product Image */}
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={item.productImage || "/placeholder.jpg"}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">
                    {item.productName}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    {item.activeDeal && (
                      <Badge variant="secondary" className="text-xs">
                        {item.activeDeal.discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-right">
                  {item.savings > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.originalPrice * item.quantity)}
                    </p>
                  )}
                  <p className="font-semibold">
                    {formatCurrency(item.itemTotal)}
                  </p>
                  {item.savings > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Save {formatCurrency(item.savings * item.quantity)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(previousStep())}
            >
              <Edit className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shippingAddress ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{shippingAddress.fullName}</span>
                {shippingAddress.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>

              {shippingAddress.company && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  {shippingAddress.company}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <div>{shippingAddress.streetLine1}</div>
                {shippingAddress.streetLine2 && (
                  <div>{shippingAddress.streetLine2}</div>
                )}
                <div>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.zipCode}
                </div>
                <div>{shippingAddress.country}</div>
              </div>

              {shippingAddress.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {shippingAddress.phoneNumber}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No shipping address selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      {!useShippingAsBilling && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Billing Address
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(previousStep())}
              >
                <Edit className="h-4 w-4 mr-2" />
                Change
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {billingAddress ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{billingAddress.fullName}</span>
                  {billingAddress.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>

                {billingAddress.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-3 w-3" />
                    {billingAddress.company}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <div>{billingAddress.streetLine1}</div>
                  {billingAddress.streetLine2 && (
                    <div>{billingAddress.streetLine2}</div>
                  )}
                  <div>
                    {billingAddress.city}, {billingAddress.state}{" "}
                    {billingAddress.zipCode}
                  </div>
                  <div>{billingAddress.country}</div>
                </div>

                {billingAddress.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {billingAddress.phoneNumber}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No billing address selected
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(previousStep())}
            >
              <Edit className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethod ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                💳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    •••• •••• •••• {paymentMethod.last4}
                  </span>
                  {paymentMethod.brand && (
                    <Badge variant="outline" className="text-xs">
                      {paymentMethod.brand.toUpperCase()}
                    </Badge>
                  )}
                  {paymentMethod.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {paymentMethod.billingName}
                  {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
                    <span className="ml-2">
                      Expires{" "}
                      {String(paymentMethod.expiryMonth).padStart(2, "0")}/
                      {paymentMethod.expiryYear}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">No payment method selected</p>
              {!showUnsavedPaymentForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowUnsavedPaymentForm(true)}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Pay with New Card
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unsaved Payment Form */}
      {!paymentMethod && showUnsavedPaymentForm && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Complete Payment
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUnsavedPaymentForm(false)}
                disabled={isPlacingOrder}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UnsavedStripePaymentForm
              onPaymentComplete={(paymentMethodId) => {
                setUnsavedPaymentMethodId(paymentMethodId);
                handlePlaceOrderWithUnsavedPayment(paymentMethodId);
              }}
              userEmail={checkoutSummary.user.email}
              userName={checkoutSummary.user.firstName && checkoutSummary.user.lastName
                ? `${checkoutSummary.user.firstName} ${checkoutSummary.user.lastName}`
                : ''
              }
              amount={orderSummary.totalAmount}
              disabled={isPlacingOrder}
            />
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(orderSummary.subtotal)}</span>
          </div>

          {orderSummary.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <span className="text-green-600">
                -{formatCurrency(orderSummary.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>
              {orderSummary.shippingCost === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatCurrency(orderSummary.shippingCost)
              )}
            </span>
          </div>

          {orderSummary.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(orderSummary.taxAmount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(orderSummary.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
          disabled={isPlacingOrder}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payment
        </Button>

        <Button
          onClick={handlePlaceOrder}
          className="gap-2"
          size="lg"
          disabled={isPlacingOrder}
        >
          {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPlacingOrder
            ? "Placing Order..."
            : `Place Order - ${formatCurrency(orderSummary.totalAmount)}`}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setSelectedPaymentMethod,
  nextStep,
  previousStep,
  clearError
} from '@/store/checkoutSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethodSelector } from '@/components/checkout/forms/PaymentMethodSelector';
import { StripePaymentForm } from '@/components/checkout/forms/StripePaymentForm';
import { CreditCard, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

export function PaymentStep() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);

  const {
    checkoutSummary,
    selectedPaymentMethodId,
    error
  } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const handlePaymentMethodSelect = (paymentMethodId: string | null) => {
    dispatch(setSelectedPaymentMethod(paymentMethodId));
  };

  const handleNewPaymentMethodSaved = (paymentMethodId: string) => {
    dispatch(setSelectedPaymentMethod(paymentMethodId));
    setShowNewPaymentForm(false);
    toast({
      title: "Success",
      description: "Payment method saved successfully",
    });
  };

  const handleContinue = () => {
    // We can proceed without a payment method for now (payment can be handled at order creation)
    if (showNewPaymentForm) {
      toast({
        title: "Complete Payment Method",
        description: "Please finish adding your payment method or cancel to proceed",
        variant: "destructive",
      });
      return;
    }

    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  if (!checkoutSummary) {
    return null;
  }

  const paymentMethods = checkoutSummary.paymentMethods;

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewPaymentForm ? (
            <>
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedPaymentMethodId={selectedPaymentMethodId}
                onPaymentMethodSelect={handlePaymentMethodSelect}
              />
              
              <Button
                variant="outline"
                onClick={() => setShowNewPaymentForm(true)}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Payment Method
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add New Payment Method</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewPaymentForm(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <StripePaymentForm
                onPaymentMethodSaved={handleNewPaymentMethodSaved}
                userEmail={checkoutSummary.user.email}
                userName={checkoutSummary.user.firstName && checkoutSummary.user.lastName
                  ? `${checkoutSummary.user.firstName} ${checkoutSummary.user.lastName}`
                  : ''
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card className="bg-muted/30 border-2 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <h4 className="font-medium text-foreground mb-1">
                Secure Payment
              </h4>
              <p className="text-muted-foreground mb-2">
                Your payment information is encrypted and processed securely by Stripe. 
                We never store your credit card details on our servers.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  PCI Compliant
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  Stripe Secure
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accepted Payment Methods */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-medium text-foreground mb-3">
              We Accept
            </h4>
            <div className="flex items-center justify-center gap-4 grayscale opacity-70">
              {/* Payment method logos would go here */}
              <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                VISA
              </div>
              <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                MASTERCARD
              </div>
              <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                AMEX
              </div>
              <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                DISCOVER
              </div>
              <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                PAYPAL
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Address
        </Button>
        
        <Button 
          onClick={handleContinue}
          className="gap-2"
          size="lg"
        >
          Review Order
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

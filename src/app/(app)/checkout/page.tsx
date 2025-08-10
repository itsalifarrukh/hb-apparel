'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCheckoutSummary, setCurrentStep } from '@/store/checkoutSlice';
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { AddressStep } from '@/components/checkout/steps/AddressStep';
import { PaymentStep } from '@/components/checkout/steps/PaymentStep';
import { ReviewStep } from '@/components/checkout/steps/ReviewStep';
import { CompleteStep } from '@/components/checkout/steps/CompleteStep';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ShoppingCart } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  const {
    checkoutSummary,
    loading,
    error,
    currentStep,
  } = useAppSelector((state) => state.checkout);

  // Persist/restore checkout step across reloads
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('checkout_current_step') : null;
      if (!initialized && saved) {
        const step = parseInt(saved, 10);
        if (!Number.isNaN(step) && step >= 1 && step <= 4) {
          dispatch(setCurrentStep(step));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, dispatch]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('checkout_current_step', String(currentStep));
      }
    } catch {}
  }, [currentStep]);

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCheckoutSummary())
        .unwrap()
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to load checkout",
            variant: "destructive",
          });
          
          // Redirect to cart if checkout fails
          if (error.message?.includes('Cart is empty')) {
            router.push('/cart');
          }
        });
      setInitialized(true);
    }
  }, [dispatch, initialized, toast, router]);

  const handleStepChange = (step: number) => {
    dispatch(setCurrentStep(step));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AddressStep />;
      case 2:
        return <PaymentStep />;
      case 3:
        return <ReviewStep />;
      case 4:
        return <CompleteStep />;
      default:
        return <AddressStep />;
    }
  };

  if (loading && !checkoutSummary) {
    return (
      <CheckoutLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-12 w-full mb-8" />
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-px w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (error && !checkoutSummary) {
    return (
      <CheckoutLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Alert className="border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="mt-8 space-y-4">
              <div className="text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg">Unable to load your checkout</p>
                <p>Please check your cart and try again</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/cart')}
                >
                  Go to Cart
                </Button>
                <Button 
                  onClick={() => {
                    setInitialized(false);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (!checkoutSummary) {
    return null;
  }

  return (
    <CheckoutLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete your order in just a few steps
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <CheckoutStepper 
              currentStep={currentStep} 
              onStepChange={handleStepChange}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Steps Content */}
            <div className="lg:col-span-2">
              {renderStep()}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CheckoutSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}

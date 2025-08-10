'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const unsavedPaymentFormSchema = z.object({
  billingName: z.string().min(1, 'Billing name is required'),
  billingEmail: z.string().email('Valid email is required').optional(),
});

type UnsavedPaymentFormData = z.infer<typeof unsavedPaymentFormSchema>;

interface UnsavedStripePaymentFormProps {
  onPaymentComplete: (paymentMethodId: string) => void;
  userEmail?: string;
  userName?: string;
  amount: number;
  disabled?: boolean;
}

function UnsavedPaymentForm({ 
  onPaymentComplete, 
  userEmail, 
  userName, 
  amount, 
  disabled = false 
}: UnsavedStripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UnsavedPaymentFormData>({
    resolver: zodResolver(unsavedPaymentFormSchema),
    defaultValues: {
      billingName: userName || '',
      billingEmail: userEmail || '',
    }
  });

  const handleSubmit = async (data: UnsavedPaymentFormData) => {
    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe is not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Error",
        description: "Card element not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create payment method with Stripe (without saving to backend)
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: data.billingName,
          email: data.billingEmail,
        },
      });

      if (error) {
        toast({
          title: "Payment Method Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Pass the Stripe payment method ID directly for unsaved payment
      onPaymentComplete(paymentMethod.id);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment method';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: '400',
        lineHeight: '1.5',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#6366f1',
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981',
      },
    },
    hidePostalCode: true,
    disabled,
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* One-time Payment Notice */}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <strong>One-time payment:</strong> Your card information will not be saved for future orders.
          </AlertDescription>
        </Alert>

        {/* Billing Name */}
        <FormField
          control={form.control}
          name="billingName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="John Doe"
                  className="bg-background"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Billing Email */}
        <FormField
          control={form.control}
          name="billingEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Email (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="john@example.com"
                  type="email"
                  className="bg-background"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Card Details */}
        <div className="space-y-2">
          <FormLabel>Card Details *</FormLabel>
          <div className="p-4 rounded-md border border-input bg-background min-h-[42px] flex items-center">
            <CardElement options={cardElementOptions} className="w-full" />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your card number, expiry date, and CVC
          </p>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-600 font-medium mb-1">
              Secure Payment Processing
            </p>
            <p className="text-blue-700 dark:text-blue-400 text-xs">
              Your payment information is encrypted and processed securely by Stripe. 
              We never store your card details on our servers.
            </p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
          <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={!stripe || isSubmitting || disabled}
            className="min-w-[200px]"
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay ${amount.toFixed(2)} Now
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function UnsavedStripePaymentForm(props: UnsavedStripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <UnsavedPaymentForm {...props} />
    </Elements>
  );
}

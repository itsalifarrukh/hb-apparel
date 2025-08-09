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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { paymentMethodsApi } from '@/lib/api/payment-methods';
import { Loader2, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const paymentFormSchema = z.object({
  billingName: z.string().min(1, 'Billing name is required'),
  billingEmail: z.string().email('Valid email is required').optional(),
  saveForFuture: z.boolean().default(false),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface StripePaymentFormProps {
  onPaymentMethodSaved: (paymentMethodId: string) => void;
  userEmail?: string;
  userName?: string;
}

function PaymentForm({ onPaymentMethodSaved, userEmail, userName }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      billingName: userName || '',
      billingEmail: userEmail || '',
      saveForFuture: true,
    }
  });

  const handleSubmit = async (data: PaymentFormData) => {
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

      // Create payment method with Stripe
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

      // Save payment method to our backend
      const response = await paymentMethodsApi.savePaymentMethod({
        stripePaymentMethodId: paymentMethod.id,
        billingName: data.billingName,
        billingEmail: data.billingEmail,
        isDefault: data.saveForFuture,
      });

      if (response.success && response.data) {
        onPaymentMethodSaved(response.data.id!);
        toast({
          title: "Success",
          description: "Payment method added successfully",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save payment method';
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
        color: '#374151', // Use hex colors instead of CSS variables
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        {/* Save for Future */}
        <FormField
          control={form.control}
          name="saveForFuture"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border/60 p-4 bg-muted/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Save this payment method for future orders
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  This will be securely stored and set as your default payment method
                </p>
              </div>
            </FormItem>
          )}
        />

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

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={!stripe || isSubmitting}
            className="min-w-[160px]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Payment Method
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Check } from 'lucide-react';
import { PaymentMethod } from '@/types/frontend';

interface PaymentMethodSelectorProps {
  paymentMethods: Partial<PaymentMethod>[];
  selectedPaymentMethodId: string | null;
  onPaymentMethodSelect: (paymentMethodId: string | null) => void;
}

export function PaymentMethodSelector({ 
  paymentMethods, 
  selectedPaymentMethodId, 
  onPaymentMethodSelect 
}: PaymentMethodSelectorProps) {
  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No saved payment methods</p>
        <p className="text-sm">Add a new payment method to continue</p>
      </div>
    );
  }

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const getBrandColor = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20';
      case 'mastercard':
        return 'border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-950/20';
      case 'amex':
        return 'border-green-200 text-green-700 bg-green-50 dark:bg-green-950/20';
      case 'discover':
        return 'border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'border-gray-200 text-gray-700 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground mb-4">
        Choose from your saved payment methods:
      </p>
      
      <div className="grid gap-3">
        {paymentMethods.map((paymentMethod) => {
          const isSelected = selectedPaymentMethodId === paymentMethod.id;
          
          return (
            <Card
              key={paymentMethod.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary bg-primary/5 border-primary/30",
                !isSelected && "hover:border-primary/50"
              )}
              onClick={() => onPaymentMethodSelect(paymentMethod.id!)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Card Icon */}
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-lg">
                      {getCardIcon(paymentMethod.brand)}
                    </div>

                    {/* Payment Method Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          •••• •••• •••• {paymentMethod.last4}
                        </span>
                        
                        <div className="flex gap-1">
                          {paymentMethod.isDefault && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              Default
                            </Badge>
                          )}
                          
                          {paymentMethod.brand && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs px-2 py-1", getBrandColor(paymentMethod.brand))}
                            >
                              {paymentMethod.brand.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {paymentMethod.billingName && (
                            <span>{paymentMethod.billingName}</span>
                          )}
                          
                          {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
                            <span>
                              Expires {String(paymentMethod.expiryMonth).padStart(2, '0')}/{paymentMethod.expiryYear}
                            </span>
                          )}
                        </div>
                        
                        {paymentMethod.billingEmail && (
                          <div className="text-xs text-muted-foreground/80 mt-1">
                            {paymentMethod.billingEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedPaymentMethodId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPaymentMethodSelect(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear selection
        </Button>
      )}
    </div>
  );
}

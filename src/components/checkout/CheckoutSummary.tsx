'use client';

import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Truck, Tag, ShoppingBag, Clock } from 'lucide-react';
import Image from 'next/image';

export function CheckoutSummary() {
  const { checkoutSummary, loading } = useAppSelector((state) => state.checkout);

  if (loading || !checkoutSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { cart, orderSummary } = checkoutSummary;

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Order Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              {/* Product Image */}
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                <Image
                  src={item.productImage || '/placeholder.jpg'}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground line-clamp-1">
                  {item.productName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  {item.activeDeal && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      <Tag className="h-3 w-3 mr-1" />
                      {item.activeDeal.discount}% OFF
                    </Badge>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="text-right">
                {item.savings > 0 && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(item.originalPrice * item.quantity)}
                  </p>
                )}
                <p className="font-medium text-sm">
                  {formatCurrency(item.itemTotal)}
                </p>
                {item.savings > 0 && (
                  <p className="text-xs text-green-600">
                    Save {formatCurrency(item.savings * item.quantity)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(orderSummary.subtotal)}
            </span>
          </div>

          {orderSummary.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(orderSummary.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Shipping</span>
            </div>
            <span className="font-medium">
              {orderSummary.shippingCost === 0 ? (
                <span className="text-green-600 font-medium">FREE</span>
              ) : (
                formatCurrency(orderSummary.shippingCost)
              )}
            </span>
          </div>

          {orderSummary.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">
                {formatCurrency(orderSummary.taxAmount)}
              </span>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(orderSummary.totalAmount)}
            </span>
          </div>

          {/* Free Shipping Message */}
          {!orderSummary.freeShippingEligible && (
            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Truck className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="text-primary font-medium">
                  Free shipping on orders over {formatCurrency(orderSummary.freeShippingThreshold)}
                </p>
                <p className="text-muted-foreground">
                  Add {formatCurrency(orderSummary.freeShippingThreshold - orderSummary.subtotal)} more to qualify
                </p>
              </div>
            </div>
          )}

          {/* Deal Expiry Warning */}
          {cart.items.some(item => item.activeDeal) && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-orange-600 font-medium">
                  Limited Time Offers
                </p>
                <p className="text-orange-700 dark:text-orange-400">
                  Complete your purchase to lock in these deals!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

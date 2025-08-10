'use client';

// Removed unused useEffect import
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetCheckout } from '@/store/checkoutSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Home, 
  ArrowRight,
  Clock,
  CreditCard,
  MapPin
} from 'lucide-react';

export function CompleteStep() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentOrder } = useAppSelector((state) => state.orders);

  // Do NOT auto-reset checkout on mount/unmount. In React Strict Mode, effect cleanup
  // runs between double-invocations and would reset immediately back to step 1.
  // We reset explicitly when user navigates away via the action buttons below.

  const handleContinueShopping = () => {
    dispatch(resetCheckout());
    router.push('/products');
  };

  const handleViewOrder = () => {
    if (currentOrder) {
      router.push(`/dashboard/orders/${currentOrder.id}`);
    }
  };

  const handleViewOrders = () => {
    dispatch(resetCheckout());
    router.push('/dashboard/orders');
  };

  if (!currentOrder) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No Order Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find your order details.
        </p>
        <Button onClick={() => router.push('/dashboard/orders')}>
          View All Orders
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Order #{currentOrder.orderNumber}</span>
          <span>•</span>
          <span>{new Date(currentOrder.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Order Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Order Status</h3>
            <Badge className={getStatusColor(currentOrder.status)}>
              {currentOrder.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Processing</p>
                <p className="text-xs text-muted-foreground">1-2 business days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Packaging</p>
                <p className="text-xs text-muted-foreground">1-2 business days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Shipping</p>
                <p className="text-xs text-muted-foreground">3-5 business days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-4">
            {currentOrder.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(currentOrder.subtotal)}</span>
            </div>
            
            {currentOrder.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span className="text-green-600">
                  -{formatCurrency(currentOrder.discountAmount)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {currentOrder.shippingCost === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatCurrency(currentOrder.shippingCost)
                )}
              </span>
            </div>
            
            {currentOrder.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(currentOrder.taxAmount)}</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(currentOrder.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Delivery Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            {currentOrder.shippingAddress && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Shipping Address</h4>
                </div>
                <div className="text-sm text-muted-foreground pl-6">
                  <p>{currentOrder.shippingAddress.fullName}</p>
                  <p>{currentOrder.shippingAddress.streetLine1}</p>
                  {currentOrder.shippingAddress.streetLine2 && (
                    <p>{currentOrder.shippingAddress.streetLine2}</p>
                  )}
                  <p>
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
                  </p>
                  <p>{currentOrder.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {currentOrder.paymentMethod && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Payment Method</h4>
                </div>
                <div className="text-sm text-muted-foreground pl-6">
                  <p>•••• •••• •••• {currentOrder.paymentMethod.last4}</p>
                  <p>{currentOrder.paymentMethod.billingName}</p>
                  {currentOrder.paymentMethod.brand && (
                    <p className="capitalize">{currentOrder.paymentMethod.brand}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• You&apos;ll receive an email confirmation shortly</p>
                <p>• We&apos;ll send you tracking information when your order ships</p>
                <p>• You can track your order status in your account</p>
                <p>• Estimated delivery: 5-7 business days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={handleContinueShopping}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Continue Shopping
        </Button>
        
        <Button 
          onClick={handleViewOrder}
          className="gap-2"
        >
          View Order Details
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleViewOrders}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          View All Orders
        </Button>
      </div>

      {/* Contact Support */}
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-2">
          Need help with your order?
        </p>
        <Button variant="link" className="p-0 h-auto">
          Contact Customer Support
        </Button>
      </div>
    </div>
  );
}

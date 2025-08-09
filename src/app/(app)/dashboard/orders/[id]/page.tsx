'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrder, clearCurrentOrder } from '@/store/ordersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Building,
  Phone,
} from 'lucide-react';
import Image from 'next/image';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderId = params.id as string;

  const { currentOrder, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrder(orderId));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'text-green-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'FAILED':
        return 'text-red-600';
      case 'PENDING':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
              <Package className="h-16 w-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Unable to load order details</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/orders')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
              <Button 
                onClick={() => dispatch(fetchOrder(orderId))}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Order not found</p>
              <p>The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          </div>
          
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/orders')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/orders')}
            className="gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              Order #{currentOrder.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <Badge className={getStatusColor(currentOrder.status)}>
            {currentOrder.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({currentOrder.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={item.productImage || '/placeholder.jpg'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">
                          {item.productName}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <p>Quantity: {item.quantity}</p>
                          {item.productSize && <p>Size: {item.productSize}</p>}
                          {item.productColor && <p>Color: {item.productColor}</p>}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-sm text-green-600">
                            Save {formatCurrency(item.discount * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {currentOrder.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                    
                    {currentOrder.shippingAddress.company && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {currentOrder.shippingAddress.company}
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      <div>{currentOrder.shippingAddress.streetLine1}</div>
                      {currentOrder.shippingAddress.streetLine2 && (
                        <div>{currentOrder.shippingAddress.streetLine2}</div>
                      )}
                      <div>
                        {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
                      </div>
                      <div>{currentOrder.shippingAddress.country}</div>
                    </div>

                    {currentOrder.shippingAddress.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {currentOrder.shippingAddress.phoneNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tracking Information */}
            {currentOrder.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <p className="font-medium">Tracking Number</p>
                      <p className="text-lg font-mono text-primary">
                        {currentOrder.trackingNumber}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                    >
                      Track Package
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
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
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(currentOrder.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Status</span>
                  <Badge className={getStatusColor(currentOrder.status)}>
                    {currentOrder.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Status</span>
                  <span className={`text-sm font-medium ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                    {currentOrder.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shipping Status</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {currentOrder.shippingStatus.replace('_', ' ')}
                  </span>
                </div>

                {currentOrder.shippedAt && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Shipped on {new Date(currentOrder.shippedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {currentOrder.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      Delivered on {new Date(currentOrder.deliveredAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            {currentOrder.paymentMethod && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <p className="font-medium">
                        •••• •••• •••• {currentOrder.paymentMethod.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentOrder.paymentMethod.billingName}
                      </p>
                      {currentOrder.paymentMethod.brand && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {currentOrder.paymentMethod.brand.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {currentOrder.customerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {currentOrder.customerNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

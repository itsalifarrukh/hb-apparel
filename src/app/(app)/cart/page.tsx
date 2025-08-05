"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchCart, removeItemFromCart, updateCartItemQuantity } from "@/lib/api/cart";
import { Cart as CartType } from "@/types/frontend";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowLeft, Package, CreditCard, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";

function Cart() {
  const { status } = useSession();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "authenticated") {
      loadCart();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCart();
      if (response.success) {
        setCart(response.data);
      } else {
        setError(response.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setError("Failed to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const response = await removeItemFromCart(itemId);
      if (response.success) {
        setCart(response.data);
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setActionLoading(itemId);
    try {
      const response = await updateCartItemQuantity(itemId, quantity);
      if (response.success) {
        setCart(response.data);
        toast({
          title: "Success",
          description: "Cart updated",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Authentication required
  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to view your shopping cart.
          </p>
          <Button onClick={() => router.push("/auth/signin")} className="mr-4">
            Sign In
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-8">
          <Button onClick={loadCart}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button onClick={() => router.push("/products")}>
            <Package className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.mainImage || "/default-product.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {item.product.activeDeal && (
                      <Badge
                        variant="destructive"
                        className="absolute top-1 left-1 text-xs"
                      >
                        {item.product.activeDeal.name}
                      </Badge>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Package className="h-3 w-3" />
                      <span className={`text-xs font-medium ${
                        item.product.stock > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {item.product.stock > 0
                          ? `${item.product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {item.product.dealPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(item.product.dealPrice * item.quantity)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Save {formatPrice((item.product.price - item.product.dealPrice) * item.quantity)}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.product.discountedPrice * item.quantity)}
                        </span>
                      )}
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quantity:
                        </label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || actionLoading === item.id}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 text-center min-w-[3rem]">
                            {actionLoading === item.id ? "..." : item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || actionLoading === item.id}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        disabled={actionLoading === item.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        {actionLoading === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Items ({cart.totalItems}):</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
              
              {cart.totalPrice !== cart.totalDiscountedPrice && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Savings:</span>
                  <span>-{formatPrice(cart.totalPrice - cart.totalDiscountedPrice)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(cart.totalDiscountedPrice)}</span>
              </div>
              
              <Button className="w-full" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/products")}
              >
                <Package className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Cart;

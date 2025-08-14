"use client";

import React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, CreditCard, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

function Cart() {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const { cart, loading, error, actionLoading } = useAppSelector(
    (state) => state.cart
  );
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(loadCart());
    } else if (status === "unauthenticated") {
      dispatch(clearCart());
    }
  }, [status, dispatch]);

  const handleRemove = (itemId: string) => {
    dispatch(removeFromCart(itemId)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      }
    });
  };

  const handleQuantityChange = useDebouncedCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      dispatch(updateQuantity({ itemId, quantity })).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          toast({
            title: "Success",
            description: "Cart updated",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update quantity",
            variant: "destructive",
          });
        }
      });
    },
    500 // 500ms debounce delay
  );

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
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your shopping cart.
          </p>
          <Button onClick={() => router.push("/sign-in")} className="mr-4">
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
          <Button onClick={() => dispatch(loadCart())}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
          ]}
        />
        <div className="mt-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
                {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"} in
                your cart
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                          className="block hover:text-primary transition-colors"
                        >
                          <h3 className="font-semibold text-lg text-card-foreground mb-1">
                            {item.product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1 mb-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={`text-xs font-medium ${
                              item.product.stock > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {item.product.stock > 0
                              ? `${item.product.stock} in stock`
                              : "Out of stock"}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          {item.product.dealPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-foreground">
                                {formatPrice(
                                  item.product.dealPrice * item.quantity
                                )}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(
                                  item.product.price * item.quantity
                                )}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                Save{" "}
                                {formatPrice(
                                  (item.product.price -
                                    item.product.dealPrice) *
                                    item.quantity
                                )}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-foreground">
                              {formatPrice(
                                item.product.discountedPrice * item.quantity
                              )}
                            </span>
                          )}
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">
                              Quantity:
                            </label>
                            <div className="flex items-center border border-border rounded">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  actionLoading === item.id
                                }
                                className="h-8 w-8 p-0"
                              >
                                -
                              </Button>
                              <span className="px-3 py-1 text-center min-w-[3rem] text-foreground">
                                {actionLoading === item.id
                                  ? "..."
                                  : item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >= item.product.stock ||
                                  actionLoading === item.id
                                }
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
                      <span>
                        -
                        {formatPrice(
                          cart.totalPrice - cart.totalDiscountedPrice
                        )}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(cart.totalDiscountedPrice)}</span>
                  </div>

                  <Button
                    className="w-full hover:bg-[#455A64] dark:hover:bg-[#f2fbff]"
                    size="lg"
                    onClick={() => router.push("/checkout")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-[#455A64] text-[#263238] dark:text-white dark:border-[#B0BEC5] hover:bg-[#F7F7F7] dark:hover:bg-[#455A64]"
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
      </div>
    </div>
  );
}

export default Cart;

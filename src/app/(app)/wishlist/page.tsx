"use client";

import React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadWishlist,
  removeFromWishlist,
  addToCartFromWishlistAction,
  moveAllToCartAction,
  clearWishlist,
} from "@/store/wishlistSlice";
import { loadCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ArrowLeft,
  Package,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

function Wishlist() {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const { wishlist, loading, error, actionLoading, bulkActionLoading } = useAppSelector(
    (state) => state.wishlist
  );
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(loadWishlist());
    } else if (status === "unauthenticated") {
      dispatch(clearWishlist());
    }
  }, [status, dispatch]);

  const handleRemove = (productId: string) => {
    dispatch(removeFromWishlist(productId)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Success",
          description: "Item removed from wishlist",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddToCart = (productId: string) => {
    dispatch(addToCartFromWishlistAction(productId)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Success",
          description: "Item added to cart",
        });
        // Refresh cart count in navbar
        dispatch(loadCart());
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    });
  };

  const handleMoveAllToCart = () => {
    dispatch(moveAllToCartAction()).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast({
          title: "Success",
          description: "All items moved to cart",
        });
        // Refresh cart count in navbar
        dispatch(loadCart());
      } else {
        toast({
          title: "Error",
          description: "Failed to move items to cart",
          variant: "destructive",
        });
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Authentication required
  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to view your wishlist.
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
          <Button onClick={() => dispatch(loadWishlist())}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Wishlist is Empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save items you love to your wishlist. Review them anytime and easily move them to your bag.
          </p>
          <Button onClick={() => router.push("/products")}>
            <Package className="w-4 h-4 mr-2" />
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Wishlist", href: "/wishlist" },
          ]}
        />
        <div className="mt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlist.totalItems} {wishlist.totalItems === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {/* Bulk Actions */}
        {wishlist.products.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={handleMoveAllToCart}
              disabled={bulkActionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {bulkActionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Moving...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Move All to Cart
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.products.map((product) => (
          <div key={product.id} className="group relative bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-border overflow-hidden">
            {/* Deal Badge */}
            {product.activeDeal && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="destructive" className="text-xs font-bold">
                  {product.activeDeal.name}
                </Badge>
              </div>
            )}

            {/* Remove from Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 z-10 h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border shadow-sm"
              onClick={() => handleRemove(product.id)}
              disabled={actionLoading === product.id}
            >
              {actionLoading === product.id ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              )}
            </Button>

            <Link href={`/products/${product.slug}`} className="block">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={product.mainImage || "/default-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm font-semibold">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                {/* Stock Status */}
                <div className="flex items-center gap-1 mb-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-xs font-medium ${
                    product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  {product.dealPrice ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-card-foreground">
                          ${product.dealPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Save ${(product.price - product.dealPrice).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-card-foreground">
                      ${product.discountedPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Action Button */}
            <div className="p-4 pt-0">
              <Button
                onClick={() => handleAddToCart(product.id)}
                disabled={product.stock === 0 || actionLoading === product.id}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === product.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="mt-12 text-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/products")}
        >
          <Package className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;

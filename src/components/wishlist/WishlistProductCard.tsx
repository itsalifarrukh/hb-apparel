"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WishlistItem } from "@/types/frontend";
import { cn } from "@/lib/utils";
import { generateUniqueSlug } from "@/utils/slug";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface WishlistProductCardProps {
  product: WishlistItem;
  onRemoveFromWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  isLoading?: boolean;
}

const WishlistProductCard: React.FC<WishlistProductCardProps> = ({
  product,
  onRemoveFromWishlist,
  onAddToCart,
  isLoading = false,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const calculateSavings = () => {
    const effectivePrice = product.dealPrice || product.discountedPrice;
    if (effectivePrice < product.price) {
      return product.price - effectivePrice;
    }
    return 0;
  };

  const handleRemoveFromWishlist = useDebouncedCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (isRemoving || !onRemoveFromWishlist) return;
      
      setIsRemoving(true);
      try {
        await onRemoveFromWishlist(product.id);
      } finally {
        setIsRemoving(false);
      }
    },
    300 // 300ms debounce delay
  );

  const handleAddToCart = useDebouncedCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (isAddingToCart || !onAddToCart) return;
      
      setIsAddingToCart(true);
      try {
        await onAddToCart(product.id);
      } finally {
        setIsAddingToCart(false);
      }
    },
    300 // 300ms debounce delay
  );

  const productSlug = product.slug || generateUniqueSlug(product.name, product.id);
  const savings = calculateSavings();
  const effectivePrice = product.dealPrice || product.discountedPrice;

  return (
    <div className="group relative bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-border overflow-hidden">
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
        onClick={handleRemoveFromWishlist}
        disabled={isRemoving || isLoading}
      >
        {isRemoving ? (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart className="h-4 w-4 text-red-500 fill-current" />
        )}
      </Button>

      <Link href={`/products/${productSlug}`} className="block">
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
            <span className={cn(
              "text-xs font-medium",
              product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            {product.dealPrice ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-card-foreground">
                    {formatPrice(product.dealPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
                {savings > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Save {formatPrice(savings)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-lg font-bold text-card-foreground">
                {formatPrice(effectivePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAddingToCart || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
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
  );
};

export default WishlistProductCard;

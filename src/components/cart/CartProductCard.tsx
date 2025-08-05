"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/types/frontend";
import { cn } from "@/lib/utils";
import { generateUniqueSlug } from "@/utils/slug";

interface CartProductCardProps {
  item: CartItem;
  onRemoveFromCart?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  isLoading?: boolean;
}

const CartProductCard: React.FC<CartProductCardProps> = ({
  item,
  onRemoveFromCart,
  onUpdateQuantity,
  isLoading = false,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const calculateSavings = () => {
    const effectivePrice = item.product.dealPrice || item.product.discountedPrice;
    if (effectivePrice < item.product.price) {
      return (item.product.price - effectivePrice) * quantity;
    }
    return 0;
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (onUpdateQuantity) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onRemoveFromCart) {
      onRemoveFromCart(item.id);
    }
  };

  const productSlug = item.product.slug || generateUniqueSlug(item.product.name, item.product.id);
  const savings = calculateSavings();
  const effectivePrice = item.product.dealPrice || item.product.discountedPrice;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Deal Badge */}
      {item.product.activeDeal && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="destructive" className="text-xs font-bold">
            {item.product.activeDeal.name}
          </Badge>
        </div>
      )}

      <Link href={`/products/${productSlug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Image
            src={item.product.mainImage || "/default-product.jpg"}
            alt={item.product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Out of Stock Overlay */}
          {item.product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item.product.name}
          </h3>

          {/* Stock Status */}
          <div className="flex items-center gap-1 mb-2">
            <Package className="h-3 w-3" />
            <span className={cn(
              "text-xs font-medium",
              item.product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {item.product.stock > 0 ? `${item.product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            {item.product.dealPrice ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(item.product.dealPrice * quantity)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(item.product.price * quantity)}
                  </span>
                </div>
                {savings > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Save {formatPrice(savings)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(effectivePrice * quantity)}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Quantity:
            </span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="text-center border rounded p-1 w-16"
            />
          </div>
        </div>
      </Link>

      {/* Remove Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleRemoveFromCart}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove from Cart
        </Button>
      </div>
    </div>
  );
};

export default CartProductCard;

"use client";

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCardProps } from "@/types/frontend";
import { cn } from "@/lib/utils";
import { generateUniqueSlug } from "@/utils/slug";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { addToWishlist } from "@/lib/api/wishlist";
import { addToCart } from "@/lib/api/cart";

interface ExtendedProductCardProps extends ProductCardProps {
  viewMode?: "grid" | "list";
}

const ProductCard: React.FC<ExtendedProductCardProps> = ({
  product,
  onAddToCart,
  viewMode = "grid",
}) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    if (onAddToCart) {
      onAddToCart(product.id);
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const response = await addToCart({ productId: product.id, quantity: 1 });
      if (response.success) {
        toast({
          title: "Success",
          description: "Item added to cart",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingToWishlist(true);
    try {
      const response = await addToWishlist({ productId: product.id });
      if (response.success) {
        toast({
          title: "Success",
          description: "Item added to wishlist",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const productSlug =
    product.slug || generateUniqueSlug(product.name, product.id);

  return (
    <Link href={`/products/${productSlug}`} passHref>
      <div
        className={cn(
          "card group font-sans transition-all duration-300 relative w-full",
          viewMode === "grid" ? "max-w-sm mx-auto" : "flex items-center w-full",
          "bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
        )}
        style={{ perspective: "1000px" }}
      >
        {product.activeDeal && (
          <div className="badge absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md z-10">
            {product.activeDeal.name}
          </div>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 shadow-sm"
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
        >
          {isAddingToWishlist ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className="h-4 w-4 text-red-500 hover:fill-current transition-colors" />
          )}
        </Button>

        <div
          className={cn(
            "tilt relative",
            viewMode === "grid" ? "h-64" : "w-1/3 h-48 flex-shrink-0"
          )}
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.5s",
          }}
        >
          <div className="img w-full h-full overflow-hidden">
            <Image
              src={product.mainImage || "/default-images.jpg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        <div
          className={cn("info flex-grow p-5", viewMode === "list" && "w-2/3")}
        >
          <div className="cat text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">
            {product.category?.name || "Uncategorized"}
          </div>
          <h2 className="title text-lg font-bold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h2>
          <p className="desc text-xs text-gray-600 dark:text-gray-300 mb-3 truncate h-10 overflow-hidden">
            {product.description}
          </p>

          <div className="feats flex flex-wrap gap-2 mb-4">
            {product.sizes &&
              product.sizes
                .split(",")
                .slice(0, 3)
                .map((size) => (
                  <span
                    key={size}
                    className="feat text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-medium"
                  >
                    {size.trim()}
                  </span>
                ))}
          </div>

          <div className="bottom flex justify-between items-center mb-4">
            <div className="price flex flex-col">
              {product.dealPrice ? (
                <>
                  <span className="old text-xs text-gray-400 dark:text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="new text-lg font-semibold text-gray-800 dark:text-white">
                    {formatPrice(product.dealPrice)}
                  </span>
                </>
              ) : (
                <span className="new text-lg font-semibold text-gray-800 dark:text-white">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button
              className="btn bg-gradient-to-r from-gray-800 to-black hover:from-blue-600 hover:to-blue-700 text-white font-md text-xs py-2 px-3 rounded-lg shadow-lg transform transition-transform hover:scale-105 relative overflow-hidden"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <span className="z-10">
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </span>
              <ShoppingCart className="icon ml-1 w-3 h-3 z-10" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Button>
          </div>

          <div className="meta flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="rating flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {product.avgRating.toFixed(1)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ({product.reviewCount} reviews)
              </span>
            </div>
            <div
              className={`stock text-xs font-bold flex items-center gap-1 ${
                product.stock > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              <Package className="w-3 h-3" />
              <span>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

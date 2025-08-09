"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import Link from "next/link";

// Mock data - replace with real data from your API
const mockWishlistItems = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    image: "/api/placeholder/300/300",
    inStock: true,
    category: "T-Shirts",
  },
  {
    id: "2",
    name: "Denim Jacket",
    price: 89.99,
    originalPrice: 120.00,
    image: "/api/placeholder/300/300",
    inStock: true,
    category: "Jackets",
  },
  {
    id: "3",
    name: "Running Sneakers",
    price: 129.99,
    originalPrice: 149.99,
    image: "/api/placeholder/300/300",
    inStock: false,
    category: "Shoes",
  },
  {
    id: "4",
    name: "Wool Sweater",
    price: 79.99,
    originalPrice: 99.99,
    image: "/api/placeholder/300/300",
    inStock: true,
    category: "Sweaters",
  },
  {
    id: "5",
    name: "Leather Belt",
    price: 45.00,
    originalPrice: 60.00,
    image: "/api/placeholder/300/300",
    inStock: true,
    category: "Accessories",
  },
  {
    id: "6",
    name: "Summer Dress",
    price: 69.99,
    originalPrice: 89.99,
    image: "/api/placeholder/300/300",
    inStock: true,
    category: "Dresses",
  },
];

export function WishlistComponent() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const { toast } = useToast();

  const removeFromWishlist = useDebouncedCallback(
    (id: string) => {
      setWishlistItems(items => items.filter(item => item.id !== id));
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });
    },
    300 // 300ms debounce delay
  );

  const addToCart = useDebouncedCallback(
    (item: typeof mockWishlistItems[0]) => {
      if (!item.inStock) return;
      
      toast({
        title: "Added to Cart",
        description: `${item.name} has been added to your cart.`,
      });
    },
    300 // 300ms debounce delay
  );

  const moveAllToCart = useDebouncedCallback(
    () => {
      const inStockItems = wishlistItems.filter(item => item.inStock);
      if (inStockItems.length === 0) return;

      toast({
        title: "Items Added to Cart",
        description: `${inStockItems.length} items have been added to your cart.`,
      });
    },
    300 // 300ms debounce delay
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">My Wishlist</CardTitle>
              <CardDescription>
                Items you&apos;ve saved for later ({wishlistItems.length} items)
              </CardDescription>
            </div>
            {wishlistItems.length > 0 && (
              <Button onClick={moveAllToCart} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Move All to Cart
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start browsing our products and add items you love to your wishlist.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group transition-all duration-200 hover:shadow-lg">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <div className="text-4xl text-muted-foreground">📷</div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {!item.inStock && (
                  <Badge variant="destructive" className="absolute top-2 left-2">
                    Out of Stock
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">
                      {item.category}
                    </Badge>
                    <h3 className="font-medium text-sm leading-none">{item.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">
                      ${item.price}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!item.inStock}
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {item.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Heart className="h-4 w-4 mr-2 fill-current" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

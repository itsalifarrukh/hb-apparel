"use client";

import { ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "../ui/badge";
import { fetchCart } from "@/lib/api/cart";
import Link from "next/link";

function Cart() {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(0);
  const [, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      loadCartCount();
    } else {
      setItemCount(0);
    }
  }, [session]);

  const loadCartCount = async () => {
    setLoading(true);
    try {
      const response = await fetchCart();
      if (response.success) {
        setItemCount(response.data.totalItems);
      }
    } catch (error) {
      console.error("Failed to load cart count:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href="/cart" className="block">
      <div className="relative flex items-center justify-center w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
        {session && itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
        <ShoppingBag className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </div>
    </Link>
  );
}

export default Cart;

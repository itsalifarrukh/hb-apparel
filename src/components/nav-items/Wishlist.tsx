"use client";

import { Heart } from "lucide-react";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "../ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadWishlist, clearWishlist } from "@/store/wishlistSlice";
import Link from "next/link";

function Wishlist() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const itemCount = wishlist?.totalItems || 0;

  useEffect(() => {
    if (session) {
      dispatch(loadWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [session, dispatch]);

  return (
    <Link href="/wishlist" className="block">
      <div className="relative flex items-center justify-center w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
        {session && itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
        <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </div>
    </Link>
  );
}

export default Wishlist;

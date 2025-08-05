import { ApiResponse, Wishlist, AddToWishlistRequest, Cart } from "@/types/frontend";

const BASE_URL = "/api/wishlist";

export async function fetchWishlist(): Promise<ApiResponse<Wishlist>> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wishlist");
  }

  return response.json();
}

export async function addToWishlist(request: AddToWishlistRequest): Promise<ApiResponse<Wishlist>> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to add item to wishlist");
  }

  return response.json();
}

export async function removeItemFromWishlist(productId: string): Promise<ApiResponse<Wishlist>> {
  const response = await fetch(`${BASE_URL}/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to remove item from wishlist");
  }

  return response.json();
}

export async function addToCartFromWishlist(productId: string): Promise<ApiResponse<Cart>> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity: 1 }),
  });

  if (!response.ok) {
    throw new Error("Failed to add item to cart");
  }

  return response.json();
}

export async function moveAllToCart(): Promise<ApiResponse<{ cart: Cart; wishlist: Wishlist; results: { moved: string[]; skipped: { productId: string; reason: string }[] } }>> {
  const response = await fetch(`${BASE_URL}/move-to-cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to move items to cart");
  }

  return response.json();
}

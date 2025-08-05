import { ApiResponse, Cart, AddToCartRequest } from "@/types/frontend";

const BASE_URL = "/api/cart";

export async function fetchCart(): Promise<ApiResponse<Cart>> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }

  return response.json();
}

export async function addToCart(request: AddToCartRequest): Promise<ApiResponse<Cart>> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to add item to cart");
  }

  return response.json();
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const response = await fetch(`${BASE_URL}/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart item quantity");
  }

  return response.json();
}

export async function removeItemFromCart(itemId: string): Promise<ApiResponse<Cart>> {
  const response = await fetch(`${BASE_URL}/${itemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to remove item from cart");
  }

  return response.json();
}

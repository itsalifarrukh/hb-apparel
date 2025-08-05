import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { Prisma } from "@prisma/client";

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            deals: {
              include: {
                deal: true;
              };
            };
          };
        };
      };
    };
  };
}>;

interface RouteParams {
  params: Promise<{
    itemId: string;
  }>;
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id,
        },
      },
      include: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient stock available",
        },
        { status: 400 }
      );
    }

    // Update cart item quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Fetch updated cart with all items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                deals: {
                  include: {
                    deal: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Process cart data (reuse the helper function from cart route)
    const cartWithMeta = processCartData(updatedCart!);

    return NextResponse.json({
      success: true,
      data: cartWithMeta,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart item",
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { itemId } = await params;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id,
        },
      },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Fetch updated cart with remaining items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                deals: {
                  include: {
                    deal: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const cartWithMeta = processCartData(updatedCart!);

    return NextResponse.json({
      success: true,
      data: cartWithMeta,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}

// Helper function to process cart data (duplicate from cart route)
function processCartData(cart: CartWithItems) {
  const now = new Date();
  let totalPrice = 0;
  let totalDiscountedPrice = 0;
  let totalItems = 0;

  const processedItems = cart.items.map((item) => {
    const product = item.product;
    
    // Find active deal
    const activeDeal = product.deals
      .filter(
        (pd) =>
          pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
      )
      .map((pd) => pd.deal)[0] || null;

    const dealPrice = activeDeal
      ? product.price - (product.price * activeDeal.discount) / 100
      : null;

    const effectivePrice = dealPrice || product.discountedPrice;
    
    totalItems += item.quantity;
    totalPrice += product.price * item.quantity;
    totalDiscountedPrice += effectivePrice * item.quantity;

    return {
      ...item,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount: product.discount,
        discountedPrice: product.discountedPrice,
        mainImage: product.mainImage,
        stock: product.stock,
        availabilityStatus: product.availabilityStatus,
        activeDeal: activeDeal || null,
        dealPrice,
      },
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    items: processedItems,
    totalItems,
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalDiscountedPrice: Math.round(totalDiscountedPrice * 100) / 100,
  };
}

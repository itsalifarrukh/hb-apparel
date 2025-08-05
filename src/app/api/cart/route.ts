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

// GET - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Find or create cart for user
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
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

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
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
    }

    // Calculate cart totals and add deal information
    const cartWithMeta = processCartData(cart);

    return NextResponse.json({
      success: true,
      data: cartWithMeta,
      message: "Cart retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient stock available",
        },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingCartItem) {
      // Update quantity if item exists
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          {
            success: false,
            message: "Not enough stock available for the requested quantity",
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    // Fetch updated cart with items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}

// Helper function to process cart data and calculate totals
function processCartData(cart: CartWithItems) {
  const now = new Date();
  let totalPrice = 0;
  let totalDiscountedPrice = 0;
  let totalItems = 0;

  const processedItems = cart.items.map((item) => {
    const product = item.product;

    // Find active deal
    const activeDeal =
      product.deals
        .filter(
          (pd) => pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
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

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

type WishlistWithProducts = Prisma.WishlistGetPayload<{
  include: {
    products: {
      include: {
        deals: {
          include: {
            deal: true;
          };
        };
      };
    };
  };
}>;

interface RouteParams {
  params: Promise<{
    productId: string;
  }>;
}

// POST - Add item to cart and remove from wishlist
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { productId } = await params;

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

    if (product.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is out of stock",
        },
        { status: 400 }
      );
    }

    // Find user's wishlist
    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.id },
      include: {
        products: {
          where: { id: productId },
        },
      },
    });

    if (!wishlist || wishlist.products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found in wishlist",
        },
        { status: 404 }
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

    // Start transaction to add to cart and remove from wishlist
    await prisma.$transaction(async (tx) => {
      if (existingCartItem) {
        // Update quantity if item exists
        const newQuantity = existingCartItem.quantity + 1;
        
        if (product.stock < newQuantity) {
          throw new Error("Not enough stock available for the requested quantity");
        }

        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Create new cart item
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: productId,
            quantity: 1,
          },
        });
      }

      // Remove product from wishlist
      await tx.wishlist.update({
        where: { id: wishlist.id },
        data: {
          products: {
            disconnect: { id: productId },
          },
        },
      });

      return { success: true };
    });

    // Fetch updated cart and wishlist
    const [updatedCart, updatedWishlist] = await Promise.all([
      prisma.cart.findUnique({
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
      }),
      prisma.wishlist.findUnique({
        where: { id: wishlist.id },
        include: {
          products: {
            include: {
              deals: {
                include: {
                  deal: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const cartWithMeta = processCartData(updatedCart!);
    const wishlistWithMeta = processWishlistData(updatedWishlist!);

    return NextResponse.json({
      success: true,
      data: {
        cart: cartWithMeta,
        wishlist: wishlistWithMeta,
      },
      message: "Item added to cart and removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Error adding to cart from wishlist:", error);
    
    if (error instanceof Error && error.message.includes("Not enough stock")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}

// Helper function to process cart data
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

// Helper function to process wishlist data
function processWishlistData(wishlist: WishlistWithProducts) {
  const now = new Date();

  const processedProducts = wishlist.products.map((product) => {
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

    return {
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
    };
  });

  return {
    id: wishlist.id,
    userId: wishlist.userId,
    products: processedProducts,
    totalItems: processedProducts.length,
  };
}

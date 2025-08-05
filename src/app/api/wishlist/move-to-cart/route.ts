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

// POST - Move all wishlist items to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Find user's wishlist with products
    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.id },
      include: {
        products: true,
      },
    });

    if (!wishlist || wishlist.products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist is empty",
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

    const results = {
      moved: [] as string[],
      skipped: [] as { productId: string; reason: string }[],
    };

    // Process each product in the wishlist
    for (const product of wishlist.products) {
      try {
        // Check stock availability
        if (product.stock <= 0) {
          results.skipped.push({
            productId: product.id,
            reason: "Out of stock",
          });
          continue;
        }

        // Check if item already exists in cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: product.id,
          },
        });

        if (existingCartItem) {
          // Update quantity if item exists and there's enough stock
          const newQuantity = existingCartItem.quantity + 1;
          if (product.stock >= newQuantity) {
            await prisma.cartItem.update({
              where: { id: existingCartItem.id },
              data: { quantity: newQuantity },
            });
            results.moved.push(product.id);
          } else {
            results.skipped.push({
              productId: product.id,
              reason: "Insufficient stock for additional quantity",
            });
          }
        } else {
          // Create new cart item
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: product.id,
              quantity: 1,
            },
          });
          results.moved.push(product.id);
        }
      } catch (itemError) {
        console.error(`Error processing product ${product.id}:`, itemError);
        results.skipped.push({
          productId: product.id,
          reason: "Processing error",
        });
      }
    }

    // Remove successfully moved items from wishlist
    if (results.moved.length > 0) {
      await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: {
          products: {
            disconnect: results.moved.map((productId) => ({ id: productId })),
          },
        },
      });
    }

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

    const message = 
      results.moved.length === wishlist.products.length
        ? "All items moved to cart successfully"
        : `${results.moved.length} items moved to cart, ${results.skipped.length} items skipped`;

    return NextResponse.json({
      success: true,
      data: {
        cart: cartWithMeta,
        wishlist: wishlistWithMeta,
        results,
      },
      message,
    });
  } catch (error) {
    console.error("Error moving wishlist to cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to move items to cart",
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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { productId } = await params;

    // Find user's wishlist
    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.id },
      include: {
        products: {
          where: { id: productId },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist not found",
        },
        { status: 404 }
      );
    }

    // Check if product is in wishlist
    if (wishlist.products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found in wishlist",
        },
        { status: 404 }
      );
    }

    // Remove product from wishlist
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
    });

    // Fetch updated wishlist
    const updatedWishlist = await prisma.wishlist.findUnique({
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
    });

    const wishlistWithMeta = processWishlistData(updatedWishlist!);

    return NextResponse.json({
      success: true,
      data: wishlistWithMeta,
      message: "Product removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove product from wishlist",
      },
      { status: 500 }
    );
  }
}

// Helper function to process wishlist data (duplicate from wishlist route)
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

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

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    console.log("User ID from token:", user.id);

    // Find or create wishlist for user
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.id },
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

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: user.id },
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
    }

    const wishlistWithMeta = processWishlistData(wishlist);

    return NextResponse.json({
      success: true,
      data: wishlistWithMeta,
      message: "Wishlist retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wishlist",
      },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Check if product exists
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

    // Find or create wishlist
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: user.id },
      });
    }

    // Check if product is already in wishlist
    const existingConnection = await prisma.wishlist.findFirst({
      where: {
        id: wishlist.id,
        products: {
          some: {
            id: productId,
          },
        },
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is already in wishlist",
        },
        { status: 400 }
      );
    }

    // Add product to wishlist
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          connect: { id: productId },
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
      message: "Product added to wishlist successfully",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product to wishlist",
      },
      { status: 500 }
    );
  }
}

// Helper function to process wishlist data
function processWishlistData(wishlist: WishlistWithProducts) {
  const now = new Date();

  const processedProducts = wishlist.products.map((product) => {
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

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ slug: string }>;

// GET - Fetch a specific product by slug
export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        deals: {
          include: {
            deal: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
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

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce(
            (sum: number, review: { rating: number }) => sum + review.rating,
            0
          ) / product.reviews.length
        : 0;

    // Get active deal information
    const now = new Date();
    const activeDeal =
      product.deals
        .filter(
          (pd) => pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
        )
        .map((pd) => pd.deal)[0] || null;

    const dealPrice = activeDeal
      ? product.price - (product.price * activeDeal.discount) / 100
      : null;

    const productWithMeta = {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product._count.reviews,
      activeDeal: activeDeal || null,
      dealPrice,
    };

    return NextResponse.json({
      success: true,
      data: productWithMeta,
      message: "Product fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

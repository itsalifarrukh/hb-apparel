import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

type ProductWithFullIncludes = Prisma.ProductGetPayload<{
  include: {
    category: true;
    subcategory: true;
    deals: {
      include: {
        deal: true;
      };
    };
    reviews: {
      include: {
        user: {
          select: {
            id: true;
            username: true;
          };
        };
      };
    };
    _count: {
      select: { reviews: true };
    };
  };
}>;

type ProductUpdateInput = {
  name?: string;
  categoryId?: string;
  subcategoryId?: string;
  mainImage?: string;
  description?: string;
  price?: number;
  discount?: number;
  stock?: number;
  sizes?: string;
  colors?: string;
  availabilityStatus?: string;
  imageUrl?: string[];
  isFeatured?: boolean;
  arrivalDate?: string;
};

type Params = Promise<{ id: string }>;

// GET - Fetch a specific product by ID
export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
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

    // Get active deal information - filter for currently active deals
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

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const body: ProductUpdateInput = await request.json();
    const {
      name,
      categoryId,
      subcategoryId,
      mainImage,
      description,
      price,
      discount,
      stock,
      sizes,
      colors,
      availabilityStatus,
      imageUrl,
      isFeatured,
      arrivalDate,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Validation
    if (name !== undefined && !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Calculate discounted price if discount is provided
    const finalPrice = price !== undefined ? price : existingProduct.price;
    const finalDiscount =
      discount !== undefined ? discount : existingProduct.discount;
    const discountAmount = finalDiscount
      ? (finalPrice * finalDiscount) / 100
      : 0;
    const discountedPrice = finalPrice - discountAmount;

    const updateData: Prisma.ProductUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) {
      updateData.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true };
    }
    if (subcategoryId !== undefined) {
      updateData.subcategory = subcategoryId
        ? { connect: { id: subcategoryId } }
        : { disconnect: true };
    }
    if (mainImage !== undefined) updateData.mainImage = mainImage;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      updateData.price = price;
      updateData.discountedPrice = discountedPrice;
    }
    if (discount !== undefined) {
      updateData.discount = discount;
      updateData.discountedPrice = discountedPrice;
    }
    if (stock !== undefined) updateData.stock = stock;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (colors !== undefined) updateData.colors = colors;
    if (availabilityStatus !== undefined)
      updateData.availabilityStatus = availabilityStatus;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (arrivalDate !== undefined)
      updateData.arrivalDate = new Date(arrivalDate);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        subcategory: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reviews: true,
            deals: true,
            cartItems: true,
            orderItems: true,
            wishlistedBy: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Check if product has related data
    if (
      existingProduct._count.reviews > 0 ||
      existingProduct._count.deals > 0 ||
      existingProduct._count.cartItems > 0 ||
      existingProduct._count.orderItems > 0 ||
      existingProduct._count.wishlistedBy > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete product with existing reviews, deals, cart items, orders, or wishlist entries. Please remove these relationships first.",
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}

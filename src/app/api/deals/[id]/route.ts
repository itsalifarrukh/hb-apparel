import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

type DealWithIncludes = Prisma.DealGetPayload<{
  include: {
    products: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            price: true;
            mainImage: true;
          };
        };
      };
    };
  };
}>;

type DealUpdateInput = {
  name?: string;
  description?: string;
  discount?: number;
  startTime?: string;
  endTime?: string;
  productIds?: string[];
};

type Params = Promise<{ id: string }>;

// GET - Fetch a specific deal by ID
export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mainImage: true,
              },
            },
          },
        },
      },
    });

    if (!deal) {
      return NextResponse.json(
        {
          success: false,
          message: "Deal not found",
        },
        { status: 404 }
      );
    }

    // Add calculated fields
    const now = new Date();
    const isActive = deal.startTime <= now && deal.endTime >= now;
    const isUpcoming = deal.startTime > now;
    const isExpired = deal.endTime < now;
    const timeRemaining = isActive ? deal.endTime.getTime() - now.getTime() : 0;

    const dealWithMeta = {
      ...deal,
      status: isActive ? "active" : isUpcoming ? "upcoming" : "expired",
      isActive,
      isUpcoming,
      isExpired,
      timeRemainingMs: timeRemaining,
      productCount: deal.products.length,
    };

    return NextResponse.json({
      success: true,
      data: dealWithMeta,
      message: "Deal fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch deal",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a deal
export async function PUT(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const body: DealUpdateInput = await request.json();
    const { name, description, discount, startTime, endTime, productIds } =
      body;

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id },
    });

    if (!existingDeal) {
      return NextResponse.json(
        {
          success: false,
          message: "Deal not found",
        },
        { status: 404 }
      );
    }

    // Validation
    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount must be between 0 and 100",
        },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return NextResponse.json(
          {
            success: false,
            message: "End time must be after start time",
          },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Prisma.DealUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discount !== undefined) updateData.discount = discount;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);

    // Update deal
    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: updateData,
    });

    // Update products if provided
    if (productIds !== undefined) {
      // Remove existing product associations
      await prisma.productDeal.deleteMany({
        where: { dealId: id },
      });

      // Add new product associations
      if (productIds.length > 0) {
        const productDeals = productIds.map((productId: string) => ({
          productId,
          dealId: id,
        }));

        await prisma.productDeal.createMany({
          data: productDeals,
        });
      }
    }

    // Fetch updated deal with products
    const dealWithProducts = await prisma.deal.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mainImage: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: dealWithProducts,
      message: "Deal updated successfully",
    });
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update deal",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a deal
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    // Check if deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingDeal) {
      return NextResponse.json(
        {
          success: false,
          message: "Deal not found",
        },
        { status: 404 }
      );
    }

    // Delete associated product deals first (due to foreign key constraints)
    await prisma.productDeal.deleteMany({
      where: { dealId: id },
    });

    // Delete the deal
    await prisma.deal.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete deal",
      },
      { status: 500 }
    );
  }
}

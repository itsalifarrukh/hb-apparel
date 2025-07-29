import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all deals with filtering options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const upcoming = searchParams.get('upcoming');
    const expired = searchParams.get('expired');

    const now = new Date();
    let whereClause: any = {};

    if (active === 'true') {
      whereClause = {
        startTime: { lte: now },
        endTime: { gte: now }
      };
    } else if (upcoming === 'true') {
      whereClause = {
        startTime: { gt: now }
      };
    } else if (expired === 'true') {
      whereClause = {
        endTime: { lt: now }
      };
    }

    const deals = await prisma.deal.findMany({
      where: whereClause,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mainImage: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Add calculated fields
    const dealsWithMeta = deals.map(deal => {
      const isActive = deal.startTime <= now && deal.endTime >= now;
      const isUpcoming = deal.startTime > now;
      const isExpired = deal.endTime < now;
      const timeRemaining = isActive ? deal.endTime.getTime() - now.getTime() : 0;

      return {
        ...deal,
        status: isActive ? 'active' : isUpcoming ? 'upcoming' : 'expired',
        isActive,
        isUpcoming,
        isExpired,
        timeRemainingMs: timeRemaining,
        productCount: deal.products.length
      };
    });

    return NextResponse.json({
      success: true,
      data: dealsWithMeta,
      message: "Deals fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch deals"
      },
      { status: 500 }
    );
  }
}

// POST - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, discount, startTime, endTime, productIds } = body;

    // Validation
    if (!name || !discount || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, discount, start time, and end time are required"
        },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate dates
    if (start >= end) {
      return NextResponse.json(
        {
          success: false,
          message: "End time must be after start time"
        },
        { status: 400 }
      );
    }

    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount must be between 0 and 100"
        },
        { status: 400 }
      );
    }

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        name,
        description,
        discount,
        startTime: start,
        endTime: end
      }
    });

    // Add products to deal if provided
    if (productIds && productIds.length > 0) {
      const productDeals = productIds.map((productId: string) => ({
        productId,
        dealId: deal.id
      }));

      await prisma.productDeal.createMany({
        data: productDeals
      });
    }

    // Fetch the complete deal with products
    const completeDeal = await prisma.deal.findUnique({
      where: { id: deal.id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mainImage: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: completeDeal,
        message: "Deal created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating deal:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create deal"
      },
      { status: 500 }
    );
  }
}

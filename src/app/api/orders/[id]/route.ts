import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

type Params = Promise<{ id: string }>;

const updateOrderSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
      "RETURNED",
    ])
    .optional(),
  trackingNumber: z.string().optional(),
  customerNotes: z.string().optional(),
});

// GET - Get specific order
export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params; // This is actually orderNumber now

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: id, // Search by orderNumber instead of id
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                mainImage: true,
                price: true,
                discountedPrice: true,
                stock: true,
                availabilityStatus: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: {
          select: {
            id: true,
            type: true,
            last4: true,
            brand: true,
            billingName: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Calculate order totals for display
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalSavings = order.items.reduce(
      (sum, item) => sum + item.discount * item.quantity,
      0
    );

    const orderWithCalculations = {
      ...order,
      itemsTotal: Math.round(itemsTotal * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      items: order.items.map((item) => ({
        ...item,
        itemTotal: Math.round(item.price * item.quantity * 100) / 100,
        savings: Math.round(item.discount * item.quantity * 100) / 100,
      })),
    };

    return NextResponse.json({
      success: true,
      data: orderWithCalculations,
      message: "Order retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}

// PUT - Update order (limited fields for customer)
export async function PUT(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Check if order exists and belongs to user
    const existingOrder = await prisma.order.findFirst({
      where: {
        orderNumber: id, // Search by orderNumber instead of id
        userId: user.id,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Customers can only update limited fields
    const allowedUpdates: {
      status?:
        | "PENDING"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
        | "REFUNDED"
        | "RETURNED";
      customerNotes?: string;
    } = {};

    // Only allow cancellation if order is still pending or confirmed
    if (
      validatedData.status === "CANCELLED" &&
      ["PENDING", "CONFIRMED"].includes(existingOrder.status)
    ) {
      allowedUpdates.status = "CANCELLED";
    }

    // Allow updating customer notes
    if (validatedData.customerNotes !== undefined) {
      allowedUpdates.customerNotes = validatedData.customerNotes;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid updates provided or action not allowed",
        },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id }, // Use the actual order ID for update
      data: allowedUpdates,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                mainImage: true,
                price: true,
                discountedPrice: true,
                stock: true,
                availabilityStatus: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: {
          select: {
            id: true,
            type: true,
            last4: true,
            brand: true,
            billingName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 }
    );
  }
}

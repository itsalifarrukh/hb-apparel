import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Validation schema for payment method update
const updatePaymentMethodSchema = z.object({
  billingName: z.string().min(1, "Billing name is required").optional(),
  billingEmail: z.string().email("Valid email is required").optional(),
  isDefault: z.boolean().optional(),
});

type Params = Promise<{ id: string }>;

// GET - Get specific payment method
export async function GET(
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

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      select: {
        id: true,
        type: true,
        isDefault: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        billingName: true,
        billingEmail: true,
        createdAt: true,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: paymentMethod,
      message: "Payment method retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment method",
      },
      { status: 500 }
    );
  }
}

// PUT - Update payment method
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
    const validatedData = updatePaymentMethodSchema.parse(body);

    // Check if payment method exists and belongs to user
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingPaymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method not found",
        },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id: id },
      data: validatedData,
      select: {
        id: true,
        type: true,
        isDefault: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        billingName: true,
        billingEmail: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPaymentMethod,
      message: "Payment method updated successfully",
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

    console.error("Error updating payment method:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update payment method",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment method
export async function DELETE(
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

    // Check if payment method exists and belongs to user
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingPaymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method not found",
        },
        { status: 404 }
      );
    }

    // Optionally, detach the payment method from Stripe customer
    if (existingPaymentMethod.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(
          existingPaymentMethod.stripePaymentMethodId
        );
      } catch (stripeError) {
        console.error(
          "Error detaching payment method from Stripe:",
          stripeError
        );
        // Continue with deletion from database even if Stripe detach fails
      }
    }

    await prisma.paymentMethod.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete payment method",
      },
      { status: 500 }
    );
  }
}

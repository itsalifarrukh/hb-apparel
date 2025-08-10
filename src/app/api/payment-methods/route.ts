import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Validation schema for payment method
const paymentMethodSchema = z.object({
  stripePaymentMethodId: z.string().min(1, "Stripe payment method ID is required"),
  billingName: z.string().min(1, "Billing name is required"),
  billingEmail: z.string().email("Valid email is required").optional(),
  isDefault: z.boolean().default(false),
});

// GET - Get user's payment methods
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ],
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
        // Don't return sensitive data like stripePaymentMethodId
      },
    });

    return NextResponse.json({
      success: true,
      data: paymentMethods,
      message: "Payment methods retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment methods",
      },
      { status: 500 }
    );
  }
}

// POST - Create new payment method
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = paymentMethodSchema.parse(body);

    // Ensure a Stripe customer exists on the user
    let stripeCustomerId = null as string | null;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { stripeCustomerId: true, email: true, firstName: true, lastName: true, username: true } });
    stripeCustomerId = dbUser?.stripeCustomerId || null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: dbUser?.email || undefined,
        name: dbUser?.firstName && dbUser?.lastName ? `${dbUser.firstName} ${dbUser.lastName}` : dbUser?.username || undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId } });
    }

    // Retrieve payment method from Stripe to get card details
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(
      validatedData.stripePaymentMethodId
    );

    // Attach PM to this customer if not already attached
    if (!stripePaymentMethod.customer) {
      try {
        await stripe.paymentMethods.attach(validatedData.stripePaymentMethodId, { customer: stripeCustomerId });
      } catch (err) {
        console.error("Error attaching payment method to customer:", err);
      }
    }

    if (!stripePaymentMethod.card) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method - no card information found",
        },
        { status: 400 }
      );
    }

    // If this is set as default, unset other default payment methods
    if (validatedData.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        stripePaymentMethodId: validatedData.stripePaymentMethodId,
        type: "CREDIT_CARD", // Default to credit card for now
        last4: stripePaymentMethod.card.last4,
        brand: stripePaymentMethod.card.brand,
        expiryMonth: stripePaymentMethod.card.exp_month,
        expiryYear: stripePaymentMethod.card.exp_year,
        billingName: validatedData.billingName,
        billingEmail: validatedData.billingEmail,
        isDefault: validatedData.isDefault,
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

    return NextResponse.json({
      success: true,
      data: paymentMethod,
      message: "Payment method saved successfully",
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

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method validation failed",
          error: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Error creating payment method:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save payment method",
      },
      { status: 500 }
    );
  }
}

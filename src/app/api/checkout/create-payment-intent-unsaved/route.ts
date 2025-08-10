import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import Stripe from "stripe";
import { calculateOrderSummary } from "@/utils/orderUtils";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Stripe configuration error: STRIPE_SECRET_KEY is not set");
}
const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-07-30.basil",
});

// Validation schema for unsaved payment intent creation
const createUnsavedPaymentIntentSchema = z.object({
  orderId: z.string().optional(),
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  unsavedStripePaymentMethodId: z.string(),
});

// POST - Create payment intent for unsaved payment method
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = createUnsavedPaymentIntentSchema.parse(body);

    let amount = 0;
    let orderData = null;
    const orderId = validatedData.orderId || null;

    if (orderId) {
      // Creating payment intent for existing order
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: user.id,
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

      amount = Math.round(order.totalAmount * 100); // Convert to cents
      orderData = order;
    } else {
      // Creating payment intent from cart
      const cart = await prisma.cart.findFirst({
        where: { userId: user.id },
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
      });

      if (!cart || cart.items.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Cart is empty",
          },
          { status: 400 }
        );
      }

      // Calculate cart total
      let subtotal = 0;
      const now = new Date();
      cart.items.forEach((item) => {
        const product = item.product;

        // Find active deal
        const activeDeal =
          product.deals
            .filter(
              (pd) =>
                pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
            )
            .map((pd) => pd.deal)[0] || null;

        const dealPrice = activeDeal
          ? product.price - (product.price * activeDeal.discount) / 100
          : null;

        const effectivePrice =
          dealPrice ?? product.discountedPrice ?? product.price;
        subtotal += effectivePrice * item.quantity;
      });

      const orderSummary = calculateOrderSummary(subtotal);
      amount = Math.round(orderSummary.totalAmount * 100); // Convert to cents
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | null = user.stripeCustomerId || null;

    if (!stripeCustomerId) {
      // Create new Stripe customer and persist to user
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
      // Persist on the user for future use
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Attach payment method to customer if not already attached
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        validatedData.unsavedStripePaymentMethodId
      );

      if (!paymentMethod.customer) {
        await stripe.paymentMethods.attach(
          validatedData.unsavedStripePaymentMethodId,
          {
            customer: stripeCustomerId,
          }
        );
      }
    } catch (error) {
      console.error("Error attaching payment method to customer:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    // Create payment intent with confirmation
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: "usd",
      customer: stripeCustomerId,
      payment_method: validatedData.unsavedStripePaymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
      metadata: {
        userId: user.id,
        ...(orderId && { orderId }),
      },
    };

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stripe is not configured on the server (missing STRIPE_SECRET_KEY)",
        },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );

    // Update order with payment intent ID if order exists
    if (orderId && paymentIntent.id) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: "PROCESSING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: amount / 100, // Convert back to dollars
        customerId: stripeCustomerId,
        ...(orderData && { order: orderData }),
      },
      message: "Payment intent created and confirmed successfully",
    });
  } catch (error: unknown) {
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

    // Stripe SDK error handling
    const maybeStripeError = error as { 
      type?: string; 
      code?: string; 
      message?: string; 
      rawType?: string; 
    };
    if (
      maybeStripeError &&
      typeof maybeStripeError === "object" &&
      (maybeStripeError.type?.startsWith?.("Stripe") ||
        maybeStripeError.rawType?.startsWith?.("card_error"))
    ) {
      console.error("Stripe error while creating payment intent:", {
        type: maybeStripeError.type,
        code: maybeStripeError.code,
        message: maybeStripeError.message,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Payment processing error",
          error: maybeStripeError.message || "Unknown Stripe error",
        },
        { status: 400 }
      );
    }

    console.error("Error creating unsaved payment intent:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment intent",
        error: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

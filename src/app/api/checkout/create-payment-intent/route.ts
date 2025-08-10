import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import Stripe from "stripe";
import { calculateOrderSummary } from "@/utils/orderUtils";

// Ensure a valid Stripe API version is used. Remove future-dated versions that cause failures.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Stripe configuration error: STRIPE_SECRET_KEY is not set");
}
const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  // Use a stable, supported API version. If omitted, Stripe SDK uses its default pinned version.
  apiVersion: "2025-07-30.basil",
});

// Validation schema for payment intent creation
const createPaymentIntentSchema = z.object({
  orderId: z.string().optional(), // If creating intent for existing order
  // If creating intent for cart checkout
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  savePaymentMethod: z.boolean().default(false),
});

// POST - Create payment intent for checkout
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

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

        // Be robust against null/undefined discountedPrice
        const effectivePrice =
          dealPrice ?? product.discountedPrice ?? product.price;
        subtotal += effectivePrice * item.quantity;
      });

      const orderSummary = calculateOrderSummary(subtotal);
      amount = Math.round(orderSummary.totalAmount * 100); // Convert to cents
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId: string | null = user.stripeCustomerId || null;

    // If not present on user, try to infer from an existing saved payment method
    if (!stripeCustomerId) {
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { userId: user.id },
      });

      if (existingPaymentMethod?.stripePaymentMethodId) {
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(
            existingPaymentMethod.stripePaymentMethodId
          );
          stripeCustomerId = (paymentMethod.customer as string) || null;
        } catch (error) {
          console.error(
            "Error retrieving customer from payment method:",
            error
          );
        }
      }
    }

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

    // Create payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        ...(orderId && { orderId }),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If payment method is specified, attach it
    if (validatedData.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          id: validatedData.paymentMethodId,
          userId: user.id,
        },
      });

      if (paymentMethod?.stripePaymentMethodId) {
        paymentIntentParams.payment_method =
          paymentMethod.stripePaymentMethodId;
        // When confirming with a specific payment method, do NOT use automatic_payment_methods
        // to avoid Stripe error: "You may only specify one of these parameters: automatic_payment_methods, confirmation_method."
        // Instead, explicitly set supported payment method types.
        // Remove automatic payment methods setting if present
        // Remove automatic_payment_methods when using specific payment method
        delete (paymentIntentParams as Stripe.PaymentIntentCreateParams & { automatic_payment_methods?: { enabled: boolean } }).automatic_payment_methods;
        paymentIntentParams.payment_method_types = ["card"];
        paymentIntentParams.confirmation_method = "manual";
        paymentIntentParams.confirm = true;
        paymentIntentParams.return_url = `${process.env.NEXTAUTH_URL}/checkout/success`;
      }
    }

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
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount / 100, // Convert back to dollars
        customerId: stripeCustomerId,
        ...(orderData && { order: orderData }),
      },
      message: "Payment intent created successfully",
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

    // Stripe SDK error handling (works across versions)
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

    console.error("Error creating payment intent:", error);
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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import Stripe from "stripe";

type Params = Promise<{ id: string }>;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Stripe configuration error: STRIPE_SECRET_KEY is not set");
}
const stripe = new Stripe(STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-07-30.basil",
});

const processPaymentSchema = z.object({
  paymentMethodId: z.string().optional(),
  stripePaymentMethodId: z.string().optional(), // For new payment methods
  savePaymentMethod: z.boolean().default(false),
});

// POST - Process payment for an existing order
export async function POST(
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
    const validatedData = processPaymentSchema.parse(body);

    // Get the order
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        paymentMethod: true,
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

    // Check if order can be paid (not already paid)
    if (order.paymentStatus === "SUCCEEDED") {
      return NextResponse.json(
        {
          success: false,
          message: "Order has already been paid",
        },
        { status: 400 }
      );
    }

    // Check if order is still pending/confirmed (not cancelled)
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Order cannot be paid in current status",
        },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
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

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const amount = Math.round(order.totalAmount * 100); // Convert to cents

    // Create payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        orderId: order.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // Handle payment method
    if (validatedData.paymentMethodId) {
      // Use saved payment method
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          id: validatedData.paymentMethodId,
          userId: user.id,
        },
      });

      if (paymentMethod?.stripePaymentMethodId) {
        paymentIntentParams.payment_method = paymentMethod.stripePaymentMethodId;
        delete (paymentIntentParams as any).automatic_payment_methods;
        paymentIntentParams.payment_method_types = ["card"];
        paymentIntentParams.confirmation_method = "manual";
        paymentIntentParams.confirm = true;
        paymentIntentParams.return_url = `${process.env.NEXTAUTH_URL}/dashboard/orders/${order.id}`;

        // Update order with payment method
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentMethodId: validatedData.paymentMethodId },
        });
      }
    } else if (validatedData.stripePaymentMethodId) {
      // Use new payment method
      paymentIntentParams.payment_method = validatedData.stripePaymentMethodId;
      delete (paymentIntentParams as any).automatic_payment_methods;
      paymentIntentParams.payment_method_types = ["card"];
      paymentIntentParams.confirmation_method = "manual";
      paymentIntentParams.confirm = true;
      paymentIntentParams.return_url = `${process.env.NEXTAUTH_URL}/dashboard/orders/${order.id}`;

      // Optionally save the payment method
      if (validatedData.savePaymentMethod) {
        try {
          const stripePaymentMethod = await stripe.paymentMethods.retrieve(
            validatedData.stripePaymentMethodId
          );
          
          const savedPaymentMethod = await prisma.paymentMethod.create({
            data: {
              userId: user.id,
              stripePaymentMethodId: validatedData.stripePaymentMethodId,
              last4: stripePaymentMethod.card?.last4 || "",
              brand: stripePaymentMethod.card?.brand || "",
              expiryMonth: stripePaymentMethod.card?.exp_month,
              expiryYear: stripePaymentMethod.card?.exp_year,
              billingName: stripePaymentMethod.billing_details?.name || user.firstName + " " + user.lastName || "Unknown",
              billingEmail: stripePaymentMethod.billing_details?.email || user.email || "",
            },
          });

          await prisma.order.update({
            where: { id: order.id },
            data: { paymentMethodId: savedPaymentMethod.id },
          });
        } catch (error) {
          console.warn("Failed to save payment method:", error);
          // Continue without saving - payment should still proceed
        }
      }
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe is not configured on the server",
        },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Update order with payment intent ID and status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: paymentIntent.status === "succeeded" ? "SUCCEEDED" : "PROCESSING",
        status: paymentIntent.status === "succeeded" ? "CONFIRMED" : order.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount / 100, // Convert back to dollars
        customerId: stripeCustomerId,
        status: paymentIntent.status,
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
      console.error("Stripe error while processing payment:", {
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

    console.error("Error processing payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process payment",
        error: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

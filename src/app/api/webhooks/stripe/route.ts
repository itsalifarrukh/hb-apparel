import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

// Configure Next.js to use raw body for webhooks
export const runtime = "nodejs";
export const config = {
  api: {
    bodyParser: false, // important for Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_method.attached":
        await handlePaymentMethodAttached(
          event.data.object as Stripe.PaymentMethod
        );
        break;

      case "invoice.payment_succeeded":
        // Handle subscription payments if you have them
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const userId = paymentIntent.metadata.userId;
    const orderId = paymentIntent.metadata.orderId;

    if (!userId) {
      console.error("No userId found in payment intent metadata");
      return;
    }

    // First try to find an existing order by payment intent ID or order ID
    let existingOrder = null;
    
    if (orderId) {
      existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });
    }
    
    if (!existingOrder) {
      // Try to find by payment intent ID
      existingOrder = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });
    }

    if (existingOrder) {
      // Update existing order
      const updateData: {
        paymentStatus: PaymentStatus;
        stripePaymentIntentId: string;
        status?: OrderStatus;
      } = {
        paymentStatus: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: paymentIntent.id,
      };
      
      // Only update status to CONFIRMED if it's currently PENDING
      if (existingOrder.status === OrderStatus.PENDING) {
        updateData.status = OrderStatus.CONFIRMED;
      }
      
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: updateData,
      });

      console.log(`Order ${existingOrder.id} payment confirmed via webhook`);
      
      // Update product stock for the existing order
      await updateProductStockForOrder(existingOrder.id);
    } else {
      console.log(`No existing order found for payment intent ${paymentIntent.id}. Order may have been created elsewhere or this is a standalone payment.`);
    }
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      console.log(`Order ${orderId} payment failed`);
    }
  } catch (error) {
    console.error("Error handling payment intent failed:", error);
  }
}

async function handlePaymentMethodAttached(
  paymentMethod: Stripe.PaymentMethod
) {
  try {
    const customerId = paymentMethod.customer as string;
    if (!customerId) return;

    // Find user by stripeCustomerId
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.log(`No user found for customer ${customerId}`);
      return;
    }

    // Check if payment method already exists
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        stripePaymentMethodId: paymentMethod.id,
        userId: user.id,
      },
    });

    if (
      !existingPaymentMethod &&
      paymentMethod.type === "card" &&
      paymentMethod.card
    ) {
      // Save the payment method
      await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          type: "CREDIT_CARD",
          stripePaymentMethodId: paymentMethod.id,
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          expiryMonth: paymentMethod.card.exp_month,
          expiryYear: paymentMethod.card.exp_year,
          billingName:
            paymentMethod.billing_details?.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          billingEmail:
            paymentMethod.billing_details?.email || user.email || "",
          isDefault: false, // Will be set to true if it's their first payment method
        },
      });

      console.log(
        `Payment method ${paymentMethod.id} saved for user ${user.id}`
      );
    }
  } catch (error) {
    console.error("Error handling payment method attached:", error);
  }
}

async function updateProductStockForOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      console.log(`Updated stock for order ${orderId}`);
    }
  } catch (error) {
    console.error(`Error updating product stock for order ${orderId}:`, error);
  }
}

// Removed unused function updateProductStock - functionality moved to updateProductStockForOrder

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

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
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case "payment_method.attached":
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
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

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    const orderId = paymentIntent.metadata.orderId;

    if (!userId) {
      console.error("No userId found in payment intent metadata");
      return;
    }

    if (orderId) {
      // Update existing order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "SUCCEEDED",
          status: "CONFIRMED",
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      console.log(`Order ${orderId} payment confirmed`);
    } else {
      // Payment was for cart checkout, need to create order
      const cart = await prisma.cart.findFirst({
        where: { userId },
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

      if (cart && cart.items.length > 0) {
        // Create order from cart items
        let subtotal = 0;
        const now = new Date();

        const orderItems = cart.items.map((item) => {
          const product = item.product;
          
          // Find active deal
          const activeDeal = product.deals
            .filter(
              (pd) => pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
            )
            .map((pd) => pd.deal)[0] || null;

          const dealPrice = activeDeal
            ? product.price - (product.price * activeDeal.discount) / 100
            : null;

          const effectivePrice = dealPrice || product.discountedPrice;
          const discount = product.price - effectivePrice;
          
          subtotal += effectivePrice * item.quantity;

          return {
            productId: item.productId,
            quantity: item.quantity,
            price: effectivePrice,
            discount,
            productName: product.name,
            productImage: product.mainImage,
            productSize: null,
            productColor: null,
          };
        });

        const taxRate = 0.08;
        const taxAmount = subtotal * taxRate;
        const shippingCost = subtotal > 50 ? 0 : 5.99;
        const totalAmount = subtotal + taxAmount + shippingCost;

        // Generate order number
        const { generateOrderNumber } = await import("@/utils/orderUtils");
        const orderNumber = await generateOrderNumber();

        const order = await prisma.order.create({
          data: {
            userId,
            orderNumber,
            subtotal,
            shippingCost,
            taxAmount,
            totalAmount,
            status: "CONFIRMED",
            paymentStatus: "SUCCEEDED",
            stripePaymentIntentId: paymentIntent.id,
            items: {
              create: orderItems,
            },
          },
        });

        // Clear the cart
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        console.log(`Order ${order.id} created from cart after payment success`);
      }
    }

    // Update product stock
    await updateProductStock(paymentIntent);
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
          paymentStatus: "FAILED",
        },
      });

      console.log(`Order ${orderId} payment failed`);
    }
  } catch (error) {
    console.error("Error handling payment intent failed:", error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    // You might want to automatically save payment methods for returning customers
    console.log(`Payment method ${paymentMethod.id} attached to customer ${paymentMethod.customer}`);
  } catch (error) {
    console.error("Error handling payment method attached:", error);
  }
}

async function updateProductStock(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (orderId) {
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
      }
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
  }
}

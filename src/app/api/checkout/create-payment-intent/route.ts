import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import Stripe from "stripe";
import { calculateOrderSummary } from "@/utils/orderUtils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
        const activeDeal = product.deals
          .filter(
            (pd) => pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
          )
          .map((pd) => pd.deal)[0] || null;

        const dealPrice = activeDeal
          ? product.price - (product.price * activeDeal.discount) / 100
          : null;

        const effectivePrice = dealPrice || product.discountedPrice;
        subtotal += effectivePrice * item.quantity;
      });

      const orderSummary = calculateOrderSummary(subtotal);
      amount = Math.round(orderSummary.totalAmount * 100); // Convert to cents
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = null;
    
    // Check if user already has a Stripe customer ID (you might want to store this in the User model)
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { userId: user.id },
    });

    if (existingPaymentMethod?.stripePaymentMethodId) {
      // Retrieve customer from existing payment method
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          existingPaymentMethod.stripePaymentMethodId
        );
        stripeCustomerId = paymentMethod.customer as string;
      } catch (error) {
        console.error("Error retrieving customer from payment method:", error);
      }
    }

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: 'usd',
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
        paymentIntentParams.payment_method = paymentMethod.stripePaymentMethodId;
        paymentIntentParams.confirmation_method = 'manual';
        paymentIntentParams.confirm = true;
        paymentIntentParams.return_url = `${process.env.NEXTAUTH_URL}/checkout/success`;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Update order with payment intent ID if order exists
    if (orderId && paymentIntent.id) {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: 'PROCESSING'
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
          message: "Payment processing error",
          error: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment intent",
      },
      { status: 500 }
    );
  }
}

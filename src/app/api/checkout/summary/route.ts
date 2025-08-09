import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { calculateOrderSummary } from "@/utils/orderUtils";

// GET - Get checkout summary for current cart
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Get user's cart
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

    // Calculate totals with current prices and deals
    let subtotal = 0;
    const now = new Date();
    const processedItems = [];

    for (const item of cart.items) {
      const product = item.product;
      
      // Check stock availability
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

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
      const savings = product.price - effectivePrice;
      
      const itemTotal = effectivePrice * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        id: item.id,
        productId: item.productId,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.mainImage,
        originalPrice: product.price,
        effectivePrice: effectivePrice,
        savings: savings,
        quantity: item.quantity,
        itemTotal: Math.round(itemTotal * 100) / 100,
        stock: product.stock,
        activeDeal: activeDeal ? {
          id: activeDeal.id,
          name: activeDeal.name,
          discount: activeDeal.discount,
          endTime: activeDeal.endTime,
        } : null,
      });
    }

    // Calculate order summary
    const orderSummary = calculateOrderSummary(subtotal);

    // Get user's saved addresses
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ],
    });

    // Get user's saved payment methods
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
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          items: processedItems,
          itemCount: cart.items.length,
        },
        orderSummary: {
          subtotal: orderSummary.subtotal,
          taxAmount: orderSummary.taxAmount,
          shippingCost: orderSummary.shippingCost,
          discountAmount: orderSummary.discountAmount,
          totalAmount: orderSummary.totalAmount,
          freeShippingEligible: orderSummary.shippingCost === 0,
          freeShippingThreshold: 50,
        },
        addresses,
        paymentMethods,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
        },
      },
      message: "Checkout summary retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching checkout summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch checkout summary",
      },
      { status: 500 }
    );
  }
}

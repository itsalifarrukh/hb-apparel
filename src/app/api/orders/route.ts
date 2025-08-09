import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";
import { generateOrderNumber } from "@/utils/orderUtils";
import { OrderStatus } from "@prisma/client";


// Validation schema for creating order
const createOrderSchema = z.object({
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  customerNotes: z.string().optional(),
  // Manual address option
  shippingAddress: z.object({
    fullName: z.string().min(1),
    streetLine1: z.string().min(1),
    streetLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().default("United States"),
    phoneNumber: z.string().optional(),
    saveForFuture: z.boolean().default(false),
  }).optional(),
  billingAddress: z.object({
    fullName: z.string().min(1),
    streetLine1: z.string().min(1),
    streetLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().default("United States"),
    phoneNumber: z.string().optional(),
    saveForFuture: z.boolean().default(false),
  }).optional(),
});

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: { userId: string; status?: OrderStatus } = { userId: user.id };
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

// POST - Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

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

    // Calculate order totals
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
        // You might want to capture selected size and color from cart item
        productSize: null,
        productColor: null,
      };
    });

    // Calculate tax and shipping (you can customize these)
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Handle address creation if needed
    let shippingAddressId = validatedData.shippingAddressId;
    let billingAddressId = validatedData.billingAddressId;

    if (validatedData.shippingAddress) {
      const { saveForFuture, ...addressData } = validatedData.shippingAddress;
      
      const shippingAddress = await prisma.address.create({
        data: {
          ...addressData,
          userId: user.id,
          type: "SHIPPING",
          isDefault: saveForFuture || false,
        },
      });
      shippingAddressId = shippingAddress.id;
    }

    if (validatedData.billingAddress) {
      const { saveForFuture, ...addressData } = validatedData.billingAddress;
      
      const billingAddress = await prisma.address.create({
        data: {
          ...addressData,
          userId: user.id,
          type: "BILLING",
          isDefault: saveForFuture || false,
        },
      });
      billingAddressId = billingAddress.id;
    }

    // Create the order
    const orderNumber = await generateOrderNumber();
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
        shippingAddressId,
        billingAddressId,
        paymentMethodId: validatedData.paymentMethodId,
        customerNotes: validatedData.customerNotes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
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

    // Clear the cart after successful order creation
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order created successfully",
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

    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}

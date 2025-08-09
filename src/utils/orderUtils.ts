import prisma from "@/lib/prisma";

/**
 * Generates a unique order number
 * Format: HB-YYYYMMDD-XXXX (e.g., HB-20241209-0001)
 */
export async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Find the last order number for today
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  
  const lastOrder = await prisma.order.findFirst({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
  });

  let sequence = 1;
  
  if (lastOrder) {
    // Extract sequence number from last order
    const lastSequence = lastOrder.orderNumber.split('-')[2];
    if (lastSequence) {
      sequence = parseInt(lastSequence) + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `HB-${datePrefix}-${sequenceStr}`;
}

/**
 * Calculate order summary from cart items
 */
export interface OrderSummary {
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
}

export function calculateOrderSummary(
  subtotal: number,
  taxRate: number = 0.08,
  freeShippingThreshold: number = 50,
  shippingRate: number = 5.99,
  discountAmount: number = 0
): OrderSummary {
  const taxAmount = subtotal * taxRate;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingRate;
  const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Get order status display information
 */
export function getOrderStatusInfo(status: string) {
  const statusMap: Record<string, { label: string; color: string; description: string }> = {
    PENDING: {
      label: "Pending",
      color: "yellow",
      description: "Order is being processed"
    },
    CONFIRMED: {
      label: "Confirmed",
      color: "blue",
      description: "Order has been confirmed"
    },
    PROCESSING: {
      label: "Processing",
      color: "purple",
      description: "Order is being prepared for shipment"
    },
    SHIPPED: {
      label: "Shipped",
      color: "indigo",
      description: "Order has been shipped"
    },
    DELIVERED: {
      label: "Delivered",
      color: "green",
      description: "Order has been delivered"
    },
    CANCELLED: {
      label: "Cancelled",
      color: "red",
      description: "Order has been cancelled"
    },
    REFUNDED: {
      label: "Refunded",
      color: "gray",
      description: "Order has been refunded"
    },
    RETURNED: {
      label: "Returned",
      color: "orange",
      description: "Order has been returned"
    },
  };

  return statusMap[status] || {
    label: status,
    color: "gray",
    description: "Unknown status"
  };
}

/**
 * Get payment status display information
 */
export function getPaymentStatusInfo(status: string) {
  const statusMap: Record<string, { label: string; color: string; description: string }> = {
    PENDING: {
      label: "Pending",
      color: "yellow",
      description: "Payment is pending"
    },
    PROCESSING: {
      label: "Processing",
      color: "blue",
      description: "Payment is being processed"
    },
    SUCCEEDED: {
      label: "Paid",
      color: "green",
      description: "Payment successful"
    },
    FAILED: {
      label: "Failed",
      color: "red",
      description: "Payment failed"
    },
    REFUNDED: {
      label: "Refunded",
      color: "gray",
      description: "Payment refunded"
    },
    PARTIALLY_REFUNDED: {
      label: "Partially Refunded",
      color: "orange",
      description: "Payment partially refunded"
    },
  };

  return statusMap[status] || {
    label: status,
    color: "gray",
    description: "Unknown status"
  };
}

/**
 * Validate stock availability for cart items
 */
export async function validateStockAvailability(cartItems: { productId: string; quantity: number; }[]): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  for (const item of cartItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product) {
      errors.push(`Product not found: ${item.productId}`);
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

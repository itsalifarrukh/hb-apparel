import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

// Validation schema for address
const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]).default("BOTH"),
  fullName: z.string().min(1, "Full name is required"),
  company: z.string().optional(),
  streetLine1: z.string().min(1, "Street address is required"),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("United States"),
  phoneNumber: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// GET - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({
      success: true,
      data: addresses,
      message: "Addresses retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
      },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // If this is set as default, unset other default addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: address,
      message: "Address created successfully",
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

    console.error("Error creating address:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create address",
      },
      { status: 500 }
    );
  }
}

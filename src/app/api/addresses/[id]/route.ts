import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

// Validation schema for address update
const updateAddressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]).optional(),
  fullName: z.string().min(1, "Full name is required").optional(),
  company: z.string().optional(),
  streetLine1: z.string().min(1, "Street address is required").optional(),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  zipCode: z.string().min(1, "ZIP code is required").optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type Params = Promise<{ id: string }>;

// GET - Get specific address
export async function GET(
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

    const address = await prisma.address.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address,
      message: "Address retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch address",
      },
      { status: 500 }
    );
  }
}

// PUT - Update address
export async function PUT(
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
    const validatedData = updateAddressSchema.parse(body);

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
        },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedAddress,
      message: "Address updated successfully",
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

    console.error("Error updating address:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update address",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(
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

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
        },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete address",
      },
      { status: 500 }
    );
  }
}

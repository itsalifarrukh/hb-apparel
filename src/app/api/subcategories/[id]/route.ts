import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch a specific subcategory by ID

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subcategory,
      message: "Subcategory fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subcategory",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a subcategory
export async function PUT(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;
    const body = await request.json();
    const { name, description, categoryId } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory name is required",
        },
        { status: 400 }
      );
    }

    // Check if subcategory exists
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory not found",
        },
        { status: 404 }
      );
    }

    // If categoryId is provided, check if category exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found",
          },
          { status: 404 }
        );
      }
    }

    // Check if name is being changed and if new name already exists
    if (name !== existingSubcategory.name) {
      const subcategoryWithSameName = await prisma.subcategory.findUnique({
        where: { name },
      });

      if (subcategoryWithSameName) {
        return NextResponse.json(
          {
            success: false,
            message: "Subcategory with this name already exists",
          },
          { status: 409 }
        );
      }
    }

    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name,
        description,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSubcategory,
      message: "Subcategory updated successfully",
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update subcategory",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subcategory
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    // Check if subcategory exists
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingSubcategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory not found",
        },
        { status: 404 }
      );
    }

    // Check if subcategory has products
    if (existingSubcategory._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete subcategory that has products. Please move them to another subcategory first.",
        },
        { status: 400 }
      );
    }

    await prisma.subcategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete subcategory",
      },
      { status: 500 }
    );
  }
}

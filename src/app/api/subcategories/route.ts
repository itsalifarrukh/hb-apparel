import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all subcategories or filter by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const whereClause = categoryId ? { categoryId } : {};

    const subcategories = await prisma.subcategory.findMany({
      where: whereClause,
      include: {
        category: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: subcategories,
      message: "Subcategories fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subcategories"
      },
      { status: 500 }
    );
  }
}

// POST - Create a new subcategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, categoryId } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory name and category ID are required"
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found"
        },
        { status: 404 }
      );
    }

    // Check if subcategory already exists
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { name }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory with this name already exists"
        },
        { status: 409 }
      );
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        description,
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: subcategory,
        message: "Subcategory created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subcategory"
      },
      { status: 500 }
    );
  }
}

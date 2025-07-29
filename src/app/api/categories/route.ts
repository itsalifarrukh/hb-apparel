import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all categories with their subcategories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: categories,
      message: "Categories fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories"
      },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required"
        },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category with this name already exists"
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category"
      },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { generateSlug } from "@/utils/slug";

type ProductWithIncludes = Prisma.ProductGetPayload<{
  include: {
    category: true;
    subcategory: true;
    deals: {
      include: {
        deal: true;
      };
    };
    reviews: {
      select: {
        rating: true;
      };
    };
    _count: {
      select: { reviews: true };
    };
  };
}>;

type ProductCreateInput = {
  name: string;
  slug?: string;
  categoryId?: string;
  subcategoryId?: string;
  mainImage: string;
  description: string;
  price: number;
  discount?: number;
  stock?: number;
  sizes?: string;
  colors?: string;
  availabilityStatus?: string;
  imageUrl?: string[];
  isFeatured?: boolean;
  arrivalDate?: string;
};

// GET - Fetch products with advanced filtering, sorting, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const featured = searchParams.get("featured");
    const newArrivals = searchParams.get("newArrivals");
    const onSale = searchParams.get("onSale");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const whereClause: Prisma.ProductWhereInput = {};

    if (categoryId) whereClause.categoryId = categoryId;
    if (subcategoryId) whereClause.subcategoryId = subcategoryId;
    if (inStock === "true") whereClause.stock = { gt: 0 };
    if (featured === "true") whereClause.isFeatured = true;

    // Search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    // New arrivals filter (products added in last 30 days)
    if (newArrivals === "true") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause.createdAt = { gte: thirtyDaysAgo };
    }

    // On sale filter (products with active deals)
    if (onSale === "true") {
      const now = new Date();
      whereClause.deals = {
        some: {
          deal: {
            startTime: { lte: now },
            endTime: { gte: now },
          },
        },
      };
    }

    // Build order by clause
    const orderByClause: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === "price") {
      orderByClause.price = sortOrder as Prisma.SortOrder;
    } else if (sortBy === "name") {
      orderByClause.name = sortOrder as Prisma.SortOrder;
    } else if (sortBy === "popularity") {
      // Sort by number of reviews (as a proxy for popularity)
      orderByClause.reviews = { _count: sortOrder as Prisma.SortOrder };
    } else {
      orderByClause.createdAt = sortOrder as Prisma.SortOrder;
    }

    // Execute query
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          subcategory: true,
          deals: {
            include: {
              deal: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Calculate average ratings and add deal information
    const productsWithMeta = products.map((product: ProductWithIncludes) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce(
              (sum: number, review: { rating: number }) => sum + review.rating,
              0
            ) / product.reviews.length
          : 0;

      // Filter for currently active deals
      const now = new Date();
      const activeDeal =
        product.deals
          .filter(
            (pd) =>
              pd.deal && pd.deal.startTime <= now && pd.deal.endTime >= now
          )
          .map((pd) => pd.deal)[0] || null;

      const dealPrice = activeDeal
        ? product.price - (product.price * activeDeal.discount) / 100
        : null;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count.reviews,
        activeDeal: activeDeal || null,
        dealPrice,
      };
    });

    // Pagination meta
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: productsWithMeta,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage,
        hasPrevPage,
        limit,
      },
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body: ProductCreateInput = await request.json();
    const {
      name,
      slug,
      categoryId,
      subcategoryId,
      mainImage,
      description,
      price,
      discount,
      stock,
      sizes,
      colors,
      availabilityStatus,
      imageUrl,
      isFeatured,
      arrivalDate,
    } = body;

    // Validation
    if (!name || !price || !description || !mainImage) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, price, description, and main image are required",
        },
        { status: 400 }
      );
    }

    // Calculate discounted price
    const discountAmount = discount ? (price * discount) / 100 : 0;
    const discountedPrice = price - discountAmount;

    // Generate slug if not provided
    const productSlug = slug || generateSlug(name);

    const productData: Prisma.ProductCreateInput = {
      name,
      slug: productSlug,
      mainImage,
      description,
      price,
      discount: discount || 0,
      discountedPrice,
      stock: stock || 0,
      sizes: sizes || "",
      colors: colors || "",
      availabilityStatus: availabilityStatus || "in_stock",
      imageUrl: imageUrl || [],
      isFeatured: isFeatured || false,
      arrivalDate: arrivalDate ? new Date(arrivalDate) : new Date(),
    };

    // Add category relation if provided
    if (categoryId) {
      productData.category = { connect: { id: categoryId } };
    }

    // Add subcategory relation if provided
    if (subcategoryId) {
      productData.subcategory = { connect: { id: subcategoryId } };
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
        subcategory: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}

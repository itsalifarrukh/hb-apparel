"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Product,
  ApiResponse,
  ProductFilters,
  Category,
  Subcategory,
} from "@/types/frontend";
import { ProductGridSkeleton } from "@/components/ui/skeletons/ProductCardSkeleton";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";
import SearchInput from "@/components/SearchInput";
import SortDropdown from "@/components/SortDropdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productsApi, categoriesApi, subcategoriesApi } from "@/lib/api";
import { Filter, Grid, List, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

const ProductListingPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [meta, setMeta] = useState<ApiResponse<Product[]>["meta"]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCatLoading, setIsCatLoading] = useState<boolean>(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const initialFilters: ProductFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const filters: ProductFilters = {
      page: params.get("page") ? parseInt(params.get("page")!) : 1,
      limit: params.get("limit") ? parseInt(params.get("limit")!) : 12,
      search: params.get("search") || undefined,
      sortBy: params.get("sortBy") || "popularity",
      sortOrder: (params.get("sortOrder") as "asc" | "desc") || "desc",
      categoryId: params.get("categoryId") || undefined,
      subcategoryId: params.get("subcategoryId") || undefined,
      minPrice: params.get("minPrice")
        ? parseFloat(params.get("minPrice")!)
        : undefined,
      maxPrice: params.get("maxPrice")
        ? parseFloat(params.get("maxPrice")!)
        : undefined,
      inStock: params.has("inStock")
        ? params.get("inStock") === "true"
        : undefined,
    };
    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const debouncedFilters = useDebounce(filters, 500);

  const updateURL = useCallback(
    (newFilters: ProductFilters) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router]
  );

  useEffect(() => {
    updateURL(filters);

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.getProducts(debouncedFilters);
        setProducts(response.data);
        setMeta(response.meta);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: "Failed to Fetch Products",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedFilters, toast, updateURL, filters]);

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      setIsCatLoading(true);
      try {
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          categoriesApi.getCategories(),
          subcategoriesApi.getSubcategories(),
        ]);
        setCategories(categoriesResponse.data);
        setSubcategories(subcategoriesResponse.data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: "Failed to Fetch Categories",
          description: errorMessage,
        });
      } finally {
        setIsCatLoading(false);
      }
    };
    fetchCategoriesAndSubcategories();
  }, [toast]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    },
    []
  );

  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  }, []);

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: ProductFilters = {
      page: 1,
      limit: 12,
      sortBy: "popularity",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  }, [updateURL]);

  // Helper function to get readable filter names
  const getFilterDisplayName = useCallback(
    (key: string, value: string | number | boolean) => {
      switch (key) {
        case "categoryId":
          const category = categories.find((cat) => cat.id === value);
          return `Category: ${category?.name || value}`;
        case "subcategoryId":
          const subcategory = subcategories.find((sub) => sub.id === value);
          return `Subcategory: ${subcategory?.name || value}`;
        case "minPrice":
          return `Min Price: $${value}`;
        case "maxPrice":
          return `Max Price: $${value}`;
        case "inStock":
          return value ? "In Stock" : "Out of Stock";
        case "search":
          return `Search: "${value}"`;
        default:
          return `${key}: ${value}`;
      }
    },
    [categories, subcategories]
  );

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (meta.totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = meta.totalPages;
    } else {
      if (meta.currentPage <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (
        meta.currentPage + Math.floor(maxPagesToShow / 2) >=
        meta.totalPages
      ) {
        startPage = meta.totalPages - maxPagesToShow + 1;
        endPage = meta.totalPages;
      } else {
        startPage = meta.currentPage - Math.floor(maxPagesToShow / 2);
        endPage = meta.currentPage + Math.floor(maxPagesToShow / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <Button
          onClick={() => handlePageChange(meta.currentPage - 1)}
          disabled={!meta.hasPrevPage}
          variant="outline"
        >
          Previous
        </Button>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            onClick={() => handlePageChange(number)}
            variant={meta.currentPage === number ? "default" : "outline"}
          >
            {number}
          </Button>
        ))}
        <Button
          onClick={() => handlePageChange(meta.currentPage + 1)}
          disabled={!meta.hasNextPage}
          variant="outline"
        >
          Next
        </Button>
      </div>
    );
  };

  const hasActiveFilters = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, limit, sortBy, sortOrder, ...activeFilters } = filters;
    return Object.values(activeFilters).some(
      (value) => value !== undefined && value !== ""
    );
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Our Collection
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Explore our curated selection of high-quality apparel.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Sidebar */}
          <aside
            className={cn(
              "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 transition-transform duration-300 ease-in-out lg:static lg:block lg:w-1/4 lg:bg-transparent lg:dark:bg-transparent lg:p-0 lg:z-auto lg:translate-x-0",
              isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex justify-between items-center lg:hidden mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Filters
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <X className="w-6 h-6 text-gray-900 dark:text-white" />
              </Button>
            </div>
            <FilterSidebar
              categories={categories}
              subcategories={subcategories}
              filters={filters}
              onFiltersChange={handleFilterChange}
              isLoading={isCatLoading}
            />
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto md:flex-1">
                  <SearchInput
                    value={filters.search || ""}
                    onChange={(query) => handleFilterChange({ search: query })}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    placeholder="Search by name, color, etc..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <SortDropdown
                    sortBy={filters.sortBy || "popularity"}
                    sortOrder={filters.sortOrder || "desc"}
                    onSortChange={handleSortChange}
                    isLoading={isLoading}
                  />
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                    >
                      <Grid className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                    Active Filters:
                  </h3>
                  {Object.entries(filters).map(([key, value]) => {
                    if (
                      value &&
                      !["page", "limit", "sortBy", "sortOrder"].includes(key)
                    ) {
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                        >
                          {getFilterDisplayName(key, value)}
                          <button
                            onClick={() =>
                              handleFilterChange({ [key]: undefined })
                            }
                            className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    }
                    return null;
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={filters.limit || 12} />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                  viewMode={viewMode}
                  showResultsCount={false}
                  // onAddToCart and onAddToWishlist can be implemented here
                />

                {/* Results count and pagination at bottom */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>
                      Showing {products.length} of {meta?.totalCount || 0}{" "}
                      products
                    </span>
                    {meta && (
                      <span>
                        Page {meta.currentPage} of {meta.totalPages}
                      </span>
                    )}
                  </div>
                  {renderPagination()}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;

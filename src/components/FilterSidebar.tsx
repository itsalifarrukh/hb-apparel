"use client";

import React, { useState, useEffect } from "react";
import { FilterSidebarProps, Subcategory } from "@/types/frontend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Package, Loader2, Layers } from "lucide-react";

interface ExtendedFilterSidebarProps extends FilterSidebarProps {
  subcategories?: Subcategory[];
}

const FilterSidebar: React.FC<ExtendedFilterSidebarProps> = ({
  categories,
  subcategories = [],
  filters,
  onFiltersChange,
  isLoading = false,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (
    key: string,
    value: string | number | boolean | undefined
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDebouncedChange = (
    key: string,
    value: string | number | boolean | undefined
  ) => {
    // Apply filter changes immediately for checkboxes and radio buttons
    if (
      key === "inStock" ||
      key === "featured" ||
      key === "categoryId" ||
      key === "subcategoryId"
    ) {
      // For category/subcategory selection, clear the other when one is selected
      const updatedFilters = { ...filters, [key]: value };
      if (key === "categoryId") {
        updatedFilters.subcategoryId = undefined;
      } else if (key === "subcategoryId") {
        updatedFilters.categoryId = undefined;
      }
      onFiltersChange(updatedFilters);
    } else {
      // For text inputs like price, use local state and apply later
      handleChange(key, value);
    }
  };

  const handleCheckboxChange = (key: string, currentValue: string) => {
    // Toggle checkbox behavior - if already selected, uncheck it
    const newValue =
      currentValue === filters[key as keyof typeof filters]
        ? undefined
        : currentValue;
    handleDebouncedChange(key, newValue);
  };

  const handlePriceChange = () => {
    onFiltersChange({
      ...filters,
      minPrice: localFilters.minPrice
        ? parseFloat(String(localFilters.minPrice))
        : undefined,
      maxPrice: localFilters.maxPrice
        ? parseFloat(String(localFilters.maxPrice))
        : undefined,
    });
  };

  const resetFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 12,
      sortBy: "popularity",
      sortOrder: "desc" as "desc",
    };
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="bg-white dark:bg-[#455A64] rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-[#263238] dark:text-white mb-4">
        Filters
      </h2>
      <div className="space-y-6">
        <Accordion
          type="single"
          collapsible
          defaultValue="price-range"
          className="w-full"
        >
          <AccordionItem value="price-range">
            <AccordionTrigger>Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={localFilters.minPrice || ""}
                    onChange={(e) => handleChange("minPrice", e.target.value)}
                    placeholder="Min"
                    disabled={isLoading}
                  />
                  <Input
                    type="number"
                    value={localFilters.maxPrice || ""}
                    onChange={(e) => handleChange("maxPrice", e.target.value)}
                    placeholder="Max"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handlePriceChange}
                  disabled={isLoading}
                  className="w-full"
                >
                  Apply Price Filter
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Categories</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.categoryId === category.id}
                        onCheckedChange={() =>
                          handleCheckboxChange("categoryId", category.id)
                        }
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between items-center w-full cursor-pointer"
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary">
                          {category._count.products}
                        </Badge>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="subcategories">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Subcategories</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`subcategory-${subcategory.id}`}
                        checked={filters.subcategoryId === subcategory.id}
                        onCheckedChange={() =>
                          handleCheckboxChange("subcategoryId", subcategory.id)
                        }
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`subcategory-${subcategory.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between items-center w-full cursor-pointer"
                      >
                        <span>{subcategory.name}</span>
                        <Badge variant="secondary">
                          {subcategory._count.products}
                        </Badge>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="status">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Availability</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="in-stock"
                    checked={filters.inStock === true}
                    onCheckedChange={() => {
                      const newValue =
                        filters.inStock === true ? undefined : true;
                      handleDebouncedChange("inStock", newValue);
                    }}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    In Stock
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          variant="ghost"
          onClick={resetFilters}
          disabled={isLoading}
          className="w-full text-red-500 hover:text-red-700"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;

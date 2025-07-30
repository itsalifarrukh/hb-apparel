"use client";

import React from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SortOption } from '@/types/frontend';
import { cn } from '@/lib/utils';

interface SortDropdownProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  isLoading?: boolean;
}

const sortOptions: SortOption[] = [
  {
    value: 'popularity-desc',
    label: 'Most Popular',
    sortBy: 'popularity',
    sortOrder: 'desc'
  },
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    sortBy: 'price',
    sortOrder: 'asc'
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    sortBy: 'price',
    sortOrder: 'desc'
  },
  {
    value: 'name-asc',
    label: 'Name: A to Z',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  {
    value: 'name-desc',
    label: 'Name: Z to A',
    sortBy: 'name',
    sortOrder: 'desc'
  },
  {
    value: 'createdAt-desc',
    label: 'Newest First',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  {
    value: 'createdAt-asc',
    label: 'Oldest First',
    sortBy: 'createdAt',
    sortOrder: 'asc'
  }
];

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  isLoading = false
}) => {
  const currentSort = sortOptions.find(
    option => option.sortBy === sortBy && option.sortOrder === sortOrder
  );

  const currentLabel = currentSort?.label || 'Sort by';

  const handleSortSelect = (option: SortOption) => {
    onSortChange(option.sortBy, option.sortOrder);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          className={cn(
            "min-w-[180px] justify-between",
            "border-[#B0BEC5] hover:border-[#1976D2]",
            "text-[#263238] dark:text-white",
            "bg-white dark:bg-[#455A64]",
            "hover:bg-[#F5F5F5] dark:hover:bg-[#37474F]",
            isLoading && "cursor-wait opacity-60"
          )}
        >
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-[#607D8B]" />
            <span className="truncate">{currentLabel}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-[#607D8B] transition-transform",
            "group-data-[state=open]:rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-[220px]",
          "bg-white dark:bg-[#455A64]",
          "border-[#B0BEC5] dark:border-[#37474F]",
          "shadow-lg"
        )}
      >
        {sortOptions.map((option) => {
          const isSelected = option.sortBy === sortBy && option.sortOrder === sortOrder;
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortSelect(option)}
              disabled={isLoading}
              className={cn(
                "cursor-pointer transition-colors",
                "text-[#263238] dark:text-white",
                "hover:bg-[#F5F5F5] dark:hover:bg-[#37474F]",
                "focus:bg-[#F5F5F5] dark:focus:bg-[#37474F]",
                isSelected && [
                  "bg-[#E3F2FD] dark:bg-[#1565C0]",
                  "text-[#1976D2] dark:text-white",
                  "font-medium"
                ],
                isLoading && "cursor-wait opacity-60"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[#1976D2] dark:bg-white" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;

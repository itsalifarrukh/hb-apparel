"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchInputProps } from '@/types/frontend';
import { cn } from '@/lib/utils';

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  isLoading = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValue, onChange, value]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localValue);
  }, [localValue, onSearch]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    onSearch('');
  }, [onChange, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(localValue);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  }, [localValue, onSearch, handleClear]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={cn(
        "relative flex items-center",
        isFocused && "ring-2 ring-[#1976D2] ring-opacity-50 rounded-md"
      )}>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Search className={cn(
            "h-4 w-4 transition-colors",
            isLoading ? "text-[#1976D2] animate-pulse" : "text-[#607D8B]"
          )} />
        </div>
        
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "pl-10 pr-12 h-10",
            "border-[#B0BEC5] focus:border-[#1976D2]",
            "placeholder:text-[#607D8B]",
            "bg-white dark:bg-[#455A64]",
            "text-[#263238] dark:text-white",
            isLoading && "cursor-wait"
          )}
        />
        
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              "p-1 rounded-full transition-colors",
              "hover:bg-[#ECEFF1] dark:hover:bg-[#37474F]",
              "text-[#607D8B] hover:text-[#263238] dark:hover:text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {/* Search suggestions placeholder for future enhancement */}
      {isFocused && localValue && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          {/* Future: Add search suggestions dropdown */}
        </div>
      )}
    </form>
  );
};

export default SearchInput;

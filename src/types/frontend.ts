// Base types for frontend components
export interface Category {
  id: string;
  name: string;
  description: string | null;
  _count: {
    products: number;
  };
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'description'>;
  _count: {
    products: number;
  };
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  discountedPrice: number;
  stock: number;
  sizes: string;
  colors: string;
  availabilityStatus: string;
  mainImage: string;
  imageUrl: string[];
  isFeatured: boolean;
  arrivalDate: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  subcategoryId: string | null;
  category: Pick<Category, 'id' | 'name' | 'description'> | null;
  subcategory: Pick<Subcategory, 'id' | 'name' | 'description' | 'categoryId'> | null;
  avgRating: number;
  reviewCount: number;
  activeDeal: Deal | null;
  dealPrice: number | null;
}

export interface Deal {
  id: string;
  name: string;
  description: string | null;
  discount: number;
  startTime: string;
  endTime: string;
  status?: 'active' | 'upcoming' | 'expired';
  isActive?: boolean;
  isUpcoming?: boolean;
  isExpired?: boolean;
  timeRemainingMs?: number;
  productCount?: number;
  products?: {
    product: Pick<Product, 'id' | 'name' | 'price' | 'mainImage'>;
  }[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: string;
  productId: string;
  user: {
    id: string;
    username: string | null;
    image?: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Filter and sorting types
export interface ProductFilters {
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrivals?: boolean;
  onSale?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export interface FilterSidebarProps {
  categories: Category[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  isLoading?: boolean;
}

// Extended filter sidebar props with subcategories
export interface ExtendedFilterSidebarProps extends FilterSidebarProps {
  subcategories?: Subcategory[];
}

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export interface SortDropdownProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  isLoading?: boolean;
}

export interface ExtendedProductGridProps extends ProductGridProps {
  viewMode?: 'grid' | 'list';
}

export interface ExtendedProductCardProps extends ProductCardProps {
  viewMode?: 'grid' | 'list';
}

// Cart and Wishlist types
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount: number;
    discountedPrice: number;
    mainImage: string;
    stock: number;
    availabilityStatus: string;
    activeDeal?: Deal | null;
    dealPrice?: number | null;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalDiscountedPrice: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  discountedPrice: number;
  mainImage: string;
  stock: number;
  availabilityStatus: string;
  activeDeal?: Deal | null;
  dealPrice?: number | null;
}

export interface Wishlist {
  id: string;
  userId: string;
  products: WishlistItem[];
  totalItems: number;
}

// Request/Response types for API
export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface MoveAllToCartRequest {
  // No body needed, just moves all wishlist items to cart
  [key: string]: never;
}

import axios from "axios";
import {
  ProductFilters,
  ApiResponse,
  Product,
  Category,
  Deal,
  Subcategory,
  Review,
} from "@/types/frontend";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Add request interceptor for consistent error handling
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  // Get all products with filters
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<ApiResponse<Product[]>> => {
    const params = new URLSearchParams();

    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.subcategoryId)
      params.append("subcategoryId", filters.subcategoryId);
    if (filters.search) params.append("search", filters.search);
    if (filters.minPrice !== undefined)
      params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters.inStock !== undefined)
      params.append("inStock", filters.inStock.toString());
    if (filters.featured !== undefined)
      params.append("featured", filters.featured.toString());
    if (filters.newArrivals !== undefined)
      params.append("newArrivals", filters.newArrivals.toString());
    if (filters.onSale !== undefined)
      params.append("onSale", filters.onSale.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get single product by ID or slug
  getProduct: async (idOrSlug: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${idOrSlug}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (
    limit: number = 8
  ): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/products?featured=true&limit=${limit}`);
    return response.data;
  },

  // Get new arrivals
  getNewArrivals: async (
    limit: number = 8
  ): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/products?newArrivals=true&limit=${limit}`);
    return response.data;
  },

  // Get products on sale
  getSaleProducts: async (
    limit: number = 8
  ): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/products?onSale=true&limit=${limit}`);
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (
    productId: string
  ): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/products/${productId}/related`);
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get("/categories");
    return response.data;
  },

  // Get single category by ID
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

// Subcategories API
export const subcategoriesApi = {
  // Get all subcategories
  getSubcategories: async (): Promise<ApiResponse<Subcategory[]>> => {
    const response = await api.get("/subcategories");
    return response.data;
  },

  // Get subcategories by category ID
  getSubcategoriesByCategory: async (
    categoryId: string
  ): Promise<ApiResponse<Subcategory[]>> => {
    const response = await api.get(`/subcategories?categoryId=${categoryId}`);
    return response.data;
  },

  // Get single subcategory by ID
  getSubcategory: async (id: string): Promise<ApiResponse<Subcategory>> => {
    const response = await api.get(`/subcategories/${id}`);
    return response.data;
  },
};

// Deals API
export const dealsApi = {
  // Get all active deals
  getActiveDeals: async (): Promise<ApiResponse<Deal[]>> => {
    const response = await api.get("/deals?status=active");
    return response.data;
  },

  // Get single deal by ID
  getDeal: async (id: string): Promise<ApiResponse<Deal>> => {
    const response = await api.get(`/deals/${id}`);
    return response.data;
  },

  // Get upcoming deals
  getUpcomingDeals: async (): Promise<ApiResponse<Deal[]>> => {
    const response = await api.get("/deals?status=upcoming");
    return response.data;
  },
};

// Reviews API
export const reviewsApi = {
  getReviewsByProduct: async (
    productId: string
  ): Promise<ApiResponse<Review[]>> => {
    const response = await api.get(`/reviews?productId=${productId}`);
    return response.data;
  },
};

export default api;

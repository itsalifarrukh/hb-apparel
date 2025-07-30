"use client"

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { productsApi, reviewsApi } from '@/lib/api';
import { Product, Review } from '@/types/frontend';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Star, Check, Shield, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductGrid from '@/components/ProductGrid';
import { cn } from '@/lib/utils';
import { generateUniqueSlug } from '@/utils/slug';

const ProductDetailPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    const fetchProductData = async () => {
      try {
        const productRes = await productsApi.getProduct(resolvedParams.slug);
        if (!productRes.success || !productRes.data) {
          notFound();
        }
        setProduct(productRes.data);
        const mainImageIndex = productRes.data.imageUrl.findIndex(img => img === productRes.data.mainImage);
        setSelectedImage(mainImageIndex >= 0 ? mainImageIndex : 0);
        
        // Initialize first size and color as selected
        const sizes = productRes.data.sizes?.split(',').map(s => s.trim()).filter(Boolean);
        const colors = productRes.data.colors?.split(',').map(c => c.trim()).filter(Boolean);
        if (sizes && sizes.length > 0) setSelectedSize(sizes[0]);
        if (colors && colors.length > 0) setSelectedColor(colors[0]);

        // Try to fetch reviews, but don't fail if the endpoint doesn't exist
        try {
          const reviewsRes = await reviewsApi.getReviewsByProduct(productRes.data.id);
          if (reviewsRes.success) {
            setReviews(reviewsRes.data);
          }
        } catch (reviewError) {
          console.warn('Reviews endpoint not available:', reviewError);
          setReviews([]); // Set empty reviews array
        }
        
        // Try to fetch related products, but don't fail if the endpoint doesn't exist
        try {
          const relatedRes = await productsApi.getRelatedProducts(productRes.data.id);
          if (relatedRes.success) {
            setRelatedProducts(relatedRes.data);
          }
        } catch (relatedError) {
          console.warn('Related products endpoint not available:', relatedError);
          setRelatedProducts([]); // Set empty related products array
        }
      } catch (error) {
        console.error("Failed to fetch product data", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [resolvedParams]);

  if (isLoading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, Math.min(product.stock, prev + amount)));
  };

  const productSlug = product.slug || generateUniqueSlug(product.name, product.id);
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category?.name || 'All', href: `/products?categoryId=${product.categoryId}` },
    { label: product.name, href: `/products/${productSlug}` }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-8">
          {/* Product Image Gallery */}
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square relative overflow-hidden rounded-lg shadow-lg mb-4">
              <Image
                src={product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl[selectedImage] : product.mainImage}
                alt={`${product.name} image ${selectedImage + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl.map((img, index) => (
                <button 
                  key={index} 
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "w-20 h-20 relative rounded-md overflow-hidden border-2 transition",
                    selectedImage === index ? "border-blue-500" : "border-transparent hover:border-blue-300"
                  )}
                >
                  <Image src={img} alt={`thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              )) : (
                <button 
                  className="w-20 h-20 relative rounded-md overflow-hidden border-2 border-blue-500"
                >
                  <Image src={product.mainImage} alt="main thumbnail" fill className="object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-lg">{product.avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div className="mb-4">
              {product.dealPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${product.dealPrice.toFixed(2)}</span>
                  <span className="text-xl text-gray-500 line-through">${product.price.toFixed(2)}</span>
                  <Badge variant="secondary">SAVE {Math.round(((product.price - product.dealPrice) / product.price) * 100)}%</Badge>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && (
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold">Size:</span>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.split(',').map(size => {
                    const trimmedSize = size.trim();
                    return (
                      <Button 
                        key={trimmedSize} 
                        variant={selectedSize === trimmedSize ? "default" : "outline"}
                        className="px-4 py-2"
                        onClick={() => setSelectedSize(trimmedSize)}
                      >
                        {trimmedSize}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && (
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold">Color:</span>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.split(',').map(color => {
                    const trimmedColor = color.trim();
                    return (
                      <Button 
                        key={trimmedColor} 
                        variant={selectedColor === trimmedColor ? "default" : "outline"}
                        className="px-4 py-2"
                        onClick={() => setSelectedColor(trimmedColor)}
                      >
                        {trimmedColor}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                <Button variant="ghost" onClick={() => handleQuantityChange(-1)}>-</Button>
                <span className="px-4 font-bold">{quantity}</span>
                <Button variant="ghost" onClick={() => handleQuantityChange(1)}>+</Button>
              </div>
              <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Add to Cart
              </Button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 border-t pt-6">
              <div className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /><span>100% Original Guarantee</span></div>
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" /><span>Secure Payments</span></div>
              <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-orange-500" /><span>Fast Delivery</span></div>
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-500" /><span>14-Day Return Policy</span></div>
            </div>
          </div>
        </div>

        {/* Details and Reviews Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('details')}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'reviews' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Ratings & Reviews <Badge variant="secondary" className="ml-2">{reviews.length}</Badge>
              </button>
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'details' && (
              <div className="space-y-8">
                {/* Product Description */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Product Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
                </div>

                {/* Product Details Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Pricing Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pricing & Savings</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Original Price:</span>
                        <span className={cn("font-semibold", product.dealPrice ? "line-through text-gray-500" : "text-gray-900 dark:text-white")}>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      {product.dealPrice && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">Sale Price:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              ${product.dealPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">You Save:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              ${(product.price - product.dealPrice).toFixed(2)} ({Math.round(((product.price - product.dealPrice) / product.price) * 100)}%)
                            </span>
                          </div>
                        </>
                      )}
                      {product.activeDeal && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                          <p className="text-red-800 dark:text-red-200 font-medium">{product.activeDeal.name}</p>
                          <p className="text-red-600 dark:text-red-300 text-sm">
                            {product.activeDeal.description || `${product.activeDeal.discount}% discount available`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Specifications</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                      {product.sizes && (
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 dark:text-gray-300">Available Sizes:</span>
                          <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                            {product.sizes.split(',').map(size => (
                              <Badge key={size.trim()} variant="outline" className="text-xs">
                                {size.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.colors && (
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 dark:text-gray-300">Available Colors:</span>
                          <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                            {product.colors.split(',').map(color => (
                              <Badge key={color.trim()} variant="outline" className="text-xs">
                                {color.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Availability:</span>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Status:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.availabilityStatus || 'Available'}
                        </span>
                      </div>
                      {product.category && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Category:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.category.name}
                          </span>
                        </div>
                      )}
                      {product.subcategory && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Subcategory:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.subcategory.name}
                          </span>
                        </div>
                      )}
                      {product.isFeatured && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
                          <p className="text-blue-800 dark:text-blue-200 font-medium">Featured Product</p>
                          <p className="text-blue-600 dark:text-blue-300 text-sm">
                            This product is featured in our collection
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="flex gap-4 border-b pb-4">
                      <Avatar>
                        <AvatarImage src={review.user.image} />
                        <AvatarFallback>{review.user.username?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{review.user.username}</p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300")} />
                          ))}
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Related Products</h2>
          <ProductGrid products={relatedProducts} viewMode="grid" showResultsCount={false} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;


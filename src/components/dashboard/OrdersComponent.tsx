"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders, clearError } from "@/store/ordersSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Package,
  Calendar,
  DollarSign,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
  Plus,
  ShoppingBag,
} from "lucide-react";
import type { Order } from "@/types/frontend";
import Link from "next/link";

export function OrdersComponent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    dispatch(fetchOrders({}));

    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-300";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-300";
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order: Order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some((item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a: Order, b: Order) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest":
          return b.totalAmount - a.totalAmount;
        case "lowest":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((order: Order) => order.status === "PENDING").length,
    processing: orders.filter((order: Order) =>
      ["CONFIRMED", "PROCESSING"].includes(order.status)
    ).length,
    shipped: orders.filter((order: Order) => order.status === "SHIPPED").length,
    delivered: orders.filter((order: Order) => order.status === "DELIVERED")
      .length,
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your order history
          </p>
        </div>

        <Link href="/checkout">
          <Button className="gap-2 hover:scale-105 transition-all duration-200">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{orderStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">{orderStats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{orderStats.processing}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold">{orderStats.shipped}</p>
            <p className="text-xs text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{orderStats.delivered}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by order number or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchOrders({}))}
                disabled={loading}
                className="px-3"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No orders match your filters"
                : "No orders yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "You haven't placed any orders yet. Start shopping to see your orders here."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            )}
            {(searchQuery || statusFilter !== "all") && (
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
                <Link href="/products">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order: Order) => (
            <Card
              key={order.id}
              className="hover:shadow-lg transition-all duration-200 hover:border-primary/20"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">
                        Order #{order.orderNumber}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>{order.items?.length || 0} items</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/orders/${order.orderNumber}`)
                    }
                    className="gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>

                {/* Order Items Preview */}
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground">
                        x{item.quantity}
                      </span>
                      <span className="ml-auto font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {order.items && order.items.length > 2 && (
                    <div className="text-sm text-muted-foreground pl-5">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>

                {/* Shipping Address Preview */}
                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Shipping to:</span>{" "}
                      {order.shippingAddress.fullName},{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loading indicator for pagination or refresh */}
      {loading && orders.length > 0 && (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

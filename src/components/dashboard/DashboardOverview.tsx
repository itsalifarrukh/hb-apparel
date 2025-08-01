"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Eye,
  Clock,
  Check
} from "lucide-react";
import Link from "next/link";

// Mock data - replace with real data from your API
const mockStats = {
  totalOrders: 12,
  wishlistItems: 8,
  cartItems: 3,
  totalSpent: 1250.99,
};

const mockRecentOrders = [
  {
    id: "ORD-001",
    status: "delivered",
    total: 89.99,
    items: 2,
    date: "2024-01-15",
  },
  {
    id: "ORD-002", 
    status: "processing",
    total: 156.50,
    items: 3,
    date: "2024-01-20",
  },
  {
    id: "ORD-003",
    status: "shipped",
    total: 203.75,
    items: 1,
    date: "2024-01-22",
  },
];

const mockRecentlyViewed = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    price: 29.99,
    image: "/api/placeholder/80/80",
  },
  {
    id: "2", 
    name: "Denim Jacket",
    price: 89.99,
    image: "/api/placeholder/80/80",
  },
  {
    id: "3",
    name: "Sneakers",
    price: 129.99,
    image: "/api/placeholder/80/80",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "processing":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "shipped":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "delivered":
      return <Check className="h-3 w-3" />;
    case "processing":
      return <Clock className="h-3 w-3" />;
    case "shipped":
      return <Package className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
}

export function DashboardOverview() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 from last month
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wishlist Items
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.wishlistItems}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3 this week
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cart Items
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.cartItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to checkout
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalSpent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Recently Viewed */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="animate-slide-in-left">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>
                  Your recent purchase history
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items} item{order.items !== 1 ? 's' : ''} • {order.date}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium text-sm">${order.total}</p>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(order.status)}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        <Card className="animate-slide-in-right">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recently Viewed</CardTitle>
                <CardDescription>
                  Products you&apos;ve recently looked at
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/products">Browse More</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRecentlyViewed.map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-sm font-semibold text-primary">${product.price}</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Frequently used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col gap-2" asChild>
              <Link href="/dashboard/orders">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-sm">View Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2" asChild>
              <Link href="/dashboard/wishlist">
                <Heart className="h-5 w-5" />
                <span className="text-sm">My Wishlist</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2" asChild>
              <Link href="/dashboard/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm">Shopping Cart</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2" asChild>
              <Link href="/dashboard/profile">
                <Package className="h-5 w-5" />
                <span className="text-sm">Edit Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

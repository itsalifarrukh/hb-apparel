"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Download } from "lucide-react";

// Mock data - replace with real data from your API
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "delivered",
    total: 89.99,
    items: [
      { name: "Classic T-Shirt", qty: 1, price: 29.99 },
      { name: "Denim Jeans", qty: 1, price: 60.00 },
    ],
  },
  {
    id: "ORD-002",
    date: "2024-01-20",
    status: "processing",
    total: 156.50,
    items: [
      { name: "Hoodie", qty: 1, price: 79.00 },
      { name: "Beanie", qty: 1, price: 25.00 },
      { name: "Socks", qty: 2, price: 26.25 },
    ],
  },
  {
    id: "ORD-003",
    date: "2024-01-22",
    status: "shipped",
    total: 203.75,
    items: [
      { name: "Leather Jacket", qty: 1, price: 203.75 },
    ],
  },
  {
    id: "ORD-004",
    date: "2024-01-25",
    status: "cancelled",
    total: 45.00,
    items: [
      { name: "Scarf", qty: 1, price: 45.00 },
    ],
  },
];

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "delivered":
      return "default";
    case "processing":
      return "secondary";
    case "shipped":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function OrdersComponent() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Orders</CardTitle>
          <CardDescription>
            View your order history and track current shipments
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


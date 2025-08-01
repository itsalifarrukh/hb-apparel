"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  MapPin, 
  Home, 
  Building2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with real data from your API
const mockAddresses = [
  {
    id: "1",
    title: "Home",
    name: "John Doe",
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    isDefault: true,
    type: "home" as const,
  },
  {
    id: "2",
    title: "Office",
    name: "John Doe",
    street: "456 Business Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    country: "United States",
    phone: "+1 (555) 987-6543",
    isDefault: false,
    type: "work" as const,
  },
] as const;

const initialFormData = {
  title: "",
  name: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone: "",
  type: "home" as "home" | "work" | "other",
};

export function AddressBookComponent() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const { toast } = useToast();

  const handleSave = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress 
          ? { ...addr, ...formData, id: addr.id, isDefault: addr.isDefault }
          : addr
      ));
      toast({
        title: "Address Updated",
        description: "Your address has been successfully updated.",
      });
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      setAddresses(prev => [...prev, newAddress]);
      toast({
        title: "Address Added",
        description: "Your new address has been successfully added.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData(initialFormData);
  };

  const handleEdit = (address: typeof mockAddresses[number]) => {
    setFormData({
      title: address.title,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      type: address.type as "home" | "work" | "other",
    });
    setEditingAddress(address.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast({
      title: "Address Deleted",
      description: "The address has been removed from your address book.",
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast({
      title: "Default Address Updated",
      description: "Your default address has been updated.",
    });
  };

  const openAddDialog = () => {
    setFormData(initialFormData);
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "work":
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Address Book</CardTitle>
              <CardDescription>
                Manage your shipping and billing addresses
              </CardDescription>
            </div>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>
        </CardHeader>
      </Card>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Addresses Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add your first address to make checkout faster and easier.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address.id} className="relative transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAddressTypeIcon(address.type)}
                    <CardTitle className="text-lg">{address.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {address.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(address)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!address.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{address.name}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                  <p>{address.phone}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Update your address information below."
                : "Add a new address to your address book."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Address Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Home, Office, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="ZIP Code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingAddress ? "Update Address" : "Add Address"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

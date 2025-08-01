"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Save, 
  X, 
  Camera, 
  Mail, 
  Phone, 
  Calendar,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock user data - replace with real data from your API
const mockUserData = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  phoneNumber: "+1 (555) 123-4567",
  avatarUrl: "/DefaultAvatar.png",
  role: "USER",
  isEmailVerified: true,
  createdAt: "2023-01-15T00:00:00.000Z",
  joinedDate: "January 2023",
  totalOrders: 12,
  totalSpent: 1250.99,
};

export function ProfileComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: mockUserData.firstName,
    lastName: mockUserData.lastName,
    username: mockUserData.username,
    email: mockUserData.email,
    phoneNumber: mockUserData.phoneNumber,
  });
  const { toast } = useToast();

  const handleSave = () => {
    // Here you would typically make an API call to update the user data
    console.log("Saving user data:", formData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setFormData({
      firstName: mockUserData.firstName,
      lastName: mockUserData.lastName,
      username: mockUserData.username,
      email: mockUserData.email,
      phoneNumber: mockUserData.phoneNumber,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and account settings
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar and Stats */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={mockUserData.avatarUrl} 
                    alt={`${mockUserData.firstName} ${mockUserData.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {mockUserData.firstName[0]}{mockUserData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  disabled={!isEditing}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="font-semibold">
                  {mockUserData.firstName} {mockUserData.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">@{mockUserData.username}</p>
                <Badge variant={mockUserData.isEmailVerified ? "default" : "secondary"} className="mt-2">
                  {mockUserData.isEmailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Member since</span>
                </div>
                <span className="text-sm font-medium">{mockUserData.joinedDate}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Orders</span>
                <span className="text-sm font-medium">{mockUserData.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Spent</span>
                <span className="text-sm font-medium">${mockUserData.totalSpent}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Personal Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.firstName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{formData.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <span className="text-muted-foreground">@</span>
                    <span>{formData.username}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.email}</span>
                    {mockUserData.isEmailVerified && (
                      <Badge variant="default" className="ml-auto text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.phoneNumber}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Changes will be saved to your account after clicking &quot;Save Changes&quot;.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

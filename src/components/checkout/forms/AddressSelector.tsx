'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Check, Building, Phone } from 'lucide-react';
import { Address } from '@/types/frontend';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onAddressSelect: (addressId: string | null) => void;
}

export function AddressSelector({ addresses, selectedAddressId, onAddressSelect }: AddressSelectorProps) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No saved addresses</p>
        <p className="text-sm">Add a new address to continue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground mb-4">
        Choose from your saved addresses:
      </p>
      
      <div className="grid gap-3">
        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;
          
          return (
            <Card
              key={address.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary bg-primary/5 border-primary/30",
                !isSelected && "hover:border-primary/50"
              )}
              onClick={() => onAddressSelect(address.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {address.fullName}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            Default
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs px-2 py-1",
                            address.type === 'SHIPPING' && "border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20",
                            address.type === 'BILLING' && "border-green-200 text-green-700 bg-green-50 dark:bg-green-950/20",
                            address.type === 'BOTH' && "border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/20"
                          )}
                        >
                          {address.type === 'BOTH' ? 'SHIPPING & BILLING' : address.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {address.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span>{address.company}</span>
                        </div>
                      )}
                      
                      <div className="leading-relaxed">
                        <div>{address.streetLine1}</div>
                        {address.streetLine2 && <div>{address.streetLine2}</div>}
                        <div>
                          {address.city}, {address.state} {address.zipCode}
                        </div>
                        <div>{address.country}</div>
                      </div>

                      {address.phoneNumber && (
                        <div className="flex items-center gap-2 pt-1">
                          <Phone className="h-3 w-3" />
                          <span>{address.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ml-4",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedAddressId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddressSelect(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear selection
        </Button>
      )}
    </div>
  );
}

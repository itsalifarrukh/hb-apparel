"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with real data from your API
const mockCards = [
  {
    id: "1",
    cardHolder: "John Doe",
    cardNumber: "**** **** **** 1234",
    expiryDate: "12/25",
    brand: "visa",
    isDefault: true,
  },
  {
    id: "2",
    cardHolder: "John Doe",
    cardNumber: "**** **** **** 5678",
    expiryDate: "11/23",
    brand: "mastercard",
    isDefault: false,
  },
];

const initialCardData = {
  cardHolder: "",
  cardNumber: "",
  expiryDate: "",
  brand: "visa",
};

export function SavedCardsComponent() {
  const [cards, setCards] = useState(mockCards);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [cardData, setCardData] = useState(initialCardData);
  const { toast } = useToast();

  const handleSave = () => {
    if (editingCard) {
      // Update existing card
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingCard
            ? { ...card, ...cardData, id: card.id, isDefault: card.isDefault }
            : card
        )
      );
      toast({
        title: "Card Updated",
        description: "Your payment card has been successfully updated.",
      });
    } else {
      // Add new card
      const newCard = {
        ...cardData,
        id: Date.now().toString(),
        isDefault: cards.length === 0,
      };
      setCards((prev) => [...prev, newCard]);
      toast({
        title: "Card Added",
        description: "Your new payment card has been successfully added.",
      });
    }

    setIsDialogOpen(false);
    setEditingCard(null);
    setCardData(initialCardData);
  };

  const handleEdit = (card: (typeof mockCards)[0]) => {
    setCardData({
      cardHolder: card.cardHolder,
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate,
      brand: card.brand,
    });
    setEditingCard(card.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    toast({
      title: "Card Deleted",
      description: "The payment card has been removed.",
    });
  };

  const handleSetDefault = (id: string) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }))
    );
    toast({
      title: "Default Card Updated",
      description: "Your default payment card has been updated.",
    });
  };

  const openAddDialog = () => {
    setCardData(initialCardData);
    setEditingCard(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Saved Payment Methods</CardTitle>
              <CardDescription>
                Manage your saved credit and debit cards
              </CardDescription>
            </div>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </div>
        </CardHeader>
      </Card>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Saved Cards</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add your first payment card for a faster checkout experience.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="relative transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {card.brand.toUpperCase()} {card.cardNumber}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(card)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!card.isDefault && (
                          <DropdownMenuItem
                            onClick={() => handleSetDefault(card.id)}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(card.id)}
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
                <p className="font-medium">{card.cardHolder}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Expires {card.expiryDate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Edit Card" : "Add New Card"}
            </DialogTitle>
            <DialogDescription>
              {editingCard
                ? "Update your payment card details below."
                : "Add a payment card for a faster checkout experience."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardHolder">Card Holder Name</Label>
              <Input
                id="cardHolder"
                value={cardData.cardHolder}
                onChange={(e) =>
                  setCardData({ ...cardData, cardHolder: e.target.value })
                }
                placeholder="Enter card holder name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardData.cardNumber}
                onChange={(e) =>
                  setCardData({ ...cardData, cardNumber: e.target.value })
                }
                placeholder="**** **** **** 1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                value={cardData.expiryDate}
                onChange={(e) =>
                  setCardData({ ...cardData, expiryDate: e.target.value })
                }
                placeholder="MM/YY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Card Brand</Label>
              <select
                id="brand"
                value={cardData.brand}
                onChange={(e) =>
                  setCardData({ ...cardData, brand: e.target.value })
                }
                className="w-full py-2 px-3 border border-input rounded-md bg-background"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">MasterCard</option>
                <option value="amex">AmEx</option>
                <option value="discover">Discover</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingCard ? "Update Card" : "Add Card"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

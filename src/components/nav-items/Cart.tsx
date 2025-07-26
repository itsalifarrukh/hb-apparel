import { ShoppingBag } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";

function Cart() {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full"
      >
        1
      </Badge>
      <ShoppingBag className="w-6 h-6" />
    </div>
  );
}

export default Cart;

import { ShoppingBag } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";

function Cart() {
  return (
    <div className="relative">
      {/* Badge placed correctly on the top-right corner */}
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-3 text-xs w-5 h-5 flex items-center justify-center rounded-full"
      >
        1
      </Badge>
      <ShoppingBag className="text-lg" />
    </div>
  );
}

export default Cart;

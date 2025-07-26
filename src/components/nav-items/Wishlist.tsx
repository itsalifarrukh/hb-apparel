import { Heart } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";

function Wishlist() {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full"
      >
        1
      </Badge>
      <Heart className="w-6 h-6" />
    </div>
  );
}

export default Wishlist;

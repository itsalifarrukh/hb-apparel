import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="p-4 mt-10">
        <div className="flex justify-between items-center ml-10 mb-4">
          <Breadcrumbs />
        </div>
      </div>

      {/* 404 Content */}
      <div className="text-center justify-center mt-8 p-10">
        <div className="justify-between items-center text-8xl">
          404 Not Found
        </div>
        <p className="items-center text-base mt-5">
          Your Visited Page Not Found. You may go to Home Page.
        </p>
        <div className="flex justify-center mt-8 p-10">
          <Link href="/">
            <Button
              variant="outline"
              className="py-2 px-12 border cursor-pointer"
            >
              Back to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

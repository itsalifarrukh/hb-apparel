import { NextResponse } from "next/server";
import { signOut } from "next-auth/react";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json(
      { message: "Successfully logged out" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { message: "An error occurred during logout." },
      { status: 500 }
    );
  }
}

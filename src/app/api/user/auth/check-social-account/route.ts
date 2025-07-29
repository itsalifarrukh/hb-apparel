import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists with social accounts
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        accounts: true,
      },
    });

    if (existingUser && existingUser.accounts.length > 0) {
      const socialProviders = existingUser.accounts.map(account => account.provider);
      
      return NextResponse.json(
        {
          hasAccount: true,
          isVerified: existingUser.isEmailVerified,
          socialProviders: socialProviders,
          message: `You already have an account registered with ${socialProviders.join(', ')}. Please sign in using ${socialProviders.join(' or ')} instead.`
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        hasAccount: false,
        message: "No existing account found"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error checking social account:", error);
    return NextResponse.json(
      { message: "An error occurred while checking account" },
      { status: 500 }
    );
  }
}

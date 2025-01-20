//src/app/api/user/auth/verify-code/route.ts

import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username, code } = await request.json();

    // Decode username in case it's URL-encoded
    const decodedUsername = decodeURIComponent(username);

    // Find the user by username
    const user = await prisma.user.findFirst({
      where: { username: decodedUsername },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Check if verificationCode and verificationCodeExpiry exist
    if (!user.verificationCode || !user.verificationCodeExpiry) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No verification code found",
        }),
        { status: 400 }
      );
    }

    // Check if the code is correct and not expired
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    const isCodeValid = user.verificationCode === hashedCode;
    const isCodeNotExpired = user.verificationCodeExpiry > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationCode: null, // Clear the verification code
          verificationCodeExpiry: null, // Clear the expiry
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Account verified successfully",
        }),
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return new Response(
        JSON.stringify({
          success: false,
          message: "Verification code has expired. Please request a new code.",
        }),
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return new Response(
        JSON.stringify({
          success: false,
          message: "Incorrect verification code",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error verifying user" }),
      { status: 500 }
    );
  }
}

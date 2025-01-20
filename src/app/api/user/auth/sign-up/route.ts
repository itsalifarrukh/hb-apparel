import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { generateVerificationCode } from "@/utils/generateVerifyCodes";
import { hashPassword } from "@/utils/hashedPassword";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, provider } = body;

    // If it's a social login, handle differently
    if (provider) {
      return NextResponse.json(
        { message: "Please use the social login button" },
        { status: 400 }
      );
    }

    // Validate input data
    if (!username || !email || !password) {
      return NextResponse.json(
        { user: null, message: "All fields are required." },
        { status: 400 }
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { user: null, message: "Invalid email format." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        {
          user: null,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // Check if the username is already taken by a verified user
    const existingVerifiedUserByUsername = await prisma.user.findFirst({
      where: {
        username,
        isEmailVerified: true,
      },
    });

    if (existingVerifiedUserByUsername) {
      return NextResponse.json(
        {
          user: null,
          message:
            "User with this Username is already Registered. Please use another username.",
        },
        { status: 409 }
      );
    }

    // Check if the email is already registered (verified or unverified)
    const existingUserByEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    const { unHashedCode, hashedCode, expiry } = generateVerificationCode();
    let responseMessage = "";
    let newUser = null; // Declare newUser here to ensure it's available in the response

    if (existingUserByEmail) {
      if (existingUserByEmail.isEmailVerified) {
        // If email is verified, no need to register again
        return NextResponse.json(
          {
            success: false,
            message: "User already exists with this email and is verified.",
          },
          { status: 400 }
        );
      } else {
        // If email is not verified, update the existing unverified user
        const hashedPassword = await hashPassword(password);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verificationCode = hashedCode;
        existingUserByEmail.verificationCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await prisma.user.update({
          where: { email },
          data: {
            username,
            password: hashedPassword,
            verificationCode: hashedCode,
            verificationCodeExpiry: expiry,
          },
        });

        responseMessage =
          "User updated successfully. Please verify your email.";
      }
    } else {
      // If no user exists, create a new one
      const hashedPassword = await hashPassword(password);
      newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          verificationCode: hashedCode,
          verificationCodeExpiry: expiry,
          isEmailVerified: false,
        },
      });

      responseMessage =
        "User registered successfully. Please verify your email.";
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      unHashedCode
    );

    console.log("Email Response:", emailResponse);

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: existingUserByEmail?.id || newUser?.id,
          username: existingUserByEmail?.username || newUser?.username,
          email: existingUserByEmail?.email || newUser?.email,
        },
        message: responseMessage,
      },
      { status: existingUserByEmail ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { user: null, message: "An error occurred during signup." },
      { status: 500 }
    );
  }
}

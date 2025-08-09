import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function getAuthenticatedUser(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token || !token.id) {
    return null;
  }
  
  // Get additional user data from database
  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true,
      isEmailVerified: true,
    },
  });
  
  if (!user) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

export function createUnauthorizedResponse() {
  return Response.json(
    {
      success: false,
      message: "Unauthorized. Please sign in to access this resource.",
    },
    { status: 401 }
  );
}

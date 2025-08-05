import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function getAuthenticatedUser(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token || !token.id) {
    return null;
  }
  
  return {
    id: token.id as string,
    email: token.email,
    username: token.username,
    role: token.role,
    isEmailVerified: token.isEmailVerified,
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

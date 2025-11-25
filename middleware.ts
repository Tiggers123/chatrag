import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

interface Payload extends JWTPayload {
    id: string;
}

const decryptJwtToken = async (token: string): Promise<Payload | null> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as Payload;
    } catch (error) {
        console.error("Error decripting jwt token:", error);
        return null;
    }
};

export const middleware = async (req: NextRequest) => {
    const response = NextResponse.next();
    const token = req.cookies.get("token")?.value;

    // If no token, allow request to proceed (public routes)
    // But if it's a protected route, we might want to redirect?
    // The user's code just returns response if no token.
    // But then checks payload.

    if (!token) return response;

    const payload = await decryptJwtToken(token);
    const isTokenExpired = payload?.exp && payload.exp < Date.now() / 1000;

    if (!payload || isTokenExpired) {
        response.cookies.delete("token");
        return response;
    }

    // Set user ID in header for server components to access
    response.headers.set("x-user-id", payload.id);
    return response;
};

export const config = {
    matcher: [
        "/",
        "/admin/:path*",
        "/auth/:path*",
        "/api/auth/me", // Ensure middleware runs for this route to set x-user-id
        "/api/chat/:path*", // Add chat APIs to middleware
    ],
};

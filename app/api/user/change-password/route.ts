import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { strictRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

// Schema de validación con Zod
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // ===== RATE LIMITING =====
    // Strict rate limiting: 5 attempts per minute for password changes
    const rateLimitResponse = await strictRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ===== VERIFY AUTHENTICATION =====
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 401 }
      );
    }

    // ===== PARSE AND VALIDATE INPUT =====
    const body = await request.json();

    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // ===== GET USER =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a password (might be social login)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This user does not have a password configured" },
        { status: 400 }
      );
    }

    // ===== VERIFY CURRENT PASSWORD =====
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      // Log failed attempt for security monitoring
      console.warn("Failed password change attempt:", {
        userId: payload.userId,
        timestamp: new Date().toISOString(),
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // ===== CHECK NEW PASSWORD IS DIFFERENT =====
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // ===== HASH NEW PASSWORD =====
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // ===== UPDATE PASSWORD =====
    await db
      .update(schema.usersTable)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, payload.userId));

    // ===== AUDIT LOG =====
    console.log("Password changed successfully:", {
      userId: payload.userId,
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    // TODO: Invalidate all sessions except the current one
    // TODO: Send confirmation email
    // TODO: Store in audit log table

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}

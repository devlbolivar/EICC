import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAuth } from "@/lib/admin-auth";
import { eq, and, ne } from "drizzle-orm";
import { apiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import {
  generateEmailVerificationToken,
  TOKEN_EXPIRY,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email-service";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

// Schema de validación con Zod
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .optional(),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone must be in international format (e.g., +1234567890)"
    )
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .optional()
    .nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    // ===== RATE LIMITING =====
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ===== VERIFY AUTHENTICATION =====
    const authResult = await verifyAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { payload } = authResult;

    // ===== PARSE AND VALIDATE INPUT =====
    const body = await request.json();

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // ===== GET CURRENT USER =====
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ===== SANITIZE INPUTS =====
    const sanitizedData: {
      name?: string;
      email?: string;
      phone?: string | null;
      bio?: string | null;
      emailVerified?: boolean;
      emailVerificationToken?: string | null;
      emailVerificationExpires?: Date | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // Track changes for audit log
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (updateData.name !== undefined) {
      const trimmedName = updateData.name.trim();
      if (trimmedName !== currentUser.name) {
        sanitizedData.name = trimmedName;
        changes.name = { from: currentUser.name, to: trimmedName };
      }
    }

    if (updateData.phone !== undefined) {
      const trimmedPhone = updateData.phone?.trim() || null;
      if (trimmedPhone !== currentUser.phone) {
        sanitizedData.phone = trimmedPhone;
        changes.phone = { from: currentUser.phone, to: trimmedPhone };
      }
    }

    if (updateData.bio !== undefined) {
      const trimmedBio = updateData.bio?.trim() || null;
      if (trimmedBio !== currentUser.bio) {
        sanitizedData.bio = trimmedBio;
        changes.bio = { from: currentUser.bio, to: trimmedBio };
      }
    }

    // ===== HANDLE EMAIL UPDATE =====
    let emailChanged = false;
    if (updateData.email !== undefined) {
      const sanitizedEmail = updateData.email.trim().toLowerCase();

      if (sanitizedEmail !== currentUser.email) {
        // Check if email already exists for another user
        const existingUser = await db.query.usersTable.findFirst({
          where: and(
            eq(schema.usersTable.email, sanitizedEmail),
            ne(schema.usersTable.id, payload.userId)
          ),
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Email already in use by another account" },
            { status: 409 }
          );
        }

        sanitizedData.email = sanitizedEmail;
        sanitizedData.emailVerified = false;

        // Generate new verification token
        const verificationToken = generateEmailVerificationToken();
        const verificationExpires = new Date(
          Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION
        );

        sanitizedData.emailVerificationToken = verificationToken;
        sanitizedData.emailVerificationExpires = verificationExpires;

        emailChanged = true;
        changes.email = { from: currentUser.email, to: sanitizedEmail };
      }
    }

    // Check if there are actual changes
    if (Object.keys(changes).length === 0) {
      return NextResponse.json(
        { error: "No changes detected" },
        { status: 400 }
      );
    }

    // ===== UPDATE USER =====
    const [updatedUser] = await db
      .update(schema.usersTable)
      .set(sanitizedData)
      .where(eq(schema.usersTable.id, payload.userId))
      .returning();

    // ===== SEND VERIFICATION EMAIL IF EMAIL CHANGED =====
    if (emailChanged && sanitizedData.emailVerificationToken) {
      try {
        await sendVerificationEmail(
          sanitizedData.email!,
          updatedUser.name,
          sanitizedData.emailVerificationToken
        );

        console.log("Verification email sent:", {
          userId: payload.userId,
          newEmail: sanitizedData.email,
          timestamp: new Date().toISOString(),
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail the request, email will be unverified and user can resend
      }
    }

    // ===== AUDIT LOG =====
    console.log("Profile updated:", {
      userId: payload.userId,
      changes,
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    // ===== PREPARE RESPONSE (without sensitive fields) =====
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerified: updatedUser.emailVerified,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      location: updatedUser.location,
      bio: updatedUser.bio,
      isActive: updatedUser.isActive,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: emailChanged
        ? "Profile updated successfully. Please verify your new email address."
        : "Profile updated successfully",
      emailVerificationRequired: emailChanged,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

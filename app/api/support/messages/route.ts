import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportMessagesTable, supportTicketsTable } from "@/config/schema";
import { verifyAuth } from "@/lib/admin-auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { apiRateLimit } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/validation";
import { hasAnyPermission } from "@/lib/permissions";
import type { Permission } from "@/app/types";

// Zod schema for message validation
const createMessageSchema = z.object({
  ticketId: z.string().uuid("ID de ticket inválido"),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000, "El mensaje debe tener máximo 5000 caracteres"),
  attachments: z.array(z.string()).optional().default([]),
});

// POST - Add message to ticket
export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const authResult = await verifyAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    const body = await req.json();

    // Validate with Zod
    const validation = createMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Error de validación",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { ticketId, message, attachments } = validation.data;

    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeHtml(message);

    // Check if user is admin
    const permissions = payload.permissions as Permission[];
    const isAdmin = hasAnyPermission(permissions, [
      "platform:admin",
      "users:manage",
    ]);

    // Verify ticket exists and user has access
    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(
        isAdmin
          ? eq(supportTicketsTable.id, ticketId)
          : and(
              eq(supportTicketsTable.id, ticketId),
              eq(supportTicketsTable.userId, payload.userId)
            )
      )
      .limit(1);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    // Create message
    const [newMessage] = await db
      .insert(supportMessagesTable)
      .values({
        ticketId,
        userId: payload.userId,
        message: sanitizedMessage,
        isStaffReply: isAdmin,
        attachments,
      })
      .returning();

    // Update ticket's updatedAt
    await db
      .update(supportTicketsTable)
      .set({ updatedAt: new Date() })
      .where(eq(supportTicketsTable.id, ticketId));

    return NextResponse.json(
      {
        success: true,
        message: {
          ...newMessage,
          createdAt: newMessage.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Error al crear el mensaje" },
      { status: 500 }
    );
  }
}

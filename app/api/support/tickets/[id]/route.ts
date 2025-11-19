import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportTicketsTable, supportMessagesTable, usersTable } from "@/config/schema";
import { verifyAuth } from "@/lib/admin-auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { apiRateLimit } from "@/lib/rate-limit";
import { hasAnyPermission } from "@/lib/permissions";
import type { Permission } from "@/app/types";
import { validateUUID } from "@/lib/validation";

// Zod schema for PATCH validation
const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"], {
    message: "Estado inválido",
  }),
});

// GET - Get specific ticket with messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: ticketId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(ticketId, 'ID de ticket');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const permissions = payload.permissions as Permission[];
    const isAdmin = hasAnyPermission(permissions, [
      "platform:admin",
      "users:manage",
    ]);

    // Get ticket - admins can see any ticket, users only their own
    const [ticket] = await db
      .select({
        id: supportTicketsTable.id,
        userId: supportTicketsTable.userId,
        companyId: supportTicketsTable.companyId,
        subject: supportTicketsTable.subject,
        description: supportTicketsTable.description,
        category: supportTicketsTable.category,
        priority: supportTicketsTable.priority,
        status: supportTicketsTable.status,
        attachments: supportTicketsTable.attachments,
        createdAt: supportTicketsTable.createdAt,
        updatedAt: supportTicketsTable.updatedAt,
        resolvedAt: supportTicketsTable.resolvedAt,
        assignedTo: supportTicketsTable.assignedTo,
        user_name: usersTable.name,
        user_email: usersTable.email,
      })
      .from(supportTicketsTable)
      .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
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

    // Get messages
    const messages = await db
      .select({
        id: supportMessagesTable.id,
        ticketId: supportMessagesTable.ticketId,
        userId: supportMessagesTable.userId,
        message: supportMessagesTable.message,
        isStaffReply: supportMessagesTable.isStaffReply,
        attachments: supportMessagesTable.attachments,
        createdAt: supportMessagesTable.createdAt,
        user_name: usersTable.name,
        user_avatar: usersTable.avatar,
      })
      .from(supportMessagesTable)
      .leftJoin(usersTable, eq(supportMessagesTable.userId, usersTable.id))
      .where(eq(supportMessagesTable.ticketId, ticketId))
      .orderBy(supportMessagesTable.createdAt);

    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        resolvedAt: ticket.resolvedAt?.toISOString(),
      },
      messages: messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Error al obtener el ticket" },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket (close, reopen, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: ticketId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(ticketId, 'ID de ticket');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate with Zod
    const validation = updateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Error de validación",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // Check if user is admin
    const permissions = payload.permissions as Permission[];
    const isAdmin = hasAnyPermission(permissions, [
      "platform:admin",
      "users:manage",
    ]);

    // Verify ticket exists and user has permission
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

    // Update status
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
    }

    const [updatedTicket] = await db
      .update(supportTicketsTable)
      .set(updateData)
      .where(eq(supportTicketsTable.id, ticketId))
      .returning();

    return NextResponse.json({
      success: true,
      ticket: {
        ...updatedTicket,
        createdAt: updatedTicket.createdAt.toISOString(),
        updatedAt: updatedTicket.updatedAt.toISOString(),
        resolvedAt: updatedTicket.resolvedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Error al actualizar el ticket" },
      { status: 500 }
    );
  }
}

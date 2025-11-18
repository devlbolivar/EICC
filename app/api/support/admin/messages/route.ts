import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportMessagesTable, supportTicketsTable } from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

// POST - Add staff reply to ticket
export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    const body = await req.json();
    const { ticketId, message, attachments } = body;

    if (!ticketId || !message) {
      return NextResponse.json(
        { error: "ID del ticket y mensaje son requeridos" },
        { status: 400 }
      );
    }

    if (message.length < 1) {
      return NextResponse.json(
        { error: "El mensaje no puede estar vacío" },
        { status: 400 }
      );
    }

    // Verify ticket exists
    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.id, ticketId))
      .limit(1);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    // Create staff message
    const [newMessage] = await db
      .insert(supportMessagesTable)
      .values({
        ticketId,
        userId: payload.userId,
        message,
        isStaffReply: true,
        attachments: attachments || [],
      })
      .returning();

    // Update ticket status to in_progress if it's open
    if (ticket.status === "open") {
      await db
        .update(supportTicketsTable)
        .set({
          status: "in_progress",
          updatedAt: new Date(),
          assignedTo: payload.userId,
        })
        .where(eq(supportTicketsTable.id, ticketId));
    } else {
      await db
        .update(supportTicketsTable)
        .set({ updatedAt: new Date() })
        .where(eq(supportTicketsTable.id, ticketId));
    }

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
    console.error("Error creating staff message:", error);
    return NextResponse.json(
      { error: "Error al crear el mensaje" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportMessagesTable, supportTicketsTable } from "@/config/schema";
import { verifyAuth } from "@/lib/admin-auth";
import { eq, and } from "drizzle-orm";

// POST - Add message to ticket
export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
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

    // Verify ticket exists and belongs to user
    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(
        and(
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
        message,
        isStaffReply: false,
        attachments: attachments || [],
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

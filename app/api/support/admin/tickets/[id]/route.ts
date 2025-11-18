import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportTicketsTable, supportMessagesTable, usersTable, companiesTable } from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

// GET - Get specific ticket with messages (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id: ticketId } = await params;

    // Get ticket with user and company info
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
        company_name: companiesTable.name,
      })
      .from(supportTicketsTable)
      .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
      .leftJoin(companiesTable, eq(supportTicketsTable.companyId, companiesTable.id))
      .where(eq(supportTicketsTable.id, ticketId))
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

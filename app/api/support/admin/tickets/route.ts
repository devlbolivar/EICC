import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportTicketsTable, usersTable, companiesTable } from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, desc, and, sql, count } from "drizzle-orm";

// GET - List all tickets (admin)
export async function GET(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (status) {
      whereConditions.push(eq(supportTicketsTable.status, status));
    }

    if (priority) {
      whereConditions.push(eq(supportTicketsTable.priority, priority));
    }

    // Get tickets with user and company info
    const ticketsQuery = db
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
      .orderBy(
        // Prioritize by priority and then by date
        sql`CASE
          WHEN ${supportTicketsTable.priority} = 'urgent' THEN 1
          WHEN ${supportTicketsTable.priority} = 'high' THEN 2
          WHEN ${supportTicketsTable.priority} = 'normal' THEN 3
          ELSE 4
        END`,
        desc(supportTicketsTable.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // Apply filters if any
    const tickets = whereConditions.length > 0
      ? await ticketsQuery.where(and(...whereConditions))
      : await ticketsQuery;

    // Get total count
    const countQuery = db
      .select({ count: count() })
      .from(supportTicketsTable);

    const [{ count: totalCount }] = whereConditions.length > 0
      ? await countQuery.where(and(...whereConditions))
      : await countQuery;

    // Get statistics
    const [stats] = await db
      .select({
        total: count(),
        open: sql<number>`SUM(CASE WHEN ${supportTicketsTable.status} = 'open' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN ${supportTicketsTable.status} = 'in_progress' THEN 1 ELSE 0 END)`,
        resolved: sql<number>`SUM(CASE WHEN ${supportTicketsTable.status} = 'resolved' THEN 1 ELSE 0 END)`,
        closed: sql<number>`SUM(CASE WHEN ${supportTicketsTable.status} = 'closed' THEN 1 ELSE 0 END)`,
        urgent: sql<number>`SUM(CASE WHEN ${supportTicketsTable.priority} = 'urgent' THEN 1 ELSE 0 END)`,
        high: sql<number>`SUM(CASE WHEN ${supportTicketsTable.priority} = 'high' THEN 1 ELSE 0 END)`,
      })
      .from(supportTicketsTable);

    // Transform dates to strings
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
      statistics: {
        total: Number(stats.total) || 0,
        open: Number(stats.open) || 0,
        inProgress: Number(stats.inProgress) || 0,
        resolved: Number(stats.resolved) || 0,
        closed: Number(stats.closed) || 0,
        urgent: Number(stats.urgent) || 0,
        high: Number(stats.high) || 0,
      },
      pagination: {
        page,
        limit,
        total: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin tickets:", error);
    return NextResponse.json(
      { error: "Error al obtener los tickets" },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket status or assign (admin)
export async function PATCH(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { payload: _payload } = authResult;

  try {
    const body = await req.json();
    const { ticketId, status, assignedTo, priority } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "ID del ticket es requerido" },
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

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (status) {
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Estado inválido" },
          { status: 400 }
        );
      }
      updateData.status = status;

      if (status === "resolved" || status === "closed") {
        updateData.resolvedAt = new Date();
      }
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    if (priority) {
      const validPriorities = ["low", "normal", "high", "urgent"];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: "Prioridad inválida" },
          { status: 400 }
        );
      }
      updateData.priority = priority;
    }

    // Update ticket
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

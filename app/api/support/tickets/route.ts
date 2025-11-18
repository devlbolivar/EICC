import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportTicketsTable, usersTable, companiesTable } from "@/config/schema";
import { verifyAuth } from "@/lib/admin-auth";
import { eq, desc, and, sql } from "drizzle-orm";

// GET - List tickets for authenticated user
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build where conditions
    const whereConditions = [eq(supportTicketsTable.userId, payload.userId)];

    if (status) {
      whereConditions.push(eq(supportTicketsTable.status, status));
    }

    const tickets = await db
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
      .where(and(...whereConditions))
      .orderBy(desc(supportTicketsTable.createdAt));

    // Transform dates to strings
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Error al obtener los tickets" },
      { status: 500 }
    );
  }
}

// POST - Create new ticket
export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    const body = await req.json();
    const { subject, description, category, priority, attachments } = body;

    // Validations
    if (!subject || !description || !category) {
      return NextResponse.json(
        { error: "Asunto, descripción y categoría son requeridos" },
        { status: 400 }
      );
    }

    if (subject.length < 5 || subject.length > 255) {
      return NextResponse.json(
        { error: "El asunto debe tener entre 5 y 255 caracteres" },
        { status: 400 }
      );
    }

    if (description.length < 20) {
      return NextResponse.json(
        { error: "La descripción debe tener al menos 20 caracteres" },
        { status: 400 }
      );
    }

    const validCategories = ["technical", "billing", "account", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Categoría inválida" },
        { status: 400 }
      );
    }

    const validPriorities = ["low", "normal", "high", "urgent"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Prioridad inválida" },
        { status: 400 }
      );
    }

    // Create ticket
    const [newTicket] = await db
      .insert(supportTicketsTable)
      .values({
        userId: payload.userId,
        companyId: payload.companyId || null,
        subject,
        description,
        category,
        priority: priority || "normal",
        attachments: attachments || [],
        status: "open",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        ticket: {
          ...newTicket,
          createdAt: newTicket.createdAt.toISOString(),
          updatedAt: newTicket.updatedAt.toISOString(),
          resolvedAt: newTicket.resolvedAt?.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Error al crear el ticket" },
      { status: 500 }
    );
  }
}

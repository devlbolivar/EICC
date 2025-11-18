import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { supportTicketsTable, usersTable } from "@/config/schema";
import { verifyAuth, verifyAdminAuth } from "@/lib/admin-auth";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { strictRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { requireCsrf } from "@/lib/csrf";
import { sanitizeHtml } from "@/lib/validation";
import { hasAnyPermission } from "@/lib/permissions";
import type { Permission } from "@/app/types";

// Zod schemas for validation
const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "El asunto debe tener al menos 5 caracteres")
    .max(200, "El asunto debe tener máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(5000, "La descripción debe tener máximo 5000 caracteres"),
  category: z.enum(["technical", "billing", "general", "feature_request"], {
    errorMap: () => ({ message: "Categoría inválida" }),
  }),
  priority: z
    .enum(["low", "medium", "high", "urgent"], {
      errorMap: () => ({ message: "Prioridad inválida" }),
    })
    .optional()
    .default("medium"),
  attachments: z.array(z.string()).optional().default([]),
});

// GET - List tickets for authenticated user (or all tickets for admins)
export async function GET(req: NextRequest) {
  // Rate limiting for GET requests
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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Check if user is admin
    const permissions = payload.permissions as Permission[];
    const isAdmin = hasAnyPermission(permissions, [
      "platform:admin",
      "users:manage",
    ]);

    // Build where conditions
    const whereConditions: ReturnType<typeof eq>[] = [];

    // Regular users can only see their own tickets
    if (!isAdmin) {
      whereConditions.push(eq(supportTicketsTable.userId, payload.userId));
    }

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
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(supportTicketsTable.createdAt))
      .limit(limit)
      .offset(offset);

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
      pagination: {
        page,
        limit,
        hasMore: tickets.length === limit,
      },
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
  // ===== CSRF PROTECTION =====
  const csrfError = await requireCsrf(req);
  if (csrfError) return csrfError;

  // Strict rate limiting for POST requests (10 per minute)
  const rateLimitResponse = await strictRateLimit(req);
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
    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Error de validación",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { subject, description, category, priority, attachments } = validation.data;

    // Sanitize inputs to prevent XSS
    const sanitizedSubject = sanitizeHtml(subject);
    const sanitizedDescription = sanitizeHtml(description);

    // Create ticket
    const [newTicket] = await db
      .insert(supportTicketsTable)
      .values({
        userId: payload.userId,
        companyId: payload.companyId || null,
        subject: sanitizedSubject,
        description: sanitizedDescription,
        category,
        priority,
        attachments,
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

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { requireAuth, handleApiError, successResponse } from "@/lib/api-helpers";
import { requireCsrf } from "@/lib/csrf";
import { eq } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN =====
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token de acceso inválido" },
        { status: 401 }
      );
    }

    // ===== OBTENER USUARIO =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ===== OBTENER RELACIONES USUARIO-EMPRESA (simplificado) =====
    const userCompanies = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(eq(schema.userCompaniesTable.userId, user.id));

    // ===== OBTENER DATOS DE EMPRESAS Y ROLES =====
    const userCompaniesWithDetails = await Promise.all(
      userCompanies.map(async (uc) => {
        const [company, role] = await Promise.all([
          uc.companyId
            ? db.query.companiesTable.findFirst({
                where: eq(schema.companiesTable.id, uc.companyId),
              })
            : null,
          db.query.rolesTable.findFirst({
            where: eq(schema.rolesTable.id, uc.roleId),
          }),
        ]);

        return {
          ...uc,
          company,
          role,
        };
      })
    );

    // ===== FILTRAR SOLO RELACIONES ACTIVAS =====
    const activeUserCompanies = userCompaniesWithDetails.filter(
      (uc) => uc.isActive
    );

    // ===== DETERMINAR ROL PRINCIPAL Y EMPRESA =====
    // Prioridad: admin > company > student
    const rolePriority = { admin: 3, company: 2, student: 1 };

    let primaryUserCompany = activeUserCompanies[0];
    let highestPriority =
      rolePriority[
        primaryUserCompany?.role?.name as keyof typeof rolePriority
      ] || 0;

    for (const userCompany of activeUserCompanies) {
      const priority =
        rolePriority[userCompany.role?.name as keyof typeof rolePriority] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        primaryUserCompany = userCompany;
      }
    }

    // ===== PREPARAR RESPUESTA =====
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
      },
      currentCompany: primaryUserCompany?.company
        ? {
            id: primaryUserCompany.company.id,
            name: primaryUserCompany.company.name,
            rut: primaryUserCompany.company.rut,
            description: primaryUserCompany.company.description,
            website: primaryUserCompany.company.website,
            industry: primaryUserCompany.company.industry,
            size: primaryUserCompany.company.size,
            subscriptionPlan: primaryUserCompany.company.subscriptionPlan,
          }
        : null,
      currentRole: primaryUserCompany?.role
        ? {
            id: primaryUserCompany.role.id,
            name: primaryUserCompany.role.name,
            description: primaryUserCompany.role.description,
            permissions: primaryUserCompany.role.permissions,
          }
        : null,
      userCompanies: activeUserCompanies.map((uc) => ({
        id: uc.id,
        company: uc.company
          ? {
              id: uc.company.id,
              name: uc.company.name,
              rut: uc.company.rut,
              description: uc.company.description,
              website: uc.company.website,
              industry: uc.company.industry,
              size: uc.company.size,
              subscriptionPlan: uc.company.subscriptionPlan,
            }
          : null,
        role: uc.role
          ? {
              id: uc.role.id,
              name: uc.role.name,
              description: uc.role.description,
              permissions: uc.role.permissions,
            }
          : null,
        isActive: uc.isActive,
        joinedAt: uc.joinedAt,
        invitedBy: uc.invitedBy,
        acceptedAt: uc.acceptedAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // ===== CSRF PROTECTION =====
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    // ✅ CORREGIDO: Verificar autenticación antes de permitir crear usuarios
    await requireAuth(request);

    const { name, email } = await request.json();

    // ===== VALIDACIONES =====
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR SI EL USUARIO YA EXISTE =====
    const existingUser = await db.query.usersTable.findFirst({
      where: (fields, { eq }) => eq(fields.email, email),
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
      });
    }

    // ===== CREAR NUEVO USUARIO =====
    const [newUser] = await db
      .insert(schema.usersTable)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: schema.usersTable.id,
        name: schema.usersTable.name,
        email: schema.usersTable.email,
      });

    return successResponse(newUser);
  } catch (error) {
    console.error("Error creando usuario:", error);
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // ===== CSRF PROTECTION =====
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    // ===== VERIFICAR AUTENTICACIÓN =====
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token de acceso inválido" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar, phone, location, bio } = body;

    // ===== VALIDACIONES =====
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Email no se puede modificar por seguridad
    if (body.email) {
      return NextResponse.json(
        { error: "El correo electrónico no se puede modificar" },
        { status: 400 }
      );
    }

    // ===== ACTUALIZAR USUARIO =====
    const [updatedUser] = await db
      .update(schema.usersTable)
      .set({
        name: name.trim(),
        avatar: avatar || null,
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        bio: bio?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, payload.userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          phone: updatedUser.phone,
          location: updatedUser.location,
          bio: updatedUser.bio,
        },
      },
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

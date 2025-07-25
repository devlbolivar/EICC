import { NextRequest, NextResponse } from "next/server";
import db from "@/config/db";
import { usersTable } from "@/config/schema";
import { comparePassword, generateTokenPair, validateEmail } from "@/lib/auth";
import { validateAndSanitizeEmail } from "@/lib/utils";
import { eq } from "drizzle-orm";
import type { Permission } from "../../../types/index";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ===== VALIDACIONES BÁSICAS =====
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // ===== VALIDAR Y SANITIZAR EMAIL =====
    const sanitizedEmail = validateAndSanitizeEmail(email);
    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // ===== VALIDAR CONTRASEÑA =====
    if (typeof password !== "string" || password.length < 1) {
      return NextResponse.json(
        { error: "Contraseña inválida" },
        { status: 400 }
      );
    }

    // ===== BUSCAR USUARIO =====
    const user = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, sanitizedEmail),
    });

    if (!user) {
      // Usar el mismo mensaje para no revelar si el email existe
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR SI EL USUARIO ESTÁ ACTIVO =====
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Cuenta desactivada" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR CONTRASEÑA =====
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ===== OBTENER RELACIONES USUARIO-EMPRESA =====
    const userCompanies = await db.query.userCompaniesTable.findMany({
      where: (userCompanies, { eq }) => eq(userCompanies.userId, user.id),
      with: {
        company: true,
        role: true,
      },
    });

    // ===== FILTRAR SOLO RELACIONES ACTIVAS =====
    const activeUserCompanies = userCompanies.filter((uc) => uc.isActive);

    if (activeUserCompanies.length === 0) {
      return NextResponse.json(
        { error: "Usuario sin roles asignados" },
        { status: 401 }
      );
    }

    // ===== DETERMINAR ROL PRINCIPAL Y EMPRESA =====
    // Prioridad: admin > company > student
    const rolePriority = { admin: 3, company: 2, student: 1 };

    let primaryUserCompany = activeUserCompanies[0];
    let highestPriority =
      rolePriority[primaryUserCompany.role.name as keyof typeof rolePriority] ||
      0;

    for (const userCompany of activeUserCompanies) {
      const priority =
        rolePriority[userCompany.role.name as keyof typeof rolePriority] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        primaryUserCompany = userCompany;
      }
    }

    // ===== ACTUALIZAR ÚLTIMO LOGIN =====
    await db
      .update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, user.id));

    // ===== GENERAR TOKENS =====
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      companyId: primaryUserCompany.companyId || undefined,
      roleId: primaryUserCompany.roleId,
      permissions: primaryUserCompany.role
        .permissions as unknown as Permission[],
    };

    const tokens = generateTokenPair(tokenPayload);

    // ===== PREPARAR RESPUESTA =====
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      currentCompany: primaryUserCompany.company
        ? {
            id: primaryUserCompany.company.id,
            name: primaryUserCompany.company.name,
            rut: primaryUserCompany.company.rut,
          }
        : null,
      currentRole: {
        id: primaryUserCompany.role.id,
        name: primaryUserCompany.role.name,
        permissions: primaryUserCompany.role.permissions,
      },
      userCompanies: activeUserCompanies.map((uc) => ({
        id: uc.id,
        company: uc.company
          ? {
              id: uc.company.id,
              name: uc.company.name,
              rut: uc.company.rut,
            }
          : null,
        role: {
          id: uc.role.id,
          name: uc.role.name,
          permissions: uc.role.permissions,
        },
        isActive: uc.isActive,
        joinedAt: uc.joinedAt,
      })),
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        data: responseData,
      },
      { status: 200 }
    );

    // ===== SETEAR COOKIES CON CONFIGURACIÓN SEGURA =====
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

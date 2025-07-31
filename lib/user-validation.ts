import db from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function validateUserActive(userId: string): Promise<boolean> {
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    return user?.isActive ?? false;
  } catch (error) {
    console.error("Error validando usuario activo:", error);
    return false;
  }
}

export async function validateUserExists(userId: string): Promise<boolean> {
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    return !!user;
  } catch (error) {
    console.error("Error validando existencia de usuario:", error);
    return false;
  }
}

export async function validateUserEmailVerified(
  userId: string
): Promise<boolean> {
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    return user?.emailVerified ?? false;
  } catch (error) {
    console.error("Error validando email verificado:", error);
    return false;
  }
}

export async function validateUserPermissions(): Promise<boolean> {
  try {
    // Esta función se puede expandir para validar permisos específicos del usuario
    // Por ahora, retornamos true ya que los permisos se validan en el token
    return true;
  } catch (error) {
    console.error("Error validando permisos de usuario:", error);
    return false;
  }
}

export async function getUserValidationStatus(userId: string): Promise<{
  exists: boolean;
  isActive: boolean;
  emailVerified: boolean;
  hasValidPermissions: boolean;
}> {
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      return {
        exists: false,
        isActive: false,
        emailVerified: false,
        hasValidPermissions: false,
      };
    }

    return {
      exists: true,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      hasValidPermissions: true, // Se valida en el token
    };
  } catch (error) {
    console.error("Error obteniendo estado de validación de usuario:", error);
    return {
      exists: false,
      isActive: false,
      emailVerified: false,
      hasValidPermissions: false,
    };
  }
}

export async function logUserAccess(
  userId: string,
  route: string,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    // Aquí se puede implementar logging de acceso de usuarios
    console.log(
      `User Access Log: ${userId} -> ${route} -> ${
        success ? "SUCCESS" : "FAILED"
      }${error ? ` - ${error}` : ""}`
    );
  } catch (error) {
    console.error("Error logging user access:", error);
  }
}

export async function validateUserSession(userId: string): Promise<{
  isValid: boolean;
  reason?: string;
}> {
  try {
    const validationStatus = await getUserValidationStatus(userId);

    if (!validationStatus.exists) {
      return {
        isValid: false,
        reason: "Usuario no existe",
      };
    }

    if (!validationStatus.isActive) {
      return {
        isValid: false,
        reason: "Usuario desactivado",
      };
    }

    if (!validationStatus.emailVerified) {
      return {
        isValid: false,
        reason: "Email no verificado",
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Error validando sesión de usuario:", error);
    return {
      isValid: false,
      reason: "Error interno de validación",
    };
  }
}

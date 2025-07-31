import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../config/schema";
import { hashPassword } from "../lib/auth";

// ===== CONFIGURACIÓN DE BASE DE DATOS =====
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ Error: DATABASE_URL no está configurada en las variables de entorno"
  );
  console.error("Por favor, configura DATABASE_URL en tu archivo .env");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

console.log("🌱 Starting database seed...");

async function seedDatabase() {
  try {
    // ===== CREAR ROLES DEL SISTEMA =====
    console.log("Creating system roles...");

    const systemRoles = [
      {
        name: "admin",
        description: "Administrador de la plataforma",
        permissions: [
          "platform:read",
          "platform:write",
          "platform:admin",
          "company:read",
          "company:write",
          "company:admin",
          "users:read",
          "users:write",
          "users:invite",
          "users:remove",
          "courses:read",
          "courses:write",
          "courses:create",
          "courses:delete",
          "courses:publish",
          "content:read",
          "content:write",
          "content:create",
          "content:delete",
        ],
        isSystemRole: true,
      },
      {
        name: "company",
        description: "Administrador de empresa",
        permissions: [
          "company:read",
          "company:write",
          "company:admin",
          "company:billing",
          "users:read",
          "users:write",
          "users:invite",
          "users:remove",
          "courses:read",
          "courses:write",
          "courses:create",
          "courses:delete",
          "courses:publish",
          "content:read",
          "content:write",
          "content:create",
          "content:delete",
        ],
        isSystemRole: true,
      },
      {
        name: "student",
        description: "Estudiante",
        permissions: ["courses:read", "courses:enroll", "content:read"],
        isSystemRole: true,
      },
    ];

    const createdRoles = [];

    for (const roleData of systemRoles) {
      const existingRole = await db.query.rolesTable.findFirst({
        where: (roles, { eq }) => eq(roles.name, roleData.name),
      });

      if (existingRole) {
        console.log(`✅ Role ${roleData.name} already exists`);
        createdRoles.push(existingRole);
      } else {
        const [newRole] = await db
          .insert(schema.rolesTable)
          .values({
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            isSystemRole: roleData.isSystemRole,
          })
          .returning();

        console.log(`✅ Created role: ${newRole.name}`);
        createdRoles.push(newRole);
      }
    }

    // ===== CREAR USUARIO ADMIN =====
    console.log("Creating initial admin user...");

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

    if (adminPassword.length < 8) {
      console.error(
        "❌ Error: La contraseña de admin debe tener al menos 8 caracteres"
      );
      process.exit(1);
    }

    const adminPasswordHash = await hashPassword(adminPassword);

    const existingAdmin = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, adminEmail),
    });

    let adminUser;
    if (existingAdmin) {
      console.log(`✅ Admin user ${adminEmail} already exists`);
      adminUser = existingAdmin;
    } else {
      [adminUser] = await db
        .insert(schema.usersTable)
        .values({
          email: adminEmail,
          name: "Admin Example",
          passwordHash: adminPasswordHash,
          emailVerified: true,
          isActive: true,
        })
        .returning();
      console.log(`✅ Created admin user: ${adminEmail}`);
    }

    // ===== CREAR EMPRESA DE EJEMPLO =====
    console.log("Creating example company...");

    const companyName = process.env.SEED_COMPANY_NAME || "Empresa Ejemplo";
    const companyRut = process.env.SEED_COMPANY_RUT || "12345678-9";

    const existingCompany = await db.query.companiesTable.findFirst({
      where: (companies, { eq }) => eq(companies.rut, companyRut),
    });

    let exampleCompany;
    if (existingCompany) {
      console.log(`✅ Company ${companyName} already exists`);
      exampleCompany = existingCompany;
    } else {
      [exampleCompany] = await db
        .insert(schema.companiesTable)
        .values({
          name: companyName,
          rut: companyRut,
          description: "Empresa de ejemplo para testing",
          isActive: true,
          subscriptionPlan: "free",
        })
        .returning();
      console.log("✅ Created example company");
    }

    // ===== ASIGNAR ROL ADMIN =====
    const adminRole = createdRoles.find((role) => role.name === "admin");
    if (adminRole) {
      const existingAdminRole = await db.query.userCompaniesTable.findFirst({
        where: (userCompanies, { and, eq }) =>
          and(
            eq(userCompanies.userId, adminUser.id),
            eq(userCompanies.roleId, adminRole.id)
          ),
      });

      if (!existingAdminRole) {
        await db.insert(schema.userCompaniesTable).values({
          userId: adminUser.id,
          companyId: null,
          roleId: adminRole.id,
          isActive: true,
          acceptedAt: new Date(),
        });
        console.log("✅ Assigned admin role to admin user");
      } else {
        console.log("✅ Admin role already assigned to admin user");
      }
    }

    // ===== CREAR USUARIO DE EMPRESA =====
    console.log("Creating example company user...");

    const companyEmail =
      process.env.SEED_COMPANY_EMAIL || "company@example.com";
    const companyPassword = process.env.SEED_COMPANY_PASSWORD || "company123";

    if (companyPassword.length < 8) {
      console.error(
        "❌ Error: La contraseña de company debe tener al menos 8 caracteres"
      );
      process.exit(1);
    }

    const companyPasswordHash = await hashPassword(companyPassword);

    const existingCompanyUser = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, companyEmail),
    });

    let companyUser;
    if (existingCompanyUser) {
      console.log(`✅ Company user ${companyEmail} already exists`);
      companyUser = existingCompanyUser;
    } else {
      [companyUser] = await db
        .insert(schema.usersTable)
        .values({
          email: companyEmail,
          name: "Company User",
          passwordHash: companyPasswordHash,
          emailVerified: true,
          isActive: true,
        })
        .returning();
      console.log(`✅ Created company user: ${companyEmail}`);
    }

    // ===== ASIGNAR ROL COMPANY =====
    const companyRole = createdRoles.find((role) => role.name === "company");
    if (companyRole) {
      const existingCompanyRole = await db.query.userCompaniesTable.findFirst({
        where: (userCompanies, { and, eq }) =>
          and(
            eq(userCompanies.userId, companyUser.id),
            eq(userCompanies.roleId, companyRole.id)
          ),
      });

      if (!existingCompanyRole) {
        await db.insert(schema.userCompaniesTable).values({
          userId: companyUser.id,
          companyId: exampleCompany.id,
          roleId: companyRole.id,
          isActive: true,
          acceptedAt: new Date(),
        });
        console.log("✅ Assigned company role to company user");
      } else {
        console.log("✅ Company role already assigned to company user");
      }
    }

    // ===== CREAR USUARIO ESTUDIANTE =====
    console.log("Creating example student user...");

    const studentEmail =
      process.env.SEED_STUDENT_EMAIL || "student@example.com";
    const studentPassword = process.env.SEED_STUDENT_PASSWORD || "student123";

    if (studentPassword.length < 8) {
      console.error(
        "❌ Error: La contraseña de student debe tener al menos 8 caracteres"
      );
      process.exit(1);
    }

    const studentPasswordHash = await hashPassword(studentPassword);

    const existingStudent = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, studentEmail),
    });

    let studentUser;
    if (existingStudent) {
      console.log(`✅ Student user ${studentEmail} already exists`);
      studentUser = existingStudent;
    } else {
      [studentUser] = await db
        .insert(schema.usersTable)
        .values({
          email: studentEmail,
          name: "Student Example",
          passwordHash: studentPasswordHash,
          emailVerified: true,
          isActive: true,
        })
        .returning();
      console.log(`✅ Created student user: ${studentEmail}`);
    }

    // ===== ASIGNAR ROL STUDENT =====
    const studentRole = createdRoles.find((role) => role.name === "student");
    if (studentRole) {
      const existingStudentRole = await db.query.userCompaniesTable.findFirst({
        where: (userCompanies, { and, eq }) =>
          and(
            eq(userCompanies.userId, studentUser.id),
            eq(userCompanies.roleId, studentRole.id)
          ),
      });

      if (!existingStudentRole) {
        await db.insert(schema.userCompaniesTable).values({
          userId: studentUser.id,
          companyId: null,
          roleId: studentRole.id,
          isActive: true,
          acceptedAt: new Date(),
        });
        console.log("✅ Assigned student role to student user");
      } else {
        console.log("✅ Student role already assigned to student user");
      }
    }

    console.log("🎉 Database seed completed successfully!");
    console.log("\n📋 Default credentials:");
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`Company: ${companyEmail} / ${companyPassword}`);
    console.log(`Student: ${studentEmail} / ${studentPassword}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();

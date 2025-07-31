require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const bcrypt = require("bcryptjs");
const schema = require("../config/schema");

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

console.log("🚀 Setting up database...");

async function setupDatabase() {
  try {
    // ===== CREAR/FIND ROLES DEL SISTEMA =====
    console.log("📝 Creating/finding system roles...");

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

    console.log("✅ Roles ready");

    // ===== CREAR USUARIOS DE PRUEBA =====
    console.log("👤 Creating test admin user...");

    const adminEmail = process.env.TEST_ADMIN_EMAIL || "admin@test.com";
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || "admin123";

    if (adminPassword.length < 8) {
      console.error(
        "❌ Error: La contraseña de admin debe tener al menos 8 caracteres"
      );
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

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
          name: "Admin Test",
          passwordHash: hashedPassword,
          emailVerified: true,
          isActive: true,
        })
        .returning();
      console.log(`✅ Created admin user: ${adminEmail}`);
    }

    console.log("🎓 Creating test student user...");

    const studentEmail = process.env.TEST_STUDENT_EMAIL || "student@test.com";
    const studentPassword = process.env.TEST_STUDENT_PASSWORD || "student123";

    if (studentPassword.length < 8) {
      console.error(
        "❌ Error: La contraseña de student debe tener al menos 8 caracteres"
      );
      process.exit(1);
    }

    const studentPasswordHash = await bcrypt.hash(studentPassword, 12);

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
          name: "Student Test",
          passwordHash: studentPasswordHash,
          emailVerified: true,
          isActive: true,
        })
        .returning();
      console.log(`✅ Created student user: ${studentEmail}`);
    }

    console.log("✅ Users ready");

    // ===== ASIGNAR ROLES =====
    console.log("🔗 Assigning roles...");

    const adminRole = createdRoles.find((role) => role.name === "admin");
    const studentRole = createdRoles.find((role) => role.name === "student");

    if (!adminRole || !studentRole) {
      console.error("❌ Error: Roles requeridos no encontrados");
      process.exit(1);
    }

    // Asignar rol admin al usuario admin
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
        companyId: null, // Admin no pertenece a una empresa específica
        roleId: adminRole.id,
        isActive: true,
        acceptedAt: new Date(),
      });
      console.log("✅ Assigned admin role to admin user");
    } else {
      console.log("✅ Admin role already assigned to admin user");
    }

    // Asignar rol student al usuario student
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
        companyId: null, // Student individual
        roleId: studentRole.id,
        isActive: true,
        acceptedAt: new Date(),
      });
      console.log("✅ Assigned student role to student user");
    } else {
      console.log("✅ Student role already assigned to student user");
    }

    console.log("✅ Database setup completed!");
    console.log("🔑 Test accounts created/verified:");
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`   Student: ${studentEmail} / ${studentPassword}`);
    console.log("");
    console.log("🚀 Next step: npm run dev");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();

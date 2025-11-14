const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { eq } = require("drizzle-orm");
const schema = require("../config/schema");

const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg, { schema });

async function fixUserCompanyAssociation() {
  try {
    console.log(
      "🔍 Buscando usuarios con roles de empresa pero sin companyId..."
    );

    // Find users with company roles but no companyId
    const usersWithoutCompany = await db.execute(`
      SELECT 
        uc.id as user_company_id,
        uc."userId",
        uc."companyId",
        uc."roleId",
        uc."isActive",
        u.email,
        r.name as role_name
      FROM user_companies uc
      JOIN users u ON uc."userId" = u.id
      JOIN roles r ON uc."roleId" = r.id
      WHERE uc."companyId" IS NULL 
        AND r.name IN ('company', 'company_admin')
        AND uc."isActive" = true
    `);

    console.log(
      `📊 Encontrados ${usersWithoutCompany.rows.length} usuarios sin empresa asociada:`
    );

    for (const user of usersWithoutCompany.rows) {
      console.log(`\n👤 Usuario: ${user.email} (${user.user_id})`);
      console.log(`   Rol: ${user.role_name}`);
      console.log(`   User Company ID: ${user.user_company_id}`);

      // Ask if we should create a company for this user
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question(`¿Crear una empresa para ${user.email}? (y/n): `, resolve);
      });

      rl.close();

      if (answer.toLowerCase() === "y") {
        // Create a company for this user
        const companyName = `${user.email.split("@")[0]} Company`;
        const companyRut = `12.345.678-${Math.floor(Math.random() * 10)}`;

        console.log(`   🏢 Creando empresa: ${companyName}`);

        const newCompany = await db
          .insert(schema.companiesTable)
          .values({
            name: companyName,
            rut: companyRut,
            description: `Empresa creada automáticamente para ${user.email}`,
            isActive: true,
            subscriptionPlan: "free",
          })
          .returning();

        console.log(`   ✅ Empresa creada con ID: ${newCompany[0].id}`);

        // Update the user_companies record
        await db
          .update(schema.userCompaniesTable)
          .set({ companyId: newCompany[0].id })
          .where(eq(schema.userCompaniesTable.id, user.user_company_id));

        console.log(`   ✅ Usuario asociado a la empresa`);
      } else {
        console.log(`   ⏭️  Saltando usuario ${user.email}`);
      }
    }

    console.log("\n✅ Proceso completado");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
fixUserCompanyAssociation();

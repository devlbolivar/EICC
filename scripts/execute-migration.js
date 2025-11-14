const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function executeMigration() {
  try {
    console.log("🔄 Starting database migration...");

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(process.env.DATABASE_URL);

    // Statement 1: Add taxIdType column
    console.log("\n🔧 Adding taxIdType column...");
    await sql`ALTER TABLE companies ADD COLUMN IF NOT EXISTS "taxIdType" VARCHAR(20) DEFAULT 'rut'`;
    console.log("✅ taxIdType column added");

    // Statement 2: Update existing companies
    console.log("\n🔧 Updating existing companies...");
    await sql`UPDATE companies SET "taxIdType" = 'rut' WHERE "taxIdType" IS NULL`;
    console.log("✅ Existing companies updated");

    // Statement 3: Expand rut column length
    console.log("\n🔧 Expanding rut column length...");
    await sql`ALTER TABLE companies ALTER COLUMN rut TYPE VARCHAR(50)`;
    console.log("✅ rut column expanded");

    // Statement 4: Add comment for taxIdType
    console.log("\n🔧 Adding comment for taxIdType column...");
    await sql`COMMENT ON COLUMN companies."taxIdType" IS 'Type of tax identification: rut (Chile), vat (Europe), ein (US), cnpj (Brazil), tax_id (generic), other'`;
    console.log("✅ taxIdType comment added");

    // Statement 5: Add comment for rut
    console.log("\n🔧 Adding comment for rut column...");
    await sql`COMMENT ON COLUMN companies.rut IS 'Tax identification number (expanded to support international formats)'`;
    console.log("✅ rut comment added");

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

executeMigration();

const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function verifyMigration() {
  try {
    console.log("🔍 Verifying database migration...");

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check if taxIdType column exists
    console.log("\n🔧 Checking companies table structure...");
    const result = await sql`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name IN ('rut', 'taxIdType')
      ORDER BY column_name
    `;

    console.log("📋 Companies table columns:");
    result.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type}(${
          row.character_maximum_length || "N/A"
        }) - Default: ${row.column_default || "None"} - Nullable: ${
          row.is_nullable
        }`
      );
    });

    // Check if there are any companies with the new column
    const companyCount = await sql`SELECT COUNT(*) as count FROM companies`;
    console.log(`\n📊 Total companies in database: ${companyCount[0].count}`);

    const companiesWithTaxIdType =
      await sql`SELECT COUNT(*) as count FROM companies WHERE "taxIdType" IS NOT NULL`;
    console.log(
      `📊 Companies with taxIdType: ${companiesWithTaxIdType[0].count}`
    );

    console.log("\n✅ Migration verification completed!");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verifyMigration();

const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function runMigration() {
  try {
    console.log("🔄 Starting database migration...");

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("✅ Database URL found");

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, "add-tax-id-type-column.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Split the SQL into individual statements
    const rawStatements = migrationSQL.split(";");
    console.log(`🔍 Raw statements found: ${rawStatements.length}`);

    const statements = rawStatements
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))
      .map((stmt) => stmt.replace(/\n/g, " ").trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    console.log("📋 Statements:", statements);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔧 Executing statement ${i + 1}:`);
      console.log(statement);

      try {
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql.query(statement);
        console.log("✅ Statement executed successfully");
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        // Continue with other statements even if one fails
      }
    }

    console.log("\n🎉 Migration completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
runMigration();

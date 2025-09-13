import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function checkTableStructure() {
  try {
    console.log("🔍 Checking table structure...");

    // Check certificates table structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'certificates' 
      ORDER BY ordinal_position
    `;

    console.log("Certificates table columns:");
    tableInfo.forEach((col) => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Check if indexes exist
    const indexes = await sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'certificates'
    `;

    console.log("\nCertificates table indexes:");
    indexes.forEach((idx) => {
      console.log(`  ${idx.indexname}: ${idx.indexdef}`);
    });

    // Test a simple query
    const count = await sql`SELECT COUNT(*) as count FROM certificates`;
    console.log(`\nCertificates count: ${count[0].count}`);

    console.log("✅ Table structure check completed");
  } catch (error) {
    console.error("❌ Error checking table structure:", error);
    throw error;
  }
}

// Run the check
checkTableStructure()
  .then(() => {
    console.log("✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  });

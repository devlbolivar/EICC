import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function cleanupOrphanedData() {
  try {
    console.log("🧹 Cleaning up orphaned data...");

    // First, let's see what we have
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`Users: ${usersCount[0].count}`);

    const coursesCount = await sql`SELECT COUNT(*) as count FROM courses`;
    console.log(`Courses: ${coursesCount[0].count}`);

    // Check for orphaned courses
    const orphanedCourses = await sql`
      SELECT c.id, c.name, c."createdBy" 
      FROM courses c 
      LEFT JOIN users u ON c."createdBy" = u.id 
      WHERE u.id IS NULL
    `;

    console.log(`Found ${orphanedCourses.length} orphaned courses`);

    if (orphanedCourses.length > 0) {
      console.log("🗑️  Deleting orphaned courses...");

      // Delete orphaned courses
      const deletedCourses = await sql`
        DELETE FROM courses 
        WHERE "createdBy" NOT IN (SELECT id FROM users)
        RETURNING id, name
      `;

      console.log(`✅ Deleted ${deletedCourses.length} orphaned courses`);
    }

    // Now create the certificates table
    console.log("📋 Creating certificates table...");

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS certificates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "certificateId" VARCHAR(255) NOT NULL UNIQUE,
          "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "companyId" UUID REFERENCES companies(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          grade INTEGER NOT NULL,
          "issuedDate" TIMESTAMP NOT NULL DEFAULT NOW(),
          "completedDate" TIMESTAMP NOT NULL,
          duration VARCHAR(100),
          "certificateUrl" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;

      console.log("✅ Certificates table created successfully");

      // Create indexes
      await sql`
        CREATE INDEX IF NOT EXISTS "user_certificate_idx" ON certificates("userId", "courseId")
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS "certificate_id_idx" ON certificates("certificateId")
      `;

      console.log("✅ Indexes created successfully");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️  Certificates table already exists");
      } else {
        throw error;
      }
    }

    // Verify the table was created
    const certificatesCount =
      await sql`SELECT COUNT(*) as count FROM certificates`;
    console.log(`Certificates: ${certificatesCount[0].count}`);

    console.log("🎉 Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error cleaning up database:", error);
    throw error;
  }
}

// Run the cleanup
cleanupOrphanedData()
  .then(() => {
    console.log("✅ Database cleanup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database cleanup failed:", error);
    process.exit(1);
  });

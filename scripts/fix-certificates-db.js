import { db } from "../config/db.js";
import { sql } from "drizzle-orm";

async function fixDatabase() {
  try {
    console.log("🔧 Fixing database issues...");

    // First, let's check what's in the database
    console.log("📊 Checking current database state...");

    const usersResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM users`
    );
    console.log(`Users: ${usersResult.rows[0]?.count || 0}`);

    const coursesResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM courses`
    );
    console.log(`Courses: ${coursesResult.rows[0]?.count || 0}`);

    // Check for orphaned courses
    const orphanedCourses = await db.execute(sql`
      SELECT c.id, c.name, c."createdBy" 
      FROM courses c 
      LEFT JOIN users u ON c."createdBy" = u.id 
      WHERE u.id IS NULL
    `);

    console.log(`Orphaned courses: ${orphanedCourses.rows.length}`);

    if (orphanedCourses.rows.length > 0) {
      console.log("🧹 Cleaning up orphaned courses...");

      // Delete orphaned courses
      await db.execute(sql`
        DELETE FROM courses 
        WHERE "createdBy" NOT IN (SELECT id FROM users)
      `);

      console.log("✅ Orphaned courses cleaned up");
    }

    // Now let's try to create the certificates table manually
    console.log("📋 Creating certificates table...");

    try {
      await db.execute(sql`
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
      `);

      console.log("✅ Certificates table created successfully");

      // Create indexes
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "user_certificate_idx" ON certificates("userId", "courseId")
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "certificate_id_idx" ON certificates("certificateId")
      `);

      console.log("✅ Indexes created successfully");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("ℹ️  Certificates table already exists");
      } else {
        throw error;
      }
    }

    // Verify the table was created
    const certificatesResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM certificates`
    );
    console.log(`Certificates: ${certificatesResult.rows[0]?.count || 0}`);

    console.log("🎉 Database fix completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing database:", error);
    throw error;
  }
}

// Run the fix
fixDatabase()
  .then(() => {
    console.log("✅ Database fix completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database fix failed:", error);
    process.exit(1);
  });

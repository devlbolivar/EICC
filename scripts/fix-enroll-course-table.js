const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function fixEnrollCourseTable() {
  try {
    console.log("🔄 Starting enroll_course table migration...");

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check if enrollCourse table exists (old name)
    console.log("\n🔍 Checking if 'enrollCourse' table exists...");
    const enrollCourseExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'enrollCourse'
      )
    `;

    // Check if enroll_course table exists (new name)
    console.log("🔍 Checking if 'enroll_course' table exists...");
    const enrollCourseSnakeExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'enroll_course'
      )
    `;

    if (enrollCourseExists[0].exists) {
      console.log("\n✅ Found 'enrollCourse' table, renaming to 'enroll_course'...");

      // Rename the table
      await sql`ALTER TABLE "enrollCourse" RENAME TO "enroll_course"`;
      console.log("✅ Table renamed successfully");

      // Rename constraints
      console.log("\n🔧 Renaming constraints...");
      try {
        await sql`ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_course_id_courses_id_fk" TO "enroll_course_course_id_courses_id_fk"`;
        console.log("✅ Renamed course_id constraint");
      } catch (e) {
        console.log("⚠️  Course constraint might already be renamed:", e.message);
      }

      try {
        await sql`ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_user_id_users_id_fk" TO "enroll_course_user_id_users_id_fk"`;
        console.log("✅ Renamed user_id constraint");
      } catch (e) {
        console.log("⚠️  User constraint might already be renamed:", e.message);
      }

      try {
        await sql`ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_company_id_companies_id_fk" TO "enroll_course_company_id_companies_id_fk"`;
        console.log("✅ Renamed company_id constraint");
      } catch (e) {
        console.log("⚠️  Company constraint might already be renamed:", e.message);
      }

    } else if (enrollCourseSnakeExists[0].exists) {
      console.log("\n✅ Table 'enroll_course' already exists with correct name");
    } else {
      console.log("\n⚠️  Neither 'enrollCourse' nor 'enroll_course' table exists");
      console.log("🔧 Creating 'enroll_course' table...");

      await sql`
        CREATE TABLE "enroll_course" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "course_id" uuid NOT NULL,
          "user_id" uuid NOT NULL,
          "company_id" uuid,
          "completedChapters" json DEFAULT '{}'::json,
          "progress" integer DEFAULT 0 NOT NULL,
          "isCompleted" boolean DEFAULT false NOT NULL,
          "completedAt" timestamp,
          "enrolledAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL,
          "cid" varchar(255),
          "userEmail" varchar(255)
        )
      `;
      console.log("✅ Table created");

      console.log("\n🔧 Creating foreign key constraints...");
      await sql`
        ALTER TABLE "enroll_course"
        ADD CONSTRAINT "enroll_course_course_id_courses_id_fk"
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade
      `;
      await sql`
        ALTER TABLE "enroll_course"
        ADD CONSTRAINT "enroll_course_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
      `;
      await sql`
        ALTER TABLE "enroll_course"
        ADD CONSTRAINT "enroll_course_company_id_companies_id_fk"
        FOREIGN KEY ("company_id") REFERENCES "companies"("id")
      `;
      console.log("✅ Constraints created");

      console.log("\n🔧 Creating indexes...");
      await sql`
        CREATE INDEX "user_course_idx" ON "enroll_course" USING btree ("user_id","course_id")
      `;
      console.log("✅ Indexes created");
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   - Table 'enroll_course' is now available");
    console.log("   - All constraints and indexes are in place");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

fixEnrollCourseTable();

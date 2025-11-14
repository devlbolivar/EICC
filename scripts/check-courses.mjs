import { db } from "../config/db.js";
import { sql } from "drizzle-orm";

async function checkCourses() {
  try {
    console.log("Checking existing courses...");

    const result = await db.execute(sql`
      SELECT id, name, status, "isActive" 
      FROM courses 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `);

    console.log("Found courses:", result.rows.length);
    result.rows.forEach((course) => {
      console.log(
        `- ${course.name} (${course.id}) - Status: ${course.status} - Active: ${course.isActive}`
      );
    });
  } catch (error) {
    console.error("Error checking courses:", error);
  } finally {
    process.exit(0);
  }
}

checkCourses();

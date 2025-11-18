import { db } from "@/config/db";
import { sql } from "drizzle-orm";
import { generateCertificateForCompletion } from "./certificate-service";

/**
 * Check if a certificate exists for a completed course
 */
export async function checkCertificateExists(
  courseId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT id FROM certificates 
      WHERE "course_id" = ${courseId} 
      AND "user_id" = ${userId} 
      AND "isActive" = true
    `);

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking certificate existence:", error);
    return false;
  }
}

/**
 * Create a certificate for a previously completed course
 */
export async function createRetroactiveCertificate(
  courseId: string,
  userId: string,
  companyId?: string
) {
  try {
    console.log(
      `🔍 Creating retroactive certificate for course ${courseId}, user ${userId}`
    );

    // First check if certificate already exists
    const existingCertificate = await checkCertificateExists(courseId, userId);
    if (existingCertificate) {
      console.log(`✅ Certificate already exists for course ${courseId}`);
      // Get the existing certificate details
      const certResult = await db.execute(sql`
        SELECT cert.*, c.name as course_name, u.name as user_name
        FROM certificates cert
        LEFT JOIN courses c ON cert."course_id" = c.id
        LEFT JOIN users u ON cert."user_id" = u.id
        WHERE cert."course_id" = ${courseId} 
        AND cert."user_id" = ${userId} 
        AND cert."isActive" = true
      `);

      return {
        success: true,
        certificate: certResult.rows[0],
        alreadyExists: true,
      };
    }

    // Get course details
    const courseResult = await db.execute(sql`
      SELECT * FROM courses WHERE id = ${courseId} AND "isActive" = true
    `);

    if (courseResult.rows.length === 0) {
      throw new Error("Course not found");
    }

    const course = courseResult.rows[0] as Record<string, unknown>;

    // Get enrollment details
    const enrollmentResult = await db.execute(sql`
      SELECT * FROM "enroll_course" 
      WHERE "course_id" = ${courseId} 
      AND "user_id" = ${userId} 
      AND "isCompleted" = true
    `);

    if (enrollmentResult.rows.length === 0) {
      throw new Error("Completed enrollment not found");
    }

    const enrollment = enrollmentResult.rows[0] as Record<string, unknown>;

    // Create certificate data
    const certificateData = {
      courseId,
      userId,
      course,
      enrollment,
      companyId: companyId || enrollment.companyId || null,
    };

    // Generate certificate
    const result = await generateCertificateForCompletion(certificateData);

    if (result.success) {
      console.log(
        `✅ Retroactive certificate created successfully for course ${courseId}`
      );
      return { success: true, certificate: result.certificate };
    } else {
      console.error(
        `❌ Failed to create retroactive certificate for course ${courseId}:`,
        result.error
      );
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error creating retroactive certificate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check and create missing certificates for a user
 */
export async function ensureCertificatesForUser(
  userId: string,
  companyId?: string
) {
  try {
    console.log(`🔍 Checking for missing certificates for user ${userId}`);

    // Get all completed courses for the user
    const completedCourses = await db.execute(sql`
      SELECT ec."course_id", c.*, ec."completedAt", ec."progress"
      FROM "enroll_course" ec
      JOIN courses c ON ec."course_id" = c.id
      WHERE ec."user_id" = ${userId} 
      AND ec."isCompleted" = true
      AND c."isActive" = true
    `);

    const missingCertificates = [];

    for (const course of completedCourses.rows) {
      const courseId = (course as Record<string, unknown>).course_id as string;
      const hasCertificate = await checkCertificateExists(courseId, userId);

      if (!hasCertificate) {
        console.log(`📋 Missing certificate for course ${courseId}`);
        missingCertificates.push(courseId);
      }
    }

    if (missingCertificates.length === 0) {
      console.log("✅ All completed courses have certificates");
      return {
        success: true,
        created: 0,
        message: "All certificates up to date",
      };
    }

    // Create missing certificates
    let created = 0;
    const errors = [];

    for (const courseId of missingCertificates) {
      const result = await createRetroactiveCertificate(
        courseId,
        userId,
        companyId
      );
      if (result.success) {
        created++;
      } else {
        errors.push({ courseId, error: result.error });
      }
    }

    console.log(
      `✅ Created ${created} retroactive certificates, ${errors.length} errors`
    );

    return {
      success: true,
      created,
      errors,
      message: `Created ${created} missing certificates`,
    };
  } catch (error) {
    console.error("Error ensuring certificates for user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

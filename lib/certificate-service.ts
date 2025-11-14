import { db } from "@/config/db";
import { certificatesTable } from "@/config/schema";
import { sql } from "drizzle-orm";
import { Course, EnrollCourse } from "@/app/types";

export interface CertificateGenerationData {
  courseId: string;
  userId: string;
  course: Course;
  enrollment: EnrollCourse;
  companyId?: string;
}

export interface CertificateGenerationResult {
  success: boolean;
  certificate?: Record<string, unknown>;
  error?: string;
}

/**
 * Generates a unique certificate ID
 */
export function generateCertificateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

/**
 * Calculates the grade based on course completion and performance
 */
export function calculateCertificateGrade(
  _enrollment: EnrollCourse,
  _course: Course
): number {
  // Base grade for completion
  const grade = 100;

  // You can add more sophisticated grading logic here
  // For example, based on time taken, retries, etc.

  return Math.min(Math.max(grade, 0), 100);
}

/**
 * Generates certificate data for a completed course
 */
export function createCertificateData(data: CertificateGenerationData) {
  const { courseId, userId, course, enrollment, companyId } = data;

  const certificateId = generateCertificateId();
  const grade = calculateCertificateGrade(enrollment, course);
  const completedDate = enrollment.completedAt || new Date();

  const certificateData = {
    certificateId,
    courseId,
    userId,
    companyId: companyId || enrollment.companyId || null,
    title: `Certificado de Finalización - ${course.name}`,
    description: `Certificado por completar exitosamente el curso "${
      course.name
    }" de ${course.category || "Educación"}.`,
    grade,
    completedDate:
      completedDate instanceof Date ? completedDate : new Date(completedDate),
    duration: course.estimatedDuration || "N/A",
    certificateUrl: null, // Will be generated later if needed
  };

  return certificateData;
}

/**
 * Checks if a certificate already exists for a user and course
 */
export async function checkExistingCertificate(
  courseId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT id FROM certificates 
      WHERE "course_id" = ${courseId} AND "user_id" = ${userId} AND "isActive" = true
    `);

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking existing certificate:", error);
    return false;
  }
}

/**
 * Generates a certificate automatically when a course is completed
 */
export async function generateCertificateForCompletion(
  data: CertificateGenerationData
): Promise<CertificateGenerationResult> {
  try {
    const { courseId, userId } = data;

    // Check if certificate already exists
    const exists = await checkExistingCertificate(courseId, userId);
    if (exists) {
      return {
        success: false,
        error: "Certificate already exists for this course",
      };
    }

    // Create certificate data
    const certificateData = createCertificateData(data);

    // Insert certificate into database
    const result = await db
      .insert(certificatesTable)
      .values(certificateData)
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Failed to create certificate",
      };
    }

    return {
      success: true,
      certificate: result[0],
    };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets certificate for a specific course and user
 */
export async function getCertificateForCourse(
  courseId: string,
  userId: string
): Promise<Record<string, unknown> | null> {
  try {
    const result = await db.execute(sql`
      SELECT 
        cert.*,
        c.name as course_name,
        c.description as course_description,
        c.category as course_category,
        c.level as course_level,
        c."estimatedDuration" as course_duration,
        u.name as user_name,
        u.email as user_email
      FROM certificates cert
      LEFT JOIN courses c ON cert."course_id" = c.id
      LEFT JOIN users u ON cert."user_id" = u.id
      WHERE cert."course_id" = ${courseId} 
        AND cert."user_id" = ${userId} 
        AND cert."isActive" = true
    `);

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting certificate:", error);
    return null;
  }
}

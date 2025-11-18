-- Migration: Rename enrollCourse to enroll_course
-- Description: Rename table from mixedCase to snake_case for PostgreSQL conventions
-- Date: 2025-11-18

-- Step 1: Rename the table
ALTER TABLE "enrollCourse" RENAME TO "enroll_course";--> statement-breakpoint

-- Step 2: Rename constraints (PostgreSQL automatically updates most references)
ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_course_id_courses_id_fk" TO "enroll_course_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_user_id_users_id_fk" TO "enroll_course_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_company_id_companies_id_fk" TO "enroll_course_company_id_companies_id_fk";--> statement-breakpoint

-- ROLLBACK SCRIPT (save this separately):
-- ALTER TABLE "enroll_course" RENAME TO "enrollCourse";
-- ALTER TABLE "enrollCourse" RENAME CONSTRAINT "enroll_course_course_id_courses_id_fk" TO "enrollCourse_course_id_courses_id_fk";
-- ALTER TABLE "enrollCourse" RENAME CONSTRAINT "enroll_course_user_id_users_id_fk" TO "enrollCourse_user_id_users_id_fk";
-- ALTER TABLE "enrollCourse" RENAME CONSTRAINT "enroll_course_company_id_companies_id_fk" TO "enrollCourse_company_id_companies_id_fk";

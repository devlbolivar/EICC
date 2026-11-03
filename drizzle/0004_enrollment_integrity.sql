ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordChangedAt" timestamp;
--> statement-breakpoint
-- Duplicate records require an explicit data-reconciliation decision; never delete them silently.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM enroll_course GROUP BY course_id, user_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Duplicate enrollments found. Reconcile course_id/user_id pairs before migrating.';
  END IF;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "user_course_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX "user_course_idx" ON "enroll_course" ("user_id", "course_id");

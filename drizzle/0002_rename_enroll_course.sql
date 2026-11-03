-- Support databases where this previously unregistered migration was applied manually.
-- Refuse ambiguous state rather than dropping or merging user data.
DO $$
BEGIN
  IF to_regclass('public."enrollCourse"') IS NOT NULL THEN
    IF to_regclass('public.enroll_course') IS NOT NULL THEN
      RAISE EXCEPTION 'Both enrollment tables exist. Reconcile them before migrating.';
    END IF;
    ALTER TABLE "enrollCourse" RENAME TO "enroll_course";
  END IF;
  IF to_regclass('public.enroll_course') IS NULL THEN
    RAISE EXCEPTION 'Enrollment table missing. Apply the baseline migrations first.';
  END IF;
END $$;
--> statement-breakpoint
DO $$
DECLARE suffix text;
BEGIN
  FOREACH suffix IN ARRAY ARRAY['course_id_courses_id_fk', 'user_id_users_id_fk', 'company_id_companies_id_fk'] LOOP
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'enroll_course'::regclass AND conname = 'enrollCourse_' || suffix) THEN
      EXECUTE format('ALTER TABLE enroll_course RENAME CONSTRAINT %I TO %I', 'enrollCourse_' || suffix, 'enroll_course_' || suffix);
    END IF;
  END LOOP;
END $$;

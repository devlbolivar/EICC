-- Execute ALL statements in ONE transaction, after a verified backup.
-- This surgical repair deliberately leaves Drizzle migration history untouched.
SET LOCAL lock_timeout = '5s';
--> statement-breakpoint
SET LOCAL statement_timeout = '30s';
--> statement-breakpoint
LOCK TABLE public.enroll_course IN SHARE ROW EXCLUSIVE MODE;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.enroll_course GROUP BY user_id, course_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Duplicate enrollments found; no data or index was changed.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_index
    WHERE indexrelid = to_regclass('public.user_course_idx')
      AND indrelid <> 'public.enroll_course'::regclass
  ) THEN
    RAISE EXCEPTION 'Unexpected table for user_course_idx; inspect schema before proceeding.';
  END IF;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS public.user_course_idx;
--> statement-breakpoint
CREATE UNIQUE INDEX user_course_idx ON public.enroll_course (user_id, course_id);

# Fix: enroll_course Table Error

## Problem

The application is throwing the following error when trying to fetch employees:

```
Error [NeonDbError]: relation "enroll_course" does not exist
```

This error occurs in `/app/api/company/employees/route.ts:137` when the query tries to access the `enroll_course` table to count completed courses for employees.

## Root Cause

The database schema defines the `enroll_course` table, but the migrations haven't been applied to the database. The table might:

1. Not exist at all
2. Exist with the old name `enrollCourse` (camelCase) instead of `enroll_course` (snake_case)

## Solution

### Option 1: Run the Migration Script (Recommended)

A migration script has been created to automatically fix this issue.

**Steps:**

1. Make sure your `DATABASE_URL` environment variable is set
2. Run the migration:

```bash
npm run db:fix-enroll-course
```

The script will:
- Check if the `enrollCourse` table exists and rename it to `enroll_course`
- If neither table exists, create the `enroll_course` table with all necessary columns, indexes, and constraints
- Handle constraint renaming automatically

### Option 2: Manual SQL Execution

If you prefer to run SQL manually, execute the appropriate SQL based on your situation:

#### If you have the old `enrollCourse` table:

```sql
-- Rename the table
ALTER TABLE "enrollCourse" RENAME TO "enroll_course";

-- Rename constraints
ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_course_id_courses_id_fk" TO "enroll_course_course_id_courses_id_fk";
ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_user_id_users_id_fk" TO "enroll_course_user_id_users_id_fk";
ALTER TABLE "enroll_course" RENAME CONSTRAINT "enrollCourse_company_id_companies_id_fk" TO "enroll_course_company_id_companies_id_fk";
```

#### If the table doesn't exist at all:

```sql
-- Create the table
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
);

-- Add foreign key constraints
ALTER TABLE "enroll_course"
ADD CONSTRAINT "enroll_course_course_id_courses_id_fk"
FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade;

ALTER TABLE "enroll_course"
ADD CONSTRAINT "enroll_course_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;

ALTER TABLE "enroll_course"
ADD CONSTRAINT "enroll_course_company_id_companies_id_fk"
FOREIGN KEY ("company_id") REFERENCES "companies"("id");

-- Create indexes
CREATE INDEX "user_course_idx" ON "enroll_course" USING btree ("user_id","course_id");
```

### Option 3: Use Drizzle Kit Push (For Development)

If you're in a development environment and want to sync all schema changes:

```bash
# Make sure DATABASE_URL is set
npm run db:push
```

**⚠️ Warning:** This will apply ALL schema changes. Use with caution in production.

## Verification

After running the migration, verify the table exists:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'enroll_course';
```

You should see the `enroll_course` table listed.

## Testing the Fix

After applying the migration, test the employees endpoint:

```bash
curl -X GET "http://your-domain/api/company/employees?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The endpoint should now return employee data without errors.

## Files Changed

- `scripts/fix-enroll-course-table.js` - New migration script
- `package.json` - Added `db:fix-enroll-course` script

## Related Files

- `/config/schema.ts:158` - Table definition
- `/app/api/company/employees/route.ts:137` - Query location
- `/drizzle/0002_rename_enroll_course.sql` - Original migration file

-- Create certificates table
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "user_certificate_idx" ON certificates("userId", "courseId");
CREATE INDEX IF NOT EXISTS "certificate_id_idx" ON certificates("certificateId");

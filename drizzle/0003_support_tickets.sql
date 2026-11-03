-- Support Tickets Table
CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company_id" uuid REFERENCES "companies"("id") ON DELETE SET NULL,
  "subject" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "category" varchar(50) NOT NULL,
  "priority" varchar(20) NOT NULL DEFAULT 'normal',
  "status" varchar(20) NOT NULL DEFAULT 'open',
  "attachments" json DEFAULT '[]',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "resolved_at" timestamp,
  "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL
);
--> statement-breakpoint

-- Support Messages Table
CREATE TABLE IF NOT EXISTS "support_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ticket_id" uuid NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "message" text NOT NULL,
  "is_staff_reply" boolean NOT NULL DEFAULT false,
  "attachments" json DEFAULT '[]',
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Indexes for support_tickets
CREATE INDEX IF NOT EXISTS "user_ticket_idx" ON "support_tickets" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_status_idx" ON "support_tickets" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_ticket_idx" ON "support_tickets" ("company_id");
--> statement-breakpoint

-- Indexes for support_messages
CREATE INDEX IF NOT EXISTS "ticket_message_idx" ON "support_messages" ("ticket_id");
--> statement-breakpoint

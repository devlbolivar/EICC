CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"stripeInvoiceId" varchar(255) NOT NULL,
	"stripeCustomerId" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"status" varchar(50) NOT NULL,
	"invoiceNumber" varchar(100),
	"description" text,
	"pdfUrl" text,
	"hostedInvoiceUrl" text,
	"billingReason" varchar(100),
	"dueDate" timestamp,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_stripeInvoiceId_unique" UNIQUE("stripeInvoiceId")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"stripeCustomerId" varchar(255) NOT NULL,
	"stripeSubscriptionId" varchar(255),
	"stripePriceId" varchar(255),
	"status" varchar(50) DEFAULT 'inactive' NOT NULL,
	"planName" varchar(100) NOT NULL,
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"trialEnd" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "rut" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "taxIdType" varchar(20) DEFAULT 'rut';--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_invoice_idx" ON "invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "stripe_invoice_idx" ON "invoices" USING btree ("stripeInvoiceId");--> statement-breakpoint
CREATE INDEX "company_subscription_idx" ON "subscriptions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "stripe_customer_idx" ON "subscriptions" USING btree ("stripeCustomerId");--> statement-breakpoint
CREATE INDEX "stripe_subscription_idx" ON "subscriptions" USING btree ("stripeSubscriptionId");
import {
  pgTable,
  unique,
  integer,
  varchar,
  uuid,
  text,
  boolean,
  timestamp,
  json,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "users_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    name: varchar({ length: 255 }).notNull(),
    age: integer(),
    email: varchar({ length: 255 }).notNull(),
    subscriptionId: varchar({ length: 255 }),
  },
  (table) => [unique("users_email_unique").on(table.email)]
);

export const companies = pgTable(
  "companies",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    rut: varchar({ length: 20 }).notNull(),
    description: text(),
    logo: text(),
    website: varchar({ length: 255 }),
    industry: varchar({ length: 255 }),
    size: varchar({ length: 50 }),
    isActive: boolean().default(true).notNull(),
    subscriptionPlan: varchar({ length: 50 }).default("free"),
    subscriptionExpiresAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("companies_rut_unique").on(table.rut)]
);

export const courses = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "courses_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  cid: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  numberOfChapters: integer().notNull(),
  includeVideos: boolean().default(false).notNull(),
  difficulty: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  courseJson: json(),
  userEmail: varchar().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  bannerImage: text().default(""),
  courseContent: json().default({}),
});

export const enrollCourse = pgTable("enrollCourse", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "enrollCourse_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
  }),
  cid: varchar(),
  userEmail: varchar(),
  completedChapters: json().default({}),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const invitationTokens = pgTable(
  "invitation_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    companyId: uuid("company_id").notNull(),
    roleId: uuid("role_id").notNull(),
    token: varchar({ length: 255 }).notNull(),
    invitedBy: uuid("invited_by").notNull(),
    expiresAt: timestamp({ mode: "string" }).notNull(),
    isUsed: boolean().default(false).notNull(),
    usedAt: timestamp({ mode: "string" }),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("invitation_tokens_token_unique").on(table.token)]
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    description: text(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("organizations_slug_unique").on(table.slug)]
);

export const roleEnum = pgTable("role_enum", {
  value: varchar({ length: 20 }).primaryKey().notNull(),
});

export const roles = pgTable(
  "roles",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    permissions: jsonb().default([]).notNull(),
    isSystemRole: boolean().default(false).notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("roles_name_unique").on(table.name)]
);

export const userCompanies = pgTable("user_companies", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  companyId: uuid("company_id"),
  roleId: uuid("role_id").notNull(),
  isActive: boolean().default(true).notNull(),
  joinedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  invitedBy: uuid("invited_by"),
  acceptedAt: timestamp({ mode: "string" }),
});

export const userOrganizations = pgTable("user_organizations", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  organizationId: uuid("organization_id").notNull(),
  roleId: uuid("role_id").notNull(),
  isActive: boolean().default(true).notNull(),
  joinedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  invitedBy: uuid("invited_by"),
  acceptedAt: timestamp({ mode: "string" }),
});

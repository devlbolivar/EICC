import {
  integer,
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  json,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  CourseLevel,
  CourseStatus,
  CourseVisibility,
  SubscriptionPlan,
  SubscriptionStatus,
  Currency
} from "@/lib/enums";

// ===== ENUMERACIONES =====


// ===== USUARIOS Y AUTENTICACIÓN =====
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  passwordHash: varchar({ length: 255 }), // null para login social
  emailVerified: boolean().notNull().default(false),
  emailVerificationToken: varchar({ length: 255 }),
  emailVerificationExpires: timestamp(),
  resetPasswordToken: varchar({ length: 255 }),
  resetPasswordExpires: timestamp(),
  avatar: text(),
  isActive: boolean().notNull().default(true),
  lastLoginAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  // Campos adicionales del schema de drizzle
  age: integer(),
  subscriptionId: varchar({ length: 255 }),
  // Campos adicionales para el perfil
  phone: varchar({ length: 50 }),
  location: varchar({ length: 255 }),
  bio: text(),
  passwordChangedAt: timestamp(), // set on password change; refresh tokens issued before this are invalid
});

// ===== EMPRESAS/COMPAÑÍAS =====
export const companiesTable = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  rut: varchar({ length: 50 }).notNull().unique(), // Tax ID (expanded length for international formats)
  taxIdType: varchar({ length: 20 }).default("rut"), // Type of tax ID (rut, vat, ein, cnpj, etc.)
  description: text(),
  logo: text(),
  website: varchar({ length: 255 }),
  industry: varchar({ length: 255 }),
  size: varchar({ length: 50 }), // small, medium, large
  isActive: boolean().notNull().default(true),
  subscriptionPlan: varchar({ length: 50 }).default(SubscriptionPlan.FREE), // free, starter, pro
  subscriptionExpiresAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// ===== ROLES =====
export const rolesTable = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  permissions: jsonb().notNull().default([]), // Array de permisos
  isSystemRole: boolean().notNull().default(false), // Roles del sistema no se pueden eliminar
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

// ===== RELACIONES USUARIO-EMPRESA =====
export const userCompaniesTable = pgTable(
  "user_companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    companyId: uuid("companyId").references(() => companiesTable.id, {
      onDelete: "cascade",
    }), // nullable para usuarios individuales
    roleId: uuid("roleId")
      .notNull()
      .references(() => rolesTable.id),
    isActive: boolean().notNull().default(true),
    joinedAt: timestamp().notNull().defaultNow(),
    invitedBy: uuid("invitedBy").references(() => usersTable.id),
    acceptedAt: timestamp(),
  },
  (table) => ({
    userCompanyIdx: index("user_company_idx").on(table.userId, table.companyId),
  })
);

// ===== TOKENS DE INVITACIÓN =====
export const invitationTokensTable = pgTable("invitation_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull(),
  companyId: uuid("companyId")
    .notNull()
    .references(() => companiesTable.id, { onDelete: "cascade" }),
  roleId: uuid("roleId")
    .notNull()
    .references(() => rolesTable.id),
  token: varchar({ length: 255 }).notNull().unique(),
  invitedBy: uuid("invitedBy")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp().notNull(),
  isUsed: boolean().notNull().default(false),
  usedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
});

// ===== CURSOS (unificado con campos adicionales) =====
export const coursesTable = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  cid: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  numberOfChapters: integer().notNull(),
  includeVideos: boolean().notNull().default(false),
  difficulty: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  courseJson: json(),
  bannerImage: text().default(""),
  courseContent: json().default({}),
  createdBy: uuid("createdBy")
    .notNull()
    .references(() => usersTable.id),
  companyId: uuid("companyId").references(() => companiesTable.id), // null para cursos individuales
  userEmail: varchar({ length: 255 }),
  isPublic: boolean().notNull().default(false),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  // Campos adicionales del schema de drizzle
  level: varchar({ length: 50 }).default(CourseLevel.BASIC).notNull(), // basic, intermediate, advanced
  status: varchar({ length: 50 }).default(CourseStatus.DRAFT).notNull(), // draft, published, archived
  estimatedDuration: varchar({ length: 100 }), // Duración estimada en formato libre
  visibility: varchar({ length: 50 }).default(CourseVisibility.PUBLIC).notNull(), // public, private, specific_companies
  targetCompanies: json().default([]), // Lista de empresas específicas si visibility = "specific_companies"
  modules: json().default([]), // Estructura de módulos y lecciones
});

// ===== INSCRIPCIONES A CURSOS (unificado) =====
export const enrollCourseTable = pgTable(
  "enroll_course",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companiesTable.id), // para tracking
    completedChapters: json().default({}),
    progress: integer().notNull().default(0), // porcentaje de progreso
    isCompleted: boolean().notNull().default(false),
    completedAt: timestamp(),
    enrolledAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    cid: varchar({ length: 255 }),
    userEmail: varchar({ length: 255 }),
  },
  (table) => ({
    userCourseIdx: uniqueIndex("user_course_idx").on(table.userId, table.courseId),
  })
);

// ===== CERTIFICADOS =====
export const certificatesTable = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    certificateId: varchar({ length: 255 }).notNull().unique(), // ID único del certificado
    courseId: uuid("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companiesTable.id), // para tracking
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    grade: integer().notNull(), // Calificación obtenida (0-100)
    issuedDate: timestamp().notNull().defaultNow(),
    completedDate: timestamp().notNull(),
    duration: varchar({ length: 100 }), // Duración del curso
    certificateUrl: text(), // URL del certificado PDF
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    userCertificateIdx: index("user_certificate_idx").on(
      table.userId,
      table.courseId
    ),
    certificateIdIdx: index("certificate_id_idx").on(table.certificateId),
  })
);

// ===== SUBSCRIPCIONES =====
export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar({ length: 255 }).notNull(),
    stripeSubscriptionId: varchar({ length: 255 }),
    stripePriceId: varchar({ length: 255 }),
    status: varchar({ length: 50 }).notNull().default(SubscriptionStatus.INACTIVE), // active, inactive, cancelled, past_due, trialing
    planName: varchar({ length: 100 }).notNull(), // free, starter, pro
    currentPeriodStart: timestamp(),
    currentPeriodEnd: timestamp(),
    cancelAtPeriodEnd: boolean().notNull().default(false),
    trialEnd: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    companySubscriptionIdx: index("company_subscription_idx").on(
      table.companyId
    ),
    stripeCustomerIdx: index("stripe_customer_idx").on(table.stripeCustomerId),
    stripeSubscriptionIdx: index("stripe_subscription_idx").on(
      table.stripeSubscriptionId
    ),
  })
);

// ===== FACTURAS =====


// ===== CONFIGURACIONES DEL SISTEMA =====
export const settingsTable = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar({ length: 100 }).notNull().unique(), // Clave única de la configuración
  value: text(), // Valor de la configuración (puede ser JSON para valores complejos)
  category: varchar({ length: 50 }).notNull(), // general, security, email, database
  description: text(), // Descripción de la configuración
  isEncrypted: boolean().notNull().default(false), // Si el valor está encriptado (para passwords)
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});





// ===== RELACIONES =====
export const usersRelations = relations(usersTable, ({ many }) => ({
  userCompanies: many(userCompaniesTable, { relationName: "userMember" }),
  createdCourses: many(coursesTable, { relationName: "courseCreator" }),
  enrolledCourses: many(enrollCourseTable),
  certificates: many(certificatesTable),
  sentInvitations: many(invitationTokensTable, { relationName: "inviter" }),
  invitedUserCompanies: many(userCompaniesTable, { relationName: "userCompanyInviter" }),
}));

export const companiesRelations = relations(
  companiesTable,
  ({ many, one }) => ({
    userCompanies: many(userCompaniesTable),
    courses: many(coursesTable),
    certificates: many(certificatesTable),
    invitationTokens: many(invitationTokensTable),
    subscription: one(subscriptionsTable),
  })
);

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  userCompanies: many(userCompaniesTable),
  invitationTokens: many(invitationTokensTable),
}));

export const userCompaniesRelations = relations(
  userCompaniesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userCompaniesTable.userId],
      references: [usersTable.id],
      relationName: "userMember",
    }),
    company: one(companiesTable, {
      fields: [userCompaniesTable.companyId],
      references: [companiesTable.id],
    }),
    role: one(rolesTable, {
      fields: [userCompaniesTable.roleId],
      references: [rolesTable.id],
    }),
    invitedByUser: one(usersTable, {
      fields: [userCompaniesTable.invitedBy],
      references: [usersTable.id],
      relationName: "userCompanyInviter",
    }),
  })
);

export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [coursesTable.createdBy],
    references: [usersTable.id],
    relationName: "courseCreator",
  }),
  company: one(companiesTable, {
    fields: [coursesTable.companyId],
    references: [companiesTable.id],
  }),
  enrollments: many(enrollCourseTable),
  certificates: many(certificatesTable),
}));

export const enrollCourseRelations = relations(
  enrollCourseTable,
  ({ one }) => ({
    course: one(coursesTable, {
      fields: [enrollCourseTable.courseId],
      references: [coursesTable.id],
    }),
    user: one(usersTable, {
      fields: [enrollCourseTable.userId],
      references: [usersTable.id],
    }),
    company: one(companiesTable, {
      fields: [enrollCourseTable.companyId],
      references: [companiesTable.id],
    }),
  })
);

export const certificatesRelations = relations(
  certificatesTable,
  ({ one }) => ({
    course: one(coursesTable, {
      fields: [certificatesTable.courseId],
      references: [coursesTable.id],
    }),
    user: one(usersTable, {
      fields: [certificatesTable.userId],
      references: [usersTable.id],
    }),
    company: one(companiesTable, {
      fields: [certificatesTable.companyId],
      references: [companiesTable.id],
    }),
  })
);

export const invitationTokensRelations = relations(
  invitationTokensTable,
  ({ one }) => ({
    company: one(companiesTable, {
      fields: [invitationTokensTable.companyId],
      references: [companiesTable.id],
    }),
    role: one(rolesTable, {
      fields: [invitationTokensTable.roleId],
      references: [rolesTable.id],
    }),
    invitedBy: one(usersTable, {
      fields: [invitationTokensTable.invitedBy],
      references: [usersTable.id],
      relationName: "inviter",
    }),
  })
);

export const subscriptionsRelations = relations(
  subscriptionsTable,
  ({ one }) => ({
    company: one(companiesTable, {
      fields: [subscriptionsTable.companyId],
      references: [companiesTable.id],
    }),
  })
);








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
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== ENUMERACIONES =====
export const roleEnum = pgTable("role_enum", {
  value: varchar("value", { length: 20 }).primaryKey(),
});

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
});

// ===== EMPRESAS/COMPAÑÍAS =====
export const companiesTable = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  rut: varchar({ length: 20 }).notNull().unique(), // RUT chileno
  description: text(),
  logo: text(),
  website: varchar({ length: 255 }),
  industry: varchar({ length: 255 }),
  size: varchar({ length: 50 }), // small, medium, large
  isActive: boolean().notNull().default(true),
  subscriptionPlan: varchar({ length: 50 }).default("free"), // free, basic, premium
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
  level: varchar({ length: 50 }).default("Básico").notNull(), // Básico, Intermedio, Avanzado
  status: varchar({ length: 50 }).default("Borrador").notNull(), // Borrador, Publicado, Archivado
  estimatedDuration: varchar({ length: 100 }), // Duración estimada en formato libre
  visibility: varchar({ length: 50 }).default("Público").notNull(), // Público, Privado, Empresas específicas
  targetCompanies: json().default([]), // Lista de empresas específicas si visibility = "Empresas específicas"
  modules: json().default([]), // Estructura de módulos y lecciones
});

// ===== INSCRIPCIONES A CURSOS (unificado) =====
export const enrollCourseTable = pgTable(
  "enrollCourse",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("courseId")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    companyId: uuid("companyId").references(() => companiesTable.id), // para tracking
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
    userCourseIdx: index("user_course_idx").on(table.userId, table.courseId),
  })
);

// ===== RELACIONES =====
export const usersRelations = relations(usersTable, ({ many }) => ({
  userCompanies: many(userCompaniesTable),
  createdCourses: many(coursesTable, { relationName: "courseCreator" }),
  enrolledCourses: many(enrollCourseTable),
  sentInvitations: many(invitationTokensTable, { relationName: "inviter" }),
}));

export const companiesRelations = relations(companiesTable, ({ many }) => ({
  userCompanies: many(userCompaniesTable),
  courses: many(coursesTable),
  invitationTokens: many(invitationTokensTable),
}));

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
      relationName: "invitedBy",
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

// ===== ALIASES PARA COMPATIBILIDAD =====
// Exportar con nombres alternativos para mantener compatibilidad con el schema de drizzle
export const users = usersTable;
export const companies = companiesTable;
export const courses = coursesTable;
export const enrollCourse = enrollCourseTable;
export const invitationTokens = invitationTokensTable;
export const roles = rolesTable;
export const userCompanies = userCompaniesTable;

import { relations } from "drizzle-orm/relations";
import {
  usersTable,
  companiesTable,
  coursesTable,
  enrollCourseTable,
  invitationTokensTable,
  rolesTable,
  userCompaniesTable,
} from "../config/schema";

// Las relaciones ya están definidas en config/schema.ts
// Este archivo se mantiene por compatibilidad pero las relaciones principales están en config/schema.ts

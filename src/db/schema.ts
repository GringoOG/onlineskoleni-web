import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// 1. Tabulka UŽIVATELŮ (Studentů)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(), // Celé jméno studenta (půjde na certifikát)
  companyName: text("company_name"), // Nepovinné: Pro jakou firmu školení dělá
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Tabulka KURZŮ
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(), // Např. "BOZP pro řadové zaměstnance"
  slug: text("slug").notNull().unique(), // Např. "bozp-zamestnanci"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Propojení: Kdo má jaký kurz a v jakém je stavu
export const userCourses = pgTable("user_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(), // Dokončil celou teorii i test?
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// 4. Pokusy v testech / kvízech
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  score: integer("score").notNull(), // Kolik otázek zodpověděl správně
  totalQuestions: integer("total_questions").notNull(), // Celkový počet otázek (např. 10)
  isPassed: boolean("is_passed").notNull(), // Splnil limit? (např. 80 %+)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. VYGENEROVANÉ CERTIFIKÁTY
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  certificateCode: text("certificate_code").notNull().unique(), // Unikátní číslo (např. BOZP-2026-0001)
  pdfUrl: text("pdf_url").notNull(), // Odkaz na stažení PDF ze Supabase Storage
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // BOZP má platnost většinu 1 nebo 2 roky
});

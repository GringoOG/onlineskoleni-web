import { and, eq } from "drizzle-orm";
import { db, userCourses } from "@/db";
import { ensureLmsCourse } from "@/lib/lms/ensure-lms-course";
import type { StudentRecord } from "@/lib/lms/find-or-create-student";
import {
  expandOrderItemsForEnrollment,
  type OrderItemForEnrollment,
} from "@/lib/order-catalog";

export type { OrderItemForEnrollment };

export interface EnrollmentResult {
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseName: string;
  seatsPurchased: number;
  isNewEnrollment: boolean;
  isNewUser: boolean;
  temporaryPassword?: string;
  studentEmail: string;
  studentName: string;
}

/** Přiřadí kurzy existujícímu nebo nově vytvořenému studentovi. */
export async function enrollStudentForOrderItems(input: {
  student: StudentRecord;
  orderNumber: string;
  items: OrderItemForEnrollment[];
}): Promise<EnrollmentResult[]> {
  const results: EnrollmentResult[] = [];
  const items = expandOrderItemsForEnrollment(input.items);

  for (const item of items) {
    const course = await ensureLmsCourse(item.courseSlug);

    const [existingEnrollment] = await db
      .select({ id: userCourses.id })
      .from(userCourses)
      .where(
        and(
          eq(userCourses.userId, input.student.id),
          eq(userCourses.courseId, course.id)
        )
      )
      .limit(1);

    let isNewEnrollment = false;

    if (!existingEnrollment) {
      await db.insert(userCourses).values({
        userId: input.student.id,
        courseId: course.id,
        isCompleted: false,
        orderNumber: input.orderNumber,
        seatsPurchased: item.quantity,
      });
      isNewEnrollment = true;
    } else {
      await db
        .update(userCourses)
        .set({
          orderNumber: input.orderNumber,
          seatsPurchased: item.quantity,
        })
        .where(eq(userCourses.id, existingEnrollment.id));
    }

    results.push({
      userId: input.student.id,
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      courseName: item.name,
      seatsPurchased: item.quantity,
      isNewEnrollment,
      isNewUser: input.student.isNew,
      temporaryPassword: input.student.temporaryPassword,
      studentEmail: input.student.email,
      studentName: input.student.name,
    });
  }

  return results;
}

export async function enrollContactForOrderItems(input: {
  email: string;
  name: string;
  companyName: string;
  orderNumber: string;
  items: OrderItemForEnrollment[];
}): Promise<EnrollmentResult[]> {
  const { findOrCreateStudent } = await import("@/lib/lms/find-or-create-student");
  const student = await findOrCreateStudent({
    email: input.email,
    name: input.name,
    companyName: input.companyName,
  });

  return enrollStudentForOrderItems({
    student,
    orderNumber: input.orderNumber,
    items: input.items,
  });
}

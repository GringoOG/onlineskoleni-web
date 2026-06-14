import { NextResponse } from "next/server";
import {
  getAdminSession,
  isAdminAuthenticated,
  requireAdminSession,
} from "@/lib/admin/auth";
import { canAccessGenerator, canAccessOrders } from "@/lib/admin/roles";

export async function requireOrdersApiAccess(): Promise<NextResponse | null> {
  try {
    const session = await requireAdminSession();
    if (!canAccessOrders(session.role)) {
      return NextResponse.json({ error: "Přístup odepřen." }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Nejste přihlášeni do administrace." }, { status: 401 });
  }
}

export async function requireGeneratorApiAccess(): Promise<NextResponse | null> {
  try {
    const session = await requireAdminSession();
    if (!canAccessGenerator(session.role)) {
      return NextResponse.json({ error: "Přístup odepřen." }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Nejste přihlášeni do administrace." }, { status: 401 });
  }
}

export async function isAuthorizedGeneratorJob(request: Request): Promise<boolean> {
  if (await isAdminAuthenticated()) {
    const session = await getAdminSession();
    return session ? canAccessGenerator(session.role) : false;
  }

  const { isAuthorizedAdminOrInternalJob } = await import("@/lib/admin/verify-internal-job");
  return isAuthorizedAdminOrInternalJob(request);
}

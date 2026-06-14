import { isAdminAuthenticated } from "@/lib/admin/auth";
import { verifyCronRequest } from "@/lib/cron/verify-cron-request";

function verifyInternalBearer(request: Request): boolean {
  if (verifyCronRequest(request)) {
    return true;
  }

  const adminSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!adminSecret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${adminSecret}`;
}

/** Admin cookie nebo interní Bearer token pro background joby. */
export async function isAuthorizedAdminOrInternalJob(
  request: Request
): Promise<boolean> {
  if (await isAdminAuthenticated()) {
    return true;
  }

  return verifyInternalBearer(request);
}

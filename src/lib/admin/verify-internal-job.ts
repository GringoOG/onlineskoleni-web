import { isAdminAuthenticated } from "@/lib/admin/auth";
import { verifyCronRequest } from "@/lib/cron/verify-cron-request";

function verifyInternalBearer(request: Request): boolean {
  if (verifyCronRequest(request)) {
    return true;
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return false;
  }

  const token = auth.slice("Bearer ".length);
  const secrets = [
    process.env.ADMIN_SESSION_SECRET?.trim(),
    process.env.ADMIN_PASSWORD?.trim(),
    process.env.ADMIN_IMAGE_PASSWORD?.trim(),
    process.env.ADMIN_ORDERS_PASSWORD?.trim(),
  ].filter(Boolean);

  return secrets.some((secret) => secret === token);
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

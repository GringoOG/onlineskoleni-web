import Link from "next/link";
import { logoutAdmin } from "@/app/admin/login/actions";
import { canAccessGenerator, canAccessOrders } from "@/lib/admin/roles";

type AdminSection = "hub" | "orders" | "generator";

interface AdminNavProps {
  current: AdminSection;
  canOrders: boolean;
  canGenerator: boolean;
}

export function AdminNav({ current, canOrders, canGenerator }: AdminNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/80">
      {current !== "hub" ? (
        <Link href="/admin" className="hover:text-white">
          ← Administrace
        </Link>
      ) : null}
      {canOrders ? (
        current !== "orders" ? (
          <Link href="/admin/objednavky/nova" className="hover:text-white">
            Manuální objednávky
          </Link>
        ) : (
          <span className="text-white">Manuální objednávky</span>
        )
      ) : null}
      {canGenerator ? (
        current !== "generator" ? (
          <Link href="/admin/generator" className="hover:text-white">
            Generátor ilustrací
          </Link>
        ) : (
          <span className="text-white">Generátor ilustrací</span>
        )
      ) : null}
      <Link href="/" className="hover:text-white">
        Web
      </Link>
      <form action={logoutAdmin}>
        <button type="submit" className="hover:text-white">
          Odhlásit se
        </button>
      </form>
    </div>
  );
}

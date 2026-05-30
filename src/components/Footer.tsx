import Link from "next/link";
import Image from "next/image";
import { pages, site } from "@/lib/content";

const footerNav = [
  { href: "/#o-nas", label: "O nás" },
  { href: "/skoleni", label: "Školení" },
  { href: "/sluzby", label: "Služby" },
  { href: "/cenik", label: "Ceník" },
  { href: "/objednavka", label: "Objednat" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/ochrana-udaju", label: "Ochrana údajů" },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-dark/30 bg-surface-dark text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.svg"
                alt=""
                width={36}
                height={40}
                aria-hidden
              />
              <p className="text-lg font-bold text-white">{site.name}</p>
            </div>
            <p className="mt-3 text-sm">{site.company}</p>
            <p className="mt-1 text-sm">
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city}
            </p>
            <p className="mt-1 text-sm">IČO: {site.ico}</p>
          </div>

          <div>
            <h3 className="font-semibold text-brand-light">Kontakt</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-light">Mapa webu</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-brand-light">Odkazy</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {pages.relatedLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} {site.company} · {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

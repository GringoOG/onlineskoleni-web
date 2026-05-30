import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";

interface LogoProps {
  showText?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ showText = true, size = 40, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/logo.svg"
        alt={`${site.name} – logo`}
        width={size}
        height={Math.round(size * 1.1)}
        priority
        className="h-auto w-auto shrink-0"
        style={{ width: size, height: "auto" }}
      />
      {showText && (
        <span className="text-lg font-bold text-white">{site.name}</span>
      )}
    </Link>
  );
}

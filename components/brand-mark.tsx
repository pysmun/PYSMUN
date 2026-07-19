import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";

export function BrandMark({ inverted = false, variant = "compact", onClick }: { inverted?: boolean; variant?: "compact" | "mark"; onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  if (variant === "mark") {
    return (
      <Link className="brand-mark brand-mark--standalone" href="/" aria-label="PYSMUN home" data-inverted={inverted || undefined} onClick={onClick}>
        <Image src="/brand/pysmun-mark-gold.png" alt="" width={840} height={840} sizes="(max-width: 720px) 4.5rem, 5.5rem" />
        <strong>PYSMUN</strong>
      </Link>
    );
  }

  return (
    <Link className="brand-mark" href="/" aria-label="PYSMUN home" data-inverted={inverted || undefined} onClick={onClick}>
      <span className="brand-mark__seal" aria-hidden="true">
        <Image src="/brand/pysmun-mark-gold.png" alt="" width={840} height={840} sizes="3rem" />
      </span>
      <span className="brand-mark__copy">
        <strong>PYSMUN</strong>
        <small>Pakistan Youth Summit</small>
      </span>
    </Link>
  );
}

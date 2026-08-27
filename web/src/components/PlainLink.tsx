import type { AnchorHTMLAttributes } from "react";


interface PlainLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: boolean;
}


export default function PlainLink({ prefetch, ...props }: PlainLinkProps) {
  return <a {...props} data-prefetch={prefetch || undefined} />;
}

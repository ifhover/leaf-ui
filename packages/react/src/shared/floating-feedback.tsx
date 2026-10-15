import { Inbox, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

/** Shared loading and empty presentation for suggestion and selection panels. */
export function FloatingFeedback({
  loading = false,
  children,
}: {
  loading?: boolean;
  children: ReactNode;
}) {
  const Icon = loading ? LoaderCircle : Inbox;
  return (
    <div className="leaf-floating__empty leaf-floating__empty--feedback" role="status">
      <Icon
        size={24}
        strokeWidth={1.5}
        aria-hidden="true"
        className={loading ? 'leaf-floating__loading-icon' : undefined}
      />
      <div>{children}</div>
    </div>
  );
}

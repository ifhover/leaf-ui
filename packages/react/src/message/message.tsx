import { X } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackIcon, type FeedbackType } from '../alert/alert';
import { useLeafConfig } from '../config-provider/config-provider';
import { inertAttribute } from '../shared/inert';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';

export interface MessageOptions {
  key?: string;
  content: ReactNode;
  type?: FeedbackType | 'loading';
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}
export interface MessageApi {
  open: (options: MessageOptions) => string;
  success: (content: ReactNode, duration?: number) => string;
  info: (content: ReactNode, duration?: number) => string;
  warning: (content: ReactNode, duration?: number) => string;
  error: (content: ReactNode, duration?: number) => string;
  loading: (content: ReactNode) => string;
  close: (key?: string) => void;
}
interface Entry extends MessageOptions {
  key: string;
  open: boolean;
  revision: number;
}
export interface MessageProps extends Omit<MessageOptions, 'key'> {
  open: boolean;
  afterClose?: () => void;
}
export function Message({ open, afterClose, onClose, ...options }: MessageProps) {
  return (
    <ScopedPortal>
      <div className="leaf-message-region">
        <MessageItem
          entry={{ ...options, key: 'single', open, revision: 0 }}
          close={() => onClose?.()}
          remove={() => afterClose?.()}
        />
      </div>
    </ScopedPortal>
  );
}
function MessageItem({
  entry,
  close,
  remove,
}: {
  entry: Entry;
  close: () => void;
  remove: () => void;
}) {
  const { messages } = useLeafConfig();
  const ref = useRef<HTMLDivElement>(null);
  const present = usePresence(entry.open, ref);
  const [hover, setHover] = useState(false);
  const duration = entry.duration ?? (entry.type === 'loading' ? 0 : 3);
  const remaining = useRef(duration * 1000);
  const lastRevision = useRef(entry.revision);
  const previousCycle = useRef({ open: entry.open, duration });
  useEffect(() => {
    if (
      lastRevision.current !== entry.revision ||
      (!previousCycle.current.open && entry.open) ||
      previousCycle.current.duration !== duration
    ) {
      remaining.current = duration * 1000;
      lastRevision.current = entry.revision;
    }
    previousCycle.current = { open: entry.open, duration };
    if (!entry.open || hover || duration <= 0) return;
    const started = Date.now();
    const timer = setTimeout(close, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [entry.open, duration, hover, close, entry.revision]);
  const wasPresent = useRef(present);
  useEffect(() => {
    if (wasPresent.current && !present) remove();
    wasPresent.current = present;
  }, [present, remove]);
  if (!present) return null;
  const type = entry.type ?? 'info';
  return (
    <div
      ref={ref}
      className="leaf-message-slot"
      data-state={entry.open ? 'open' : 'closing'}
      aria-hidden={!entry.open || undefined}
      inert={inertAttribute(!entry.open)}
    >
      <div className="leaf-message-slot__content">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: These events pause dismissal; the message must retain its live-region role. */}
        <div
          className={`leaf-message leaf-message--${type}`}
          data-state={entry.open ? 'open' : 'closing'}
          role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHover(false);
          }}
        >
          <FeedbackIcon type={type} />
          <span>{entry.content}</span>
          {entry.closable && (
            <button type="button" aria-label={messages.close} onClick={close}>
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
/** Place contextHolder in the scope whose language and theme the messages should use. */
export function useMessage(): { message: MessageApi; contextHolder: ReactNode } {
  const [entries, setEntries] = useState<Entry[]>([]);
  const current = useRef(entries);
  current.current = entries;
  const sequence = useRef(0);
  const close = useCallback((key?: string) => {
    const closing = current.current.filter((entry) => entry.open && (!key || entry.key === key));
    current.current = current.current.map((entry) =>
      closing.includes(entry) ? { ...entry, open: false } : entry,
    );
    setEntries(current.current);
    closing.forEach((entry) => {
      entry.onClose?.();
    });
  }, []);
  const open = useCallback((options: MessageOptions) => {
    const key = options.key ?? `leaf-message-${++sequence.current}`;
    const existing = current.current.find((entry) => entry.key === key);
    const entry = { ...options, key, open: true, revision: (existing?.revision ?? 0) + 1 };
    const next = existing
      ? current.current.map((item) => (item.key === key ? entry : item))
      : [...current.current, entry];
    current.current = next;
    setEntries(next);
    return key;
  }, []);
  const message = useMemo<MessageApi>(
    () => ({
      open,
      close,
      success: (content, duration) => open({ content, duration, type: 'success' }),
      info: (content, duration) => open({ content, duration, type: 'info' }),
      warning: (content, duration) => open({ content, duration, type: 'warning' }),
      error: (content, duration) => open({ content, duration, type: 'error' }),
      loading: (content) => open({ content, duration: 0, type: 'loading' }),
    }),
    [open, close],
  );
  const contextHolder = (
    <ScopedPortal>
      <div className="leaf-message-region">
        {entries.map((entry) => (
          <MessageItem
            key={entry.key}
            entry={entry}
            close={() => close(entry.key)}
            remove={() => {
              const next = current.current.filter((item) => item.key !== entry.key || item.open);
              current.current = next;
              setEntries(next);
            }}
          />
        ))}
      </div>
    </ScopedPortal>
  );
  return { message, contextHolder };
}

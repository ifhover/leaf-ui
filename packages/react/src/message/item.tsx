import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackIcon } from '../alert/alert';
import { ConfigContext, useLeafConfig } from '../config-provider/context';
import { inertProps } from '../shared/inert';
import { usePresence } from '../shared/presence';
import { leafThemeVariables } from '../theme';
import type { MessageEntry } from './store';

export function MessageItem({
  entry,
  close,
  remove,
}: {
  entry: MessageEntry;
  close: () => void;
  remove: () => void;
}) {
  const inherited = useLeafConfig();
  const config = entry.config ?? inherited;
  const { messages } = config;
  const variables = useMemo(
    () => (entry.config ? leafThemeVariables(config.theme) : undefined),
    [entry.config, config.theme],
  );
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
    <ConfigContext.Provider value={config}>
      <div
        ref={ref}
        className="leaf-message-slot"
        lang={entry.config?.locale}
        data-leaf-theme={entry.config?.theme.appearance}
        style={variables}
        data-state={entry.open ? 'open' : 'closing'}
        aria-hidden={!entry.open || undefined}
        {...inertProps(!entry.open)}
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
    </ConfigContext.Provider>
  );
}

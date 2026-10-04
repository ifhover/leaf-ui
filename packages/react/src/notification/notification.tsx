import { X } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { FeedbackIcon, type FeedbackType } from '../alert/alert';
import { ConfigContext, type LeafConfig, useLeafConfig } from '../config-provider/context';
import { inertAttribute } from '../shared/inert';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import { leafThemeVariables } from '../theme';
export interface NotificationOptions {
  key?: string;
  title: ReactNode;
  description?: ReactNode;
  type?: FeedbackType;
  icon?: ReactNode;
  actions?: ReactNode;
  duration?: number;
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  closable?: boolean;
  onClose?: () => void;
}
export interface NotificationApi {
  open: (options: NotificationOptions) => string;
  success: (options: Omit<NotificationOptions, 'type'>) => string;
  info: (options: Omit<NotificationOptions, 'type'>) => string;
  warning: (options: Omit<NotificationOptions, 'type'>) => string;
  error: (options: Omit<NotificationOptions, 'type'>) => string;
  close: (key?: string) => void;
}
export interface NotificationProps extends Omit<NotificationOptions, 'key'> {
  open: boolean;
  afterClose?: () => void;
}
interface Entry extends NotificationOptions {
  key: string;
  open: boolean;
  revision: number;
  scope?: string;
  config?: LeafConfig;
}
const empty: readonly Entry[] = [];
function createStore(maxCount: number) {
  let entries = empty;
  let sequence = 0;
  const listeners = new Set<() => void>();
  const publish = (next: readonly Entry[]) => {
    entries = next;
    for (const listener of listeners) listener();
  };
  const close = (key?: string) => {
    const closing = entries.filter((item) => item.open && (key === undefined || item.key === key));
    if (!closing.length) return;
    publish(entries.map((item) => (closing.includes(item) ? { ...item, open: false } : item)));
    for (const item of closing) item.onClose?.();
  };
  return {
    getSnapshot: () => entries,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) entries = empty;
      };
    },
    close,
    remove: (key: string) => publish(entries.filter((item) => item.key !== key || item.open)),
    update: (scope: string, config: LeafConfig) => {
      if (entries.some((item) => item.scope === scope && item.config !== config))
        publish(entries.map((item) => (item.scope === scope ? { ...item, config } : item)));
    },
    api: (scope: string, getConfig: () => LeafConfig): NotificationApi => {
      const open = (options: NotificationOptions) => {
        const key = options.key ?? `leaf-notification-${++sequence}`;
        const existing = entries.find((item) => item.key === key);
        const entry: Entry = {
          ...options,
          key,
          scope,
          config: getConfig(),
          open: true,
          revision: (existing?.revision ?? 0) + 1,
        };
        publish(
          existing ? entries.map((item) => (item.key === key ? entry : item)) : [...entries, entry],
        );
        const active = entries.filter((item) => item.open);
        if (active.length > Math.max(1, maxCount))
          for (const item of active.slice(0, active.length - Math.max(1, maxCount)))
            close(item.key);
        return key;
      };
      return {
        open,
        close,
        success: (options) => open({ ...options, type: 'success' }),
        info: (options) => open({ ...options, type: 'info' }),
        warning: (options) => open({ ...options, type: 'warning' }),
        error: (options) => open({ ...options, type: 'error' }),
      };
    },
  };
}
const Context = createContext<ReturnType<typeof createStore> | null>(null);
export interface NotificationProviderProps {
  children?: ReactNode;
  maxCount?: number;
}
export function NotificationProvider({ children, maxCount = 5 }: NotificationProviderProps) {
  const [store] = useState(() => createStore(maxCount));
  return (
    <Context.Provider value={store}>
      <NotificationHost store={store} />
      {children}
    </Context.Provider>
  );
}
export function NotificationScope({ children }: { children?: ReactNode }) {
  return useContext(Context) ? children : <NotificationProvider>{children}</NotificationProvider>;
}
export function useNotification(): NotificationApi {
  const store = useContext(Context);
  const config = useLeafConfig();
  const latest = useRef(config);
  latest.current = config;
  const scope = useId();
  useEffect(() => store?.update(scope, config), [store, scope, config]);
  const api = useMemo(() => store?.api(scope, () => latest.current), [store, scope]);
  if (!api) throw new Error('useNotification requires ConfigProvider or NotificationProvider.');
  return api;
}
function NotificationHost({ store }: { store: ReturnType<typeof createStore> }) {
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, () => empty);
  if (!entries.length) return null;
  return (
    <ScopedPortal>
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((placement) => (
        <div
          key={placement}
          className={`leaf-notification-region leaf-notification-region--${placement}`}
        >
          {entries
            .filter((entry) => (entry.placement ?? 'top-right') === placement)
            .map((entry) => (
              <NotificationItem
                key={entry.key}
                entry={entry}
                close={() => store.close(entry.key)}
                remove={() => store.remove(entry.key)}
              />
            ))}
        </div>
      ))}
    </ScopedPortal>
  );
}
export function Notification({ open, afterClose, onClose, ...options }: NotificationProps) {
  return (
    <ScopedPortal>
      <div
        className={`leaf-notification-region leaf-notification-region--${options.placement ?? 'top-right'}`}
      >
        <NotificationItem
          entry={{ ...options, key: 'single', open, revision: 0 }}
          close={() => onClose?.()}
          remove={() => afterClose?.()}
        />
      </div>
    </ScopedPortal>
  );
}
function NotificationItem({
  entry,
  close,
  remove,
}: {
  entry: Entry;
  close: () => void;
  remove: () => void;
}) {
  const inherited = useLeafConfig();
  const config = entry.config ?? inherited;
  const ref = useRef<HTMLDivElement>(null);
  const present = usePresence(entry.open, ref);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const duration = entry.duration ?? 4.5;
  const remaining = useRef(duration * 1000);
  const cycle = useRef({ open: entry.open, revision: entry.revision, duration });
  useEffect(() => {
    if (
      cycle.current.revision !== entry.revision ||
      cycle.current.duration !== duration ||
      (entry.open && !cycle.current.open)
    )
      remaining.current = duration * 1000;
    cycle.current = { open: entry.open, revision: entry.revision, duration };
    if (!entry.open || hover || focus || duration <= 0) return;
    const started = Date.now();
    const timer = setTimeout(close, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [entry.open, entry.revision, duration, hover, focus, close]);
  const previous = useRef(present);
  useEffect(() => {
    if (previous.current && !present) remove();
    previous.current = present;
  }, [present, remove]);
  if (!present) return null;
  const type = entry.type ?? 'info';
  return (
    <ConfigContext.Provider value={config}>
      <div
        ref={ref}
        className="leaf-notification-slot"
        data-state={entry.open ? 'open' : 'closing'}
        style={entry.config ? leafThemeVariables(config.theme) : undefined}
        inert={inertAttribute(!entry.open)}
        aria-hidden={!entry.open || undefined}
      >
        <div className="leaf-notification-slot__content">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Pause auto-dismiss while reading or interacting with the notification. */}
          <div
            className={`leaf-notification leaf-notification--${type}`}
            role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            onFocus={() => setFocus(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocus(false);
            }}
          >
            <span className="leaf-notification__icon">
              {entry.icon ?? <FeedbackIcon type={type} />}
            </span>
            <div className="leaf-notification__body">
              <div className="leaf-notification__title">{entry.title}</div>
              {entry.description && (
                <div className="leaf-notification__description">{entry.description}</div>
              )}
              {entry.actions && <div className="leaf-notification__actions">{entry.actions}</div>}
            </div>
            {entry.closable !== false && (
              <button
                type="button"
                className="leaf-notification__close"
                aria-label={config.messages.close}
                onClick={close}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </ConfigContext.Provider>
  );
}

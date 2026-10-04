import { type ReactNode, useContext, useState, useSyncExternalStore } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { ScopedPortal } from '../shared/scoped-portal';
import { MessageItem } from './item';
import { createMessageStore, emptyMessages, MessageContext, type MessageStore } from './store';

export interface MessageProviderProps {
  children?: ReactNode;
}

/** Use a separate message queue when an application has no ConfigProvider or needs isolation. */
export function MessageProvider({ children }: MessageProviderProps) {
  const [store] = useState(createMessageStore);
  return (
    <MessageContext.Provider value={store}>
      <MessageHost store={store} />
      {children}
    </MessageContext.Provider>
  );
}

/** Nested ConfigProviders keep the application queue and supply per-message settings. */
export function MessageScope({ children }: MessageProviderProps) {
  const store = useContext(MessageContext);
  return store ? children : <MessageProvider>{children}</MessageProvider>;
}

export function MessageHost({ store }: { store: MessageStore }) {
  const config = useLeafConfig();
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, () => emptyMessages);
  if (!entries.length) return null;
  const zIndex = Math.max(
    ...entries.map(
      (entry) =>
        entry.config?.theme.tokens?.messageZIndex ?? config.theme.tokens?.messageZIndex ?? 1200,
    ),
  );
  return (
    <ScopedPortal>
      <div className="leaf-message-region" style={{ zIndex }}>
        {entries.map((entry) => (
          <MessageItem
            key={entry.key}
            entry={entry}
            close={() => store.close(entry.key)}
            remove={() => store.remove(entry.key)}
          />
        ))}
      </div>
    </ScopedPortal>
  );
}

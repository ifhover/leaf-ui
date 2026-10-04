import { type ReactNode, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type { FeedbackType } from '../alert/alert';
import { useLeafConfig } from '../config-provider/context';
import { ScopedPortal } from '../shared/scoped-portal';
import { MessageItem } from './item';
import { MessageHost } from './provider';
import { createMessageStore, MessageContext } from './store';

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
/** ConfigProvider and MessageProvider render the queue once; no per-consumer holder is needed. */
export function useMessage(): { message: MessageApi; contextHolder: ReactNode } {
  const shared = useContext(MessageContext);
  const local = useRef<ReturnType<typeof createMessageStore> | null>(null);
  if (!shared && !local.current) local.current = createMessageStore();
  const store = shared ?? local.current;
  if (!store) throw new Error('Message queue is unavailable.');
  const config = useLeafConfig();
  const currentConfig = useRef(config);
  currentConfig.current = config;
  const scope = useId();
  const message = useMemo(
    () => store.api(shared ? scope : undefined, shared ? () => currentConfig.current : undefined),
    [store, shared, scope],
  );
  useEffect(() => {
    if (shared) store.updateScope(scope, config);
  }, [store, shared, scope, config]);
  return useMemo(
    () => ({ message, contextHolder: shared ? null : <MessageHost store={store} /> }),
    [message, shared, store],
  );
}

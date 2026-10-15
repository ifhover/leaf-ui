import { type ReactNode, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type { FeedbackType } from '../alert/alert';
import { ComponentDefaultsContext, useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { ScopedPortal } from '../shared/scoped-portal';
import { MessageItem } from './item';
import { MessageContext } from './store';

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
export function Message(rawProps: MessageProps) {
  const { open, afterClose, onClose, ...options } = useComponentProps('Message', rawProps);
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
/** Entry providers render one queue; consumers receive the scoped message API. */
export function useMessage(): { message: MessageApi } {
  const store = useContext(MessageContext);
  const config = useLeafConfig();
  const components = useContext(ComponentDefaultsContext);
  const currentComponents = useRef(components);
  currentComponents.current = components;
  const currentConfig = useRef(config);
  currentConfig.current = config;
  const scope = useId();
  const message = useMemo(
    () =>
      store?.api(
        scope,
        () => currentConfig.current,
        () => currentComponents.current,
      ),
    [store, scope],
  );
  useEffect(() => {
    store?.updateScope(scope, config, components);
  }, [store, scope, config, components]);
  const result = useMemo(() => (message ? { message } : undefined), [message]);
  if (!result) throw new Error('useMessage requires ConfigProvider or MessageProvider.');
  return result;
}

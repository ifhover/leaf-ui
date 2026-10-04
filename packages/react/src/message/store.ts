import { createContext } from 'react';
import type { LeafConfig } from '../config-provider/context';
import type { MessageApi, MessageOptions } from './message';

export interface MessageEntry extends MessageOptions {
  key: string;
  open: boolean;
  revision: number;
  scope?: string;
  config?: LeafConfig;
}
export const emptyMessages: readonly MessageEntry[] = [];

/** One queue per mounted provider, never shared between SSR requests or React roots. */
export function createMessageStore() {
  let entries = emptyMessages;
  let sequence = 0;
  let available = true;
  const listeners = new Set<() => void>();
  const publish = (next: readonly MessageEntry[]) => {
    entries = next;
    for (const listener of listeners) listener();
  };
  const open = (options: MessageOptions, scope?: string, config?: LeafConfig) => {
    const key = options.key ?? `leaf-message-${++sequence}`;
    if (!available) return key;
    const existing = entries.find((entry) => entry.key === key);
    const entry: MessageEntry = {
      ...options,
      key,
      scope,
      config,
      open: true,
      revision: (existing?.revision ?? 0) + 1,
    };
    publish(
      existing ? entries.map((item) => (item.key === key ? entry : item)) : [...entries, entry],
    );
    return key;
  };
  const close = (key?: string) => {
    const closing = entries.filter(
      (entry) => entry.open && (key === undefined || entry.key === key),
    );
    if (!closing.length) return;
    publish(entries.map((entry) => (closing.includes(entry) ? { ...entry, open: false } : entry)));
    for (const entry of closing) entry.onClose?.();
  };
  return {
    getSnapshot: () => entries,
    subscribe: (listener: () => void) => {
      available = true;
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          available = false;
          entries = emptyMessages;
        }
      };
    },
    close,
    remove: (key: string) => {
      publish(entries.filter((entry) => entry.key !== key || entry.open));
    },
    updateScope: (scope: string, config: LeafConfig) => {
      if (!entries.some((entry) => entry.scope === scope && entry.config !== config)) return;
      publish(entries.map((entry) => (entry.scope === scope ? { ...entry, config } : entry)));
    },
    api: (scope?: string, getConfig?: () => LeafConfig): MessageApi => {
      const show = (options: MessageOptions) => open(options, scope, getConfig?.());
      return {
        open: show,
        close,
        success: (content, duration) => show({ content, duration, type: 'success' }),
        info: (content, duration) => show({ content, duration, type: 'info' }),
        warning: (content, duration) => show({ content, duration, type: 'warning' }),
        error: (content, duration) => show({ content, duration, type: 'error' }),
        loading: (content) => show({ content, duration: 0, type: 'loading' }),
      };
    },
  };
}
export type MessageStore = ReturnType<typeof createMessageStore>;
export const MessageContext = createContext<MessageStore | null>(null);

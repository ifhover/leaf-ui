import { createContext } from 'react';
import type { LeafConfig } from '../config-provider/context';
import type { ConfirmOptions } from './confirm';

export interface ConfirmApi {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}
interface ConfirmRequest {
  id: number;
  options: ConfirmOptions;
  scope: string;
  config: LeafConfig;
  open: boolean;
  resolve: (result: boolean) => void;
}
export const emptyConfirmations: readonly ConfirmRequest[] = [];

/** Requests belong to one provider. Only the first is shown, including its exit animation. */
export function createConfirmStore() {
  let requests = emptyConfirmations;
  let sequence = 0;
  let available = true;
  const listeners = new Set<() => void>();
  const publish = (next: readonly ConfirmRequest[]) => {
    requests = next;
    for (const listener of listeners) listener();
  };
  const close = (id: number, result: boolean) => {
    const request = requests[0];
    if (!request?.open || request.id !== id) return;
    publish(requests.map((entry) => (entry.id === id ? { ...entry, open: false } : entry)));
    request.resolve(result);
  };
  return {
    getSnapshot: () => requests,
    subscribe: (listener: () => void) => {
      available = true;
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          available = false;
          for (const request of requests) request.resolve(false);
          requests = emptyConfirmations;
        }
      };
    },
    confirm: (scope: string, config: LeafConfig, options: ConfirmOptions) => {
      if (!available) return Promise.resolve(false);
      return new Promise<boolean>((resolve) => {
        publish([...requests, { id: ++sequence, options, scope, config, open: true, resolve }]);
      });
    },
    close,
    remove: (id: number) => {
      if (requests[0]?.id === id && !requests[0].open) publish(requests.slice(1));
    },
    updateScope: (scope: string, config: LeafConfig) => {
      if (requests.some((request) => request.scope === scope && request.config !== config))
        publish(
          requests.map((request) => (request.scope === scope ? { ...request, config } : request)),
        );
    },
    cancelScope: (scope: string) => {
      const cancelled = requests.filter((request) => request.scope === scope);
      if (!cancelled.length) return;
      const current = requests[0];
      publish(
        requests
          .filter((request) => request.scope !== scope || request === current)
          .map((request) => (request.scope === scope ? { ...request, open: false } : request)),
      );
      for (const request of cancelled) request.resolve(false);
    },
  };
}
export type ConfirmStore = ReturnType<typeof createConfirmStore>;
export const ConfirmContext = createContext<ConfirmStore | null>(null);

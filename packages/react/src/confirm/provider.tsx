import {
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  ComponentDefaultsContext,
  mergeComponentProps,
} from '../config-provider/component-defaults';
import { ConfigContext, useLeafConfig } from '../config-provider/context';
import { leafThemeVariables } from '../theme';
import type { ConfirmOptions } from './confirm';
import { ConfirmDialog } from './confirm';
import {
  type ConfirmApi,
  ConfirmContext,
  type ConfirmStore,
  createConfirmStore,
  emptyConfirmations,
} from './store';

export interface ConfirmProviderProps {
  children?: ReactNode;
}
export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [store] = useState(createConfirmStore);
  return (
    <ConfirmContext.Provider value={store}>
      <ConfirmHost store={store} />
      {children}
    </ConfirmContext.Provider>
  );
}
export function ConfirmScope({ children }: ConfirmProviderProps) {
  return useContext(ConfirmContext) ? children : <ConfirmProvider>{children}</ConfirmProvider>;
}
function ConfirmHost({ store }: { store: ConfirmStore }) {
  const requests = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => emptyConfirmations,
  );
  const request = requests[0];
  if (!request) return null;
  return (
    <ConfigContext.Provider value={request.config}>
      <ComponentDefaultsContext.Provider value={request.components ?? {}}>
        <div
          className="leaf-confirm-scope"
          lang={request.config.locale}
          data-leaf-theme={request.config.theme.appearance}
          style={leafThemeVariables(request.config.theme)}
        >
          <ConfirmDialog
            key={request.id}
            {...request.options}
            open={request.open}
            onConfirm={async () => {
              await request.options.onConfirm?.();
              store.close(request.id, true);
            }}
            onClose={() => store.close(request.id, false)}
            afterClose={() => store.remove(request.id)}
          />
        </div>
      </ComponentDefaultsContext.Provider>
    </ConfigContext.Provider>
  );
}
export function useConfirm(): ConfirmApi {
  const store = useContext(ConfirmContext);
  const config = useLeafConfig();
  const components = useContext(ComponentDefaultsContext);
  const currentComponents = useRef(components);
  currentComponents.current = components;
  const currentConfig = useRef(config);
  currentConfig.current = config;
  const active = useRef(true);
  const scope = useId();
  useEffect(
    () => store?.updateScope(scope, config, components),
    [store, scope, config, components],
  );
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      store?.cancelScope(scope);
    };
  }, [store, scope]);
  const api = useMemo<ConfirmApi | undefined>(
    () =>
      store
        ? {
            confirm: (options) =>
              active.current
                ? store.confirm(
                    scope,
                    currentConfig.current,
                    mergeComponentProps<ConfirmOptions>(currentComponents.current.Confirm, options),
                    currentComponents.current,
                  )
                : Promise.resolve(false),
          }
        : undefined,
    [store, scope],
  );
  if (!api) throw new Error('useConfirm requires ConfigProvider or ConfirmProvider.');
  return api;
}

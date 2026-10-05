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
import { ConfigContext, useLeafConfig } from '../config-provider/context';
import { leafThemeVariables } from '../theme';
import { Confirm } from './confirm';
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
      <div
        className="leaf-confirm-scope"
        lang={request.config.locale}
        data-leaf-theme={request.config.theme.appearance}
        style={leafThemeVariables(request.config.theme)}
      >
        <Confirm
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
    </ConfigContext.Provider>
  );
}
export function useConfirm(): ConfirmApi {
  const store = useContext(ConfirmContext);
  const config = useLeafConfig();
  const currentConfig = useRef(config);
  currentConfig.current = config;
  const active = useRef(true);
  const scope = useId();
  useEffect(() => store?.updateScope(scope, config), [store, scope, config]);
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
                ? store.confirm(scope, currentConfig.current, options)
                : Promise.resolve(false),
          }
        : undefined,
    [store, scope],
  );
  if (!api) throw new Error('useConfirm requires ConfigProvider or ConfirmProvider.');
  return api;
}

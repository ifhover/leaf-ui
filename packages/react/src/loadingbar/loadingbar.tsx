import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ComponentDefaultsContext,
  type LeafComponentDefaults,
  mergeComponentProps,
  useComponentProps,
} from '../config-provider/component-defaults';
import { ConfigContext, type LeafConfig, useLeafConfig } from '../config-provider/context';
import { leafDensityVariables } from '../density';
import { classes } from '../shared/classes';
import { motionDuration, useMotionEnabled } from '../shared/motion';
import { ScopedPortal } from '../shared/scoped-portal';
import { useText } from '../shared/use-text';
import { leafThemeVariables } from '../theme';
export interface LoadingBarProps {
  active?: boolean;
  progress?: number;
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
  className?: string;
  style?: CSSProperties;
}
export function LoadingBarControl({
  active = false,
  progress,
  color,
  height = 3,
  position = 'top',
  className,
  style,
}: LoadingBarProps) {
  const t = useText();
  const bar = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();
  const [visible, setVisible] = useState(active);
  const normalized =
    progress === undefined
      ? undefined
      : Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
  const [amount, setAmount] = useState(active ? (normalized ?? 8) : 0);
  useEffect(() => {
    if (active) {
      setVisible(true);
      setAmount((current) => normalized ?? (current >= 100 ? 8 : Math.max(8, current)));
    } else if (visible) {
      setAmount(100);
      const duration = motion && bar.current ? motionDuration(bar.current, 1.2) : 0;
      if (!duration) {
        setVisible(false);
        setAmount(0);
        return;
      }
      const timer = setTimeout(() => {
        setVisible(false);
        setAmount(0);
      }, duration + 32);
      return () => clearTimeout(timer);
    }
  }, [active, normalized, visible, motion]);
  useEffect(() => {
    if (!active || progress !== undefined) return;
    const timer = setInterval(
      () => setAmount((current) => Math.min(94, current + Math.max(0.4, (96 - current) * 0.07))),
      350,
    );
    return () => clearInterval(timer);
  }, [active, progress]);
  if (!visible) return null;
  return (
    <ScopedPortal>
      <div
        ref={bar}
        className={classes('leaf-loading-bar', `leaf-loading-bar--${position}`, className)}
        role="progressbar"
        aria-label={t('loadingBar.pageLoadingProgress')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress === undefined && active ? undefined : amount}
        data-complete={!active || undefined}
        style={{ height, ...style }}
      >
        <span style={{ width: `${Math.max(0, Math.min(100, amount))}%`, background: color }} />
      </div>
    </ScopedPortal>
  );
}
export interface LoadingBarApi {
  start: () => () => void;
  finish: () => void;
  set: (progress: number) => void;
  reset: () => void;
}
interface LoadingBarController extends Omit<LoadingBarApi, 'start'> {
  start: (components?: LeafComponentDefaults, config?: LeafConfig) => () => void;
}
const Context = createContext<LoadingBarController | null>(null);
export interface LoadingBarProviderProps extends Omit<LoadingBarProps, 'active' | 'progress'> {
  children?: ReactNode;
}
export function LoadingBarProvider({ children, ...props }: LoadingBarProviderProps) {
  const inheritedConfig = useLeafConfig();
  const pending = useRef(new Set<symbol>());
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState<number | undefined>();
  const [taskComponents, setTaskComponents] = useState<LeafComponentDefaults>();
  const [taskConfig, setTaskConfig] = useState<LeafConfig>();
  const api = useMemo<LoadingBarController>(() => {
    const finish = (key?: symbol) => {
      const first = key ?? pending.current.values().next().value;
      if (first) pending.current.delete(first);
      if (!pending.current.size) setActive(false);
    };
    return {
      start: (components, config) => {
        // The first active task owns the shared bar's presentation until the batch completes.
        if (!pending.current.size) {
          setTaskComponents(components);
          setTaskConfig(config);
        }
        const key = Symbol();
        pending.current.add(key);
        setProgress(undefined);
        setActive(true);
        return () => finish(key);
      },
      finish: () => finish(),
      set: (value) => setProgress(Math.max(0, Math.min(100, value))),
      reset: () => {
        pending.current.clear();
        setActive(false);
        setProgress(undefined);
      },
    };
  }, []);
  const config = taskConfig ?? inheritedConfig;
  const presentation = mergeComponentProps<LoadingBarProviderProps>(
    taskComponents?.LoadingBar,
    props,
  );
  return (
    <Context.Provider value={api}>
      <ConfigContext.Provider value={config}>
        <div
          style={{
            display: 'contents',
            ...leafDensityVariables(config.density),
            ...leafThemeVariables(config.theme),
          }}
          dir={config.direction}
        >
          <LoadingBarControl {...presentation} active={active} progress={progress} />
        </div>
      </ConfigContext.Provider>
      {children}
    </Context.Provider>
  );
}
export function LoadingBarScope({ children }: { children?: ReactNode }) {
  return useContext(Context) ? children : <LoadingBarProvider>{children}</LoadingBarProvider>;
}
export function useLoadingBar() {
  const api = useContext(Context);
  const components = useContext(ComponentDefaultsContext);
  const config = useLeafConfig();
  const latest = useRef(components);
  latest.current = components;
  const latestConfig = useRef(config);
  latestConfig.current = config;
  const result = useMemo<LoadingBarApi | null>(
    () => (api ? { ...api, start: () => api.start(latest.current, latestConfig.current) } : null),
    [api],
  );
  if (!result) throw new Error('useLoadingBar requires ConfigProvider or LoadingBarProvider.');
  return result;
}

export function LoadingBar(rawProps: LoadingBarProps) {
  const props = useComponentProps('LoadingBar', rawProps);
  return <LoadingBarControl {...props} />;
}

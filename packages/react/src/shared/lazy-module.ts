import { useEffect, useState } from 'react';

/** 按需动态加载扩展能力模块，仅在对应功能启用时触发异步导入，避免首屏打包未使用的三方引擎。 */
export function createLazyModule<T>(load: () => Promise<T>) {
  let cached: T | null = null;
  return function useLazyModule(enabled: boolean): T | null {
    const [loaded, setLoaded] = useState<T | null>(() => (enabled ? cached : null));
    useEffect(() => {
      if (!enabled) return;
      if (cached) {
        setLoaded((previous) => (previous === cached ? previous : cached));
        return;
      }
      let cancelled = false;
      void load()
        .then((module) => {
          cached = module;
          if (!cancelled) setLoaded(() => module);
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [enabled]);
    return enabled ? (loaded ?? cached) : null;
  };
}

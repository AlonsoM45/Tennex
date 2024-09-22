import { useEffect, useRef } from 'react';

type CleanupFunction = () => void;
type DebounceConfig = {
  timeout: number,
  ignoreInitialCall: boolean
};

type Ref = {
  clearFunc: CleanupFunction | undefined,
  firstTime: boolean
};

const DEFAULT_CONFIG: DebounceConfig = {
  timeout: 0,
  ignoreInitialCall: true,
};

export function useDebouncedEffect(
  callback: () => (CleanupFunction | undefined),
  config: Partial<DebounceConfig>,
  deps: unknown[]
) {
  let currentConfig;
  if (typeof config === 'object') {
    currentConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  } else {
    currentConfig = {
      ...DEFAULT_CONFIG,
      timeout: config,
    };
  }
  const { timeout, ignoreInitialCall } = currentConfig;
  const data = useRef<Ref>({ firstTime: true, clearFunc: undefined });
  useEffect(() => {
    const { firstTime, clearFunc } = data.current;

    if (firstTime && ignoreInitialCall) {
      data.current.firstTime = false;
      return;
    }

    const handler = setTimeout(() => {
      if (clearFunc && typeof clearFunc === 'function') {
        clearFunc();
      }
      data.current.clearFunc = callback();
    }, timeout);

    return () => {
      clearTimeout(handler);
    };
  }, [timeout, ...deps]);
}
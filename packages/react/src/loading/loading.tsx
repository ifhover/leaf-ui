import { LoaderCircle } from 'lucide-react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { usePresence } from '../shared/presence';
import type { ControlSize } from '../shared/types';

/** Loading 指示器预设动画风格。 */
export type LoadingVariant =
  | 'spinner'
  | 'ring'
  | 'dual'
  | 'orbit'
  | 'chase'
  | 'dots'
  | 'wave'
  | 'bars'
  | 'pulse'
  | 'grid'
  | 'blocks'
  | 'flip';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否处于加载状态 @default true */
  spinning?: boolean;
  /** 指示器尺寸 @default 'md' */
  size?: ControlSize;
  /** 动画样式 @default 'spinner' */
  variant?: LoadingVariant;
  /** 提示文字 */
  tip?: ReactNode;
  /** 延迟显示加载指示器（毫秒） @default 0 */
  delay?: number;
}

const CHASE_DOT_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] as const;
const DOT_KEYS = ['d1', 'd2', 'd3'] as const;
const WAVE_DOT_KEYS = ['w1', 'w2', 'w3', 'w4', 'w5'] as const;
const BAR_KEYS = ['b1', 'b2', 'b3', 'b4'] as const;
const PULSE_RING_KEYS = ['p1', 'p2', 'p3'] as const;
const GRID_CELL_KEYS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'] as const;
const BLOCK_KEYS = ['k1', 'k2', 'k3'] as const;

const CSS_VAR = (vars: Record<`--${string}`, number>) => vars as CSSProperties;

function renderGraphic(variant: LoadingVariant) {
  switch (variant) {
    case 'ring':
      return <span className="leaf-loading__ring" aria-hidden="true" />;
    case 'dual':
      return (
        <span className="leaf-loading__dual" aria-hidden="true">
          <span className="leaf-loading__dual-outer" />
          <span className="leaf-loading__dual-inner" />
        </span>
      );
    case 'orbit':
      return (
        <span className="leaf-loading__orbit" aria-hidden="true">
          <span className="leaf-loading__orbit-track" />
          <span className="leaf-loading__orbit-arm" />
        </span>
      );
    case 'chase':
      return (
        <span className="leaf-loading__chase" aria-hidden="true">
          {CHASE_DOT_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__chase-dot"
              style={CSS_VAR({ '--leaf-i': index, '--leaf-d': -5 + index * 0.625 })}
            />
          ))}
        </span>
      );
    case 'dots':
      return (
        <span className="leaf-loading__dots" aria-hidden="true">
          {DOT_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__dot"
              style={CSS_VAR({ '--leaf-d': -1.6 + index * 0.8 })}
            />
          ))}
        </span>
      );
    case 'wave':
      return (
        <span className="leaf-loading__wave" aria-hidden="true">
          {WAVE_DOT_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__wave-dot"
              style={CSS_VAR({ '--leaf-d': -3.75 + index * 0.75 })}
            />
          ))}
        </span>
      );
    case 'bars':
      return (
        <span className="leaf-loading__bars" aria-hidden="true">
          {BAR_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__bar"
              style={CSS_VAR({ '--leaf-d': -1.8 + index * 0.6 })}
            />
          ))}
        </span>
      );
    case 'pulse':
      return (
        <span className="leaf-loading__pulse" aria-hidden="true">
          {PULSE_RING_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__pulse-ring"
              style={CSS_VAR({ '--leaf-i': index, '--leaf-d': -6 + index * 3 })}
            />
          ))}
        </span>
      );
    case 'grid':
      return (
        <span className="leaf-loading__grid" aria-hidden="true">
          {GRID_CELL_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__grid-cell"
              style={CSS_VAR({
                '--leaf-d': -3.25 + (Math.floor(index / 3) + (index % 3)) * 0.65,
              })}
            />
          ))}
        </span>
      );
    case 'blocks':
      return (
        <span className="leaf-loading__blocks" aria-hidden="true">
          {BLOCK_KEYS.map((key, index) => (
            <span
              key={key}
              className="leaf-loading__block"
              style={CSS_VAR({
                '--leaf-x': index === 1 ? 1 : 0,
                '--leaf-y': index === 0 ? 0 : 1,
                '--leaf-d': -4 * index,
              })}
            />
          ))}
        </span>
      );
    case 'flip':
      return <span className="leaf-loading__flip" aria-hidden="true" />;
    default:
      return <LoaderCircle className="leaf-loading__spinner" aria-hidden="true" />;
  }
}

export function LoadingControl({
  spinning = true,
  size = 'md',
  variant = 'spinner',
  tip,
  delay = 0,
  children,
  className,
  ...props
}: LoadingProps) {
  const { messages } = useLeafConfig();
  const [ready, setReady] = useState(spinning && delay <= 0);
  useEffect(() => {
    if (!spinning) {
      setReady(false);
      return;
    }
    if (delay <= 0) {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [spinning, delay]);
  const visible = spinning && ready;
  const state = useRef<HTMLDivElement>(null);
  const present = usePresence(visible, state);
  const indicator = (
    <div
      className="leaf-loading__indicator"
      role="status"
      aria-label={typeof tip === 'string' ? tip : messages.common.loading}
    >
      {renderGraphic(variant)}
      {tip && <span>{tip}</span>}
    </div>
  );
  return (
    <div
      {...props}
      className={classes(
        'leaf-loading',
        `leaf-loading--${size}`,
        `leaf-loading--${variant}`,
        children != null && 'leaf-loading--wrapped',
        className,
      )}
      aria-busy={spinning}
    >
      {children != null ? (
        <>
          <div
            className="leaf-loading__content"
            data-loading={visible || undefined}
            {...inertProps(visible)}
          >
            {children}
          </div>
          {present && (
            <div
              ref={state}
              data-visible={visible || undefined}
              aria-hidden={!visible || undefined}
              className="leaf-loading__overlay"
            >
              {indicator}
            </div>
          )}
        </>
      ) : present ? (
        <div
          ref={state}
          data-visible={visible || undefined}
          aria-hidden={!visible || undefined}
          className="leaf-loading__state"
        >
          {indicator}
        </div>
      ) : null}
    </div>
  );
}

export function Loading(rawProps: LoadingProps) {
  const props = useComponentProps('Loading', rawProps);
  return <LoadingControl {...props} />;
}

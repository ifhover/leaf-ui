import { Component, type ContextType, type ErrorInfo, type ReactNode } from 'react';
import { ButtonControl } from '../button/button';
import {
  ComponentDefaultsContext,
  mergeComponentProps,
} from '../config-provider/component-defaults';
import { ResultControl as Result } from '../result/result';
import { useText } from '../shared/use-text';
export interface ErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
}
export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  resetKeys?: readonly unknown[];
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  static contextType = ComponentDefaultsContext;
  declare context: ContextType<typeof ComponentDefaultsContext>;
  private previousResetKeys: readonly unknown[] = [];
  private get resolvedProps(): ErrorBoundaryProps {
    return mergeComponentProps(this.context.ErrorBoundary, this.props);
  }
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.resolvedProps.onError?.(error, info);
  }
  componentDidMount() {
    this.previousResetKeys = this.resolvedProps.resetKeys ?? [];
  }
  componentDidUpdate() {
    const next = this.resolvedProps.resetKeys ?? [];
    const old = this.previousResetKeys;
    this.previousResetKeys = next;
    if (
      this.state.error &&
      (next.length !== old.length || next.some((item, index) => !Object.is(item, old[index])))
    )
      this.reset();
  }
  reset = () => {
    this.resolvedProps.onReset?.();
    this.setState({ error: null });
  };
  render() {
    const props = this.resolvedProps;
    if (!this.state.error) return props.children;
    const fallback = props.fallback;
    return typeof fallback === 'function'
      ? fallback({ error: this.state.error, reset: this.reset })
      : (fallback ?? <DefaultFallback reset={this.reset} />);
  }
}
function DefaultFallback({ reset }: { reset: () => void }) {
  const t = useText();
  return (
    <Result
      className="leaf-error-boundary"
      status="error"
      title={t('errorBoundary.title')}
      description={t('errorBoundary.description')}
      extra={
        <ButtonControl variant="solid" onClick={reset}>
          {t('common.retry')}
        </ButtonControl>
      }
    />
  );
}

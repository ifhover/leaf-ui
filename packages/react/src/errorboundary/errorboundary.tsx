import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../button';
import { Result } from '../result';
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
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }
  componentDidUpdate(previous: ErrorBoundaryProps) {
    const next = this.props.resetKeys ?? [];
    const old = previous.resetKeys ?? [];
    if (
      this.state.error &&
      (next.length !== old.length || next.some((item, index) => !Object.is(item, old[index])))
    )
      this.reset();
  }
  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };
  render() {
    if (!this.state.error) return this.props.children;
    const fallback = this.props.fallback;
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
      title={t('内容暂时无法显示', 'This content could not be displayed')}
      description={t('请重试，或稍后返回。', 'Please retry or come back later.')}
      extra={<Button onClick={reset}>{t('重试', 'Retry')}</Button>}
    />
  );
}

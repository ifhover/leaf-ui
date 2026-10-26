import { Progress } from '@ifhover/leaf-ui';

export function ProgressSteps() {
  return <Progress percent={60} steps={10} aria-label="检查进度" />;
}

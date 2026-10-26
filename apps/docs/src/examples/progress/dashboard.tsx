import { Progress } from '@ifhover/leaf-ui';

export function ProgressDashboard() {
  return <Progress type="circle" dashboard percent={65} aria-label="容量使用率" />;
}

import { Progress } from '@ifhover/leaf-ui';

export function ProgressSegments() {
  return (
    <Progress
      percent={75}
      aria-label="File processing progress"
      segments={[
        { key: 'processed', percent: 35, color: '#1e964f' },
        { key: 'uploaded', percent: 40, color: '#1d9bf0' },
      ]}
    />
  );
}

import { Skeleton, Space } from '@ifhover/leaf-ui';

export function SkeletonElements() {
  return (
    <Space wrap align="center" size="md">
      <Skeleton.Avatar />
      <Skeleton.Button />
      <Skeleton.Input size="sm" />
      <Skeleton.Image size={72} />
    </Space>
  );
}

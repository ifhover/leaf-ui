import { Skeleton } from '@ifhover/leaf-ui';

export function SkeletonRows() {
  return <Skeleton rows={4} rowWidths={['100%', '80%', '90%', '60%']} />;
}

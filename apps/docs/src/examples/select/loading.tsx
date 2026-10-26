import { Select } from '@ifhover/leaf-ui';

export function SelectLoading() {
  return <Select aria-label="加载选项" options={[]} loading placeholder="加载中" />;
}

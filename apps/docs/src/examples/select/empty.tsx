import { Select } from '@ifhover/leaf-ui';

export function SelectEmpty() {
  return <Select aria-label="空选项" options={[]} notFoundContent="还没有项目" />;
}

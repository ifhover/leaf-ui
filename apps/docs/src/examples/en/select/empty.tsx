import { Select } from '@ifhover/leaf-ui';

export function SelectEmpty() {
  return <Select aria-label="Empty options" options={[]} notFoundContent="No projects yet" />;
}

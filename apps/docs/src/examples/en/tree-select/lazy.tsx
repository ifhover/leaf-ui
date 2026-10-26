import { TreeSelect } from '@ifhover/leaf-ui';

const options = [{ value: 'team', label: 'Team', isLeaf: false }];

export function LazyLoad() {
  return (
    <TreeSelect
      aria-label="Load teams asynchronously"
      options={options}
      placeholder="Expand the team to load children"
      loadData={async (option, signal) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        signal.throwIfAborted();
        return [
          { value: `${option.value}-design`, label: 'Design group', isLeaf: true },
          { value: `${option.value}-dev`, label: 'Development group', isLeaf: true },
        ];
      }}
    />
  );
}

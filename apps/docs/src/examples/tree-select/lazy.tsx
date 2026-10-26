import { TreeSelect } from '@ifhover/leaf-ui';

const options = [{ value: 'team', label: '团队', isLeaf: false }];

export function LazyLoad() {
  return (
    <TreeSelect
      aria-label="异步加载团队"
      options={options}
      placeholder="展开团队加载子项"
      loadData={async (option, signal) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        signal.throwIfAborted();
        return [
          { value: `${option.value}-design`, label: '设计组', isLeaf: true },
          { value: `${option.value}-dev`, label: '开发组', isLeaf: true },
        ];
      }}
    />
  );
}

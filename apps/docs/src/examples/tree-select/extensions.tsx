import { TreeSelect } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <TreeSelect
      placeholder="展开团队加载成员"
      options={[{ value: 'team', label: '团队', isLeaf: false }]}
      virtual
      loadData={async (option) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [
          { value: `${option.value}-design`, label: '设计组', isLeaf: true },
          { value: `${option.value}-dev`, label: '开发组', isLeaf: true },
        ];
      }}
    />
  );
}

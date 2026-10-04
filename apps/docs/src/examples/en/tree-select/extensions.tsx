import { TreeSelect } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <TreeSelect
      placeholder="Expand the team to load members"
      options={[{ value: 'team', label: 'Team', isLeaf: false }]}
      virtual
      loadData={async (option) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [
          { value: `${option.value}-design`, label: 'Design team', isLeaf: true },
          { value: `${option.value}-dev`, label: 'Development team', isLeaf: true },
        ];
      }}
    />
  );
}

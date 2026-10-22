import { TreeSelect } from '@ifhover/leaf-ui';

const options = (english: boolean) => [
  { value: 'team', label: english ? 'Team' : '团队', isLeaf: false },
];

export function LazyLoad({ english = false }) {
  return (
    <TreeSelect
      aria-label={english ? 'Remote team' : '远程团队'}
      loadData={async (option) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [
          {
            value: `${option.value}-design`,
            label: english ? 'Design team' : '设计组',
            isLeaf: true,
          },
          {
            value: `${option.value}-dev`,
            label: english ? 'Engineering team' : '开发组',
            isLeaf: true,
          },
        ];
      }}
      options={options(english)}
      placeholder={english ? 'Expand the team to load members' : '展开团队加载成员'}
      virtual
    />
  );
}

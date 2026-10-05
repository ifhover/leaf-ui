import { Avatar, Button, List, ListItem, Tag } from '@sudden3/leaf-ui';

const members = [
  { key: 'ada', name: 'Ada', role: 'Design' },
  { key: 'lin', name: 'Lin', role: 'Engineering' },
];
export function ListBasic({ english = false }: { english?: boolean }) {
  return (
    <List
      items={members}
      itemKey={(item) => item.key}
      header={english ? 'Project members' : '项目成员'}
      renderItem={(item) => (
        <ListItem
          avatar={<Avatar>{item.name[0]}</Avatar>}
          title={item.name}
          description={item.role}
          extra={<Tag color="success">{english ? 'Active' : '活跃'}</Tag>}
          actions={[
            <Button key="view" size="sm" variant="ghost">
              {english ? 'View profile' : '查看资料'}
            </Button>,
          ]}
        />
      )}
    />
  );
}
export function ListStates({ english = false }: { english?: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <p>{english ? 'Loading results' : '加载结果'}</p>
        <List loading items={[]} />
      </div>
      <div>
        <p>{english ? 'Empty collection' : '暂无内容'}</p>
        <List
          items={[]}
          emptyContent={
            english ? 'Invite a member to get started.' : '邀请成员后，就会显示在这里。'
          }
        />
      </div>
    </div>
  );
}

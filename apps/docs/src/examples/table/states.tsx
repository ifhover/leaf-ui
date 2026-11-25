import { Button, Flex, Table } from '@ifhover/leaf-ui';
import { useState } from 'react';

const members: { id: string; name: string; team: string }[] = [];

export function TableStates() {
  const [state, setState] = useState<'empty' | 'loading' | 'error'>('empty');
  return (
    <Flex direction="column" gap="md">
      <Table
        data={members}
        columns={[
          { dataIndex: 'name', title: '成员' },
          { dataIndex: 'team', title: '团队' },
        ]}
        rowKey="id"
        aria-label="数据状态"
        pagination={false}
        loading={state === 'loading'}
        error={state === 'error' ? '成员加载失败' : undefined}
        onRetry={() => setState('empty')}
      />
      <Flex gap="sm" wrap>
        <Button variant={state === 'empty' ? 'solid' : 'outline'} onClick={() => setState('empty')}>
          空数据
        </Button>
        <Button
          variant={state === 'loading' ? 'solid' : 'outline'}
          onClick={() => setState('loading')}
        >
          加载中
        </Button>
        <Button variant={state === 'error' ? 'solid' : 'outline'} onClick={() => setState('error')}>
          加载失败
        </Button>
      </Flex>
    </Flex>
  );
}

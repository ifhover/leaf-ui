import { Button, Flex } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const members: { id: string; name: string; team: string }[] = [];

export function TableStates() {
  const [state, setState] = useState<'empty' | 'loading' | 'error'>('empty');
  return (
    <Flex direction="column" gap="md">
      <DataTable
        data={members}
        columns={[
          { accessorKey: 'name', header: 'Member' },
          { accessorKey: 'team', header: 'Team' },
        ]}
        rowKey="id"
        aria-label="Data states"
        pagination={false}
        loading={state === 'loading'}
        error={state === 'error' ? 'Unable to load members' : undefined}
        onRetry={() => setState('empty')}
      />
      <Flex gap="sm" wrap>
        <Button variant={state === 'empty' ? 'solid' : 'outline'} onClick={() => setState('empty')}>
          Empty
        </Button>
        <Button
          variant={state === 'loading' ? 'solid' : 'outline'}
          onClick={() => setState('loading')}
        >
          Loading
        </Button>
        <Button variant={state === 'error' ? 'solid' : 'outline'} onClick={() => setState('error')}>
          Error
        </Button>
      </Flex>
    </Flex>
  );
}

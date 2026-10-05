import { AutoComplete, Button, Space } from '@sudden3/leaf-ui';
import { useState } from 'react';

const options = [
  {
    label: 'Team',
    options: [
      {
        value: 'alice@example.com',
        label: (
          <>
            <strong>Alice</strong> · Design
          </>
        ),
        searchLabel: 'Alice Design',
      },
      {
        value: 'bob@example.com',
        label: (
          <>
            <strong>Bob</strong> · Engineering
          </>
        ),
        searchLabel: 'Bob Engineering',
      },
    ],
  },
];
export function Capabilities({ english = false }) {
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  return (
    <Space direction="vertical" align="stretch">
      <Space>
        <Button size="sm" onClick={() => setState('ready')}>
          {english ? 'Ready' : '已加载'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setState('loading')}>
          {english ? 'Loading' : '加载中'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setState('error')}>
          {english ? 'Error' : '加载失败'}
        </Button>
      </Space>
      <AutoComplete
        aria-label={english ? 'Team email' : '团队邮箱'}
        options={state === 'ready' ? options : []}
        loading={state === 'loading'}
        errorContent={
          state === 'error' ? (
            <Button size="sm" variant="ghost" onClick={() => setState('ready')}>
              {english ? 'Retry' : '重新加载'}
            </Button>
          ) : undefined
        }
        allowClear
        notFoundContent={english ? 'No matching teammate' : '没有匹配的成员'}
      />
    </Space>
  );
}

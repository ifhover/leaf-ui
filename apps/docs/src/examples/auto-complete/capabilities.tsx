import { AutoComplete, Button, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = (english: boolean) => [
  {
    label: english ? 'Team' : '团队',
    options: [
      {
        value: 'alice@example.com',
        label: (
          <>
            <strong>Alice</strong> · {english ? 'Design' : '设计'}
          </>
        ),
        searchLabel: `Alice ${english ? 'Design' : '设计'}`,
      },
      {
        value: 'bob@example.com',
        label: (
          <>
            <strong>Bob</strong> · {english ? 'Engineering' : '工程'}
          </>
        ),
        searchLabel: `Bob ${english ? 'Engineering' : '工程'}`,
      },
    ],
  },
];

export function Capabilities({ english = false }) {
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  return (
    <Space direction="vertical" align="stretch">
      <Space>
        <Button onClick={() => setState('ready')} size="sm">
          {english ? 'Ready' : '已加载'}
        </Button>
        <Button onClick={() => setState('loading')} size="sm" variant="outline">
          {english ? 'Loading' : '加载中'}
        </Button>
        <Button onClick={() => setState('error')} size="sm" variant="outline">
          {english ? 'Error' : '加载失败'}
        </Button>
      </Space>
      <AutoComplete
        allowClear
        aria-label={english ? 'Team email' : '团队邮箱'}
        errorContent={
          state === 'error' ? (
            <Button onClick={() => setState('ready')} size="sm">
              {english ? 'Retry' : '重新加载'}
            </Button>
          ) : undefined
        }
        loading={state === 'loading'}
        notFoundContent={english ? 'No matching teammate' : '没有匹配的成员'}
        options={state === 'ready' ? options(english) : []}
        popupMaxWidth={320}
        popupWidth="auto"
      />
    </Space>
  );
}

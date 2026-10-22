import type { CascaderOption } from '@ifhover/leaf-ui';
import { Button, Cascader, Flex } from '@ifhover/leaf-ui';
import { useCallback, useState } from 'react';

const remote = (english: boolean): CascaderOption[] => [
  { value: 'remote', label: english ? 'Remote teams' : '远程团队', isLeaf: false },
];

export function Cache({ english = false }) {
  const [version, setVersion] = useState(0);

  const loadData = useCallback(
    async (option: CascaderOption, signal: AbortSignal) => {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 350);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('aborted'));
        });
      });
      return [
        {
          value: `${option.value}-child`,
          label: english ? `Loaded item v${version}` : `已加载项 v${version}`,
          isLeaf: true,
        },
      ];
    },
    [english, version],
  );

  return (
    <Flex align="center" gap="md" wrap>
      <Cascader
        aria-label={english ? 'Remote team' : '远程团队'}
        cacheKey={version}
        loadData={loadData}
        options={remote(english)}
        placeholder={english ? 'Expand a remote team' : '展开远程团队'}
      />
      <Button onClick={() => setVersion((current) => current + 1)} variant="outline">
        {english ? 'Refresh data' : '刷新数据'}
      </Button>
    </Flex>
  );
}

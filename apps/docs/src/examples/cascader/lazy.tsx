import type { CascaderOption } from '@ifhover/leaf-ui';
import { Cascader } from '@ifhover/leaf-ui';
import { useCallback } from 'react';

const remote = (english: boolean): CascaderOption[] => [
  { value: 'remote', label: english ? 'Remote teams' : '远程团队', isLeaf: false },
];

export function Lazy({ english = false }) {
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
          label: english ? 'Loaded item' : '已加载项',
          isLeaf: true,
        },
      ];
    },
    [english],
  );

  return (
    <Cascader
      aria-label={english ? 'Remote team' : '远程团队'}
      loadData={loadData}
      options={remote(english)}
      placeholder={english ? 'Expand a remote team' : '展开远程团队'}
    />
  );
}

import type { CascaderOption } from '@ifhover/leaf-ui';
import { Button, Cascader, Flex, Space, Text } from '@ifhover/leaf-ui';
import { useCallback, useState } from 'react';

const options = [
  {
    value: 'product',
    label: 'Product',
    children: [
      { value: 'ui', label: 'UI' },
      { value: 'web', label: 'Web' },
    ],
  },
  { value: 'team', label: 'Team', children: [{ value: 'design', label: 'Design' }] },
];
const lazy: CascaderOption[] = [{ value: 'remote', label: 'Remote', isLeaf: false }];
export function Capabilities({ english = false }) {
  const [version, setVersion] = useState(0);
  const load = useCallback(async (option: CascaderOption, signal: AbortSignal) => {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 350);
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(signal.reason);
        },
        { once: true },
      );
    });
    return [{ value: `${option.value}-child`, label: 'Loaded item', isLeaf: true }];
  }, []);
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>
          {english ? 'Search, multiple paths and intermediate levels' : '搜索、多选与选择中间层'}
        </Text>
        <Cascader options={options} showSearch multiple changeOnSelect />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Lazy loading and explicit cache refresh' : '懒加载与刷新缓存'}</Text>
        <Cascader options={lazy} loadData={load} cacheKey={version} allowClear />
      </Flex>
      <Button variant="outline" onClick={() => setVersion(version + 1)}>
        {english ? 'Refresh data' : '刷新数据'}
      </Button>
    </Space>
  );
}

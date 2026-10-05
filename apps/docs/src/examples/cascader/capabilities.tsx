import { Button, Cascader, type CascaderOption, Space } from '@sudden3/leaf-ui';
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
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Search, multiple paths and intermediate levels' : '搜索、多选与选择中间层'}
        </p>
        <Cascader options={options} showSearch multiple changeOnSelect />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Lazy loading and explicit cache refresh' : '懒加载与刷新缓存'}
        </p>
        <Cascader options={lazy} loadData={load} cacheKey={version} allowClear />
      </div>
      <Button variant="outline" onClick={() => setVersion(version + 1)}>
        {english ? 'Refresh data' : '刷新数据'}
      </Button>
    </Space>
  );
}

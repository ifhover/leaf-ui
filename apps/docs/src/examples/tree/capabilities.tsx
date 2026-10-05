import { Button, Space, Tree, type TreeNode } from '@sudden3/leaf-ui';
import { useCallback, useMemo, useState } from 'react';

export function TreeCacheRefresh({ english = false }: { english?: boolean }) {
  const [version, setVersion] = useState(1);
  const data = useMemo<readonly TreeNode[]>(
    () => [{ key: 'root', title: english ? 'Documents' : '文档', isLeaf: false }],
    [english],
  );
  const loadData = useCallback(
    async (node: TreeNode, signal: AbortSignal): Promise<readonly TreeNode[]> => {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 400);
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
      if (signal.aborted) return [];
      return [
        {
          key: `${node.key}-${version}`,
          title: `${english ? 'Release' : '版本'} ${version}`,
          isLeaf: true,
        },
      ];
    },
    [english, version],
  );
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <Button variant="outline" onClick={() => setVersion((value) => value + 1)}>
          {english ? 'Refresh data' : '刷新数据'}
        </Button>
      </div>
      <Tree
        aria-label={english ? 'Versioned documents' : '可刷新文档'}
        data={data}
        loadData={loadData}
        cacheKey={version}
        defaultExpandedKeys={['root']}
      />
      <p className="leaf-demo-note">
        {english
          ? 'The root key stays stable. A new cache version discards old children and cancels pending requests.'
          : '根节点 key 保持不变，数据版本变化后会清除旧子节点并取消未完成的请求。'}
      </p>
    </Space>
  );
}

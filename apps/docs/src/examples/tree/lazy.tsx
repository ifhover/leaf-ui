import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useCallback, useRef, useState } from 'react';

const data: TreeNode[] = [{ key: 'root', title: '文档', isLeaf: false }];

function waitForChildren(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, 400);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export function TreeLazy() {
  const firstRequest = useRef(true);
  const [status, setStatus] = useState('展开文档加载子项');
  const loadData = useCallback(async (node: TreeNode, signal: AbortSignal) => {
    setStatus('正在加载');
    await waitForChildren(signal);
    if (firstRequest.current) {
      firstRequest.current = false;
      throw new Error('首次加载失败，请收起后重新展开重试。');
    }
    return [
      { key: `${node.key}-design`, title: '设计', isLeaf: true },
      { key: `${node.key}-development`, title: '开发', isLeaf: true },
    ];
  }, []);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="文档"
        data={data}
        loadData={loadData}
        onLoad={() => setStatus('加载成功')}
        onLoadError={(error) => setStatus(error instanceof Error ? error.message : String(error))}
      />
      <Text role="status" tone="muted">
        {status}
      </Text>
    </Space>
  );
}

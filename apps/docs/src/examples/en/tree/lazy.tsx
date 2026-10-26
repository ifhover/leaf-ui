import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useCallback, useRef, useState } from 'react';

const data: TreeNode[] = [{ key: 'root', title: 'Documents', isLeaf: false }];

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
  const [status, setStatus] = useState('Expand Documents to load children');
  const loadData = useCallback(async (node: TreeNode, signal: AbortSignal) => {
    setStatus('Loading');
    await waitForChildren(signal);
    if (firstRequest.current) {
      firstRequest.current = false;
      throw new Error('The first request failed. Collapse and expand again to retry.');
    }
    return [
      { key: `${node.key}-design`, title: 'Design', isLeaf: true },
      { key: `${node.key}-development`, title: 'Development', isLeaf: true },
    ];
  }, []);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="Documents"
        data={data}
        loadData={loadData}
        onLoad={() => setStatus('Loaded successfully')}
        onLoadError={(error) => setStatus(error instanceof Error ? error.message : String(error))}
      />
      <Text role="status" tone="muted">
        {status}
      </Text>
    </Space>
  );
}

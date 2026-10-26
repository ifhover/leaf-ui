import { Button, Flex, Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
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

export function TreeCache() {
  const [version, setVersion] = useState(1);
  const [loadedVersion, setLoadedVersion] = useState<number | null>(null);
  const versionRef = useRef(1);
  const loadData = useCallback(async (node: TreeNode, signal: AbortSignal) => {
    const requestVersion = versionRef.current;
    await waitForChildren(signal);
    setLoadedVersion(requestVersion);
    return [{ key: `${node.key}-child`, title: `Loaded item v${requestVersion}`, isLeaf: true }];
  }, []);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="Documents"
        data={data}
        loadData={loadData}
        cacheKey={version}
        defaultExpandedKeys={['root']}
      />
      <Flex align="start">
        <Button
          onClick={() => {
            versionRef.current += 1;
            setVersion(versionRef.current);
            setLoadedVersion(null);
          }}
        >
          Refresh data
        </Button>
      </Flex>
      <Text role="status" tone="muted">
        Cache version: v{version}; Loaded version:{' '}
        {loadedVersion === null ? 'Not loaded' : `v${loadedVersion}`}
      </Text>
    </Space>
  );
}

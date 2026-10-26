import {
  Button,
  Cascader,
  type CascaderOption,
  Flex,
  Form,
  FormField,
  Text,
} from '@ifhover/leaf-ui';
import { useCallback, useRef, useState } from 'react';

const options: CascaderOption[] = [{ value: 'remote', label: '远程分类', isLeaf: false }];

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

export function CascaderCache() {
  const [version, setVersion] = useState(1);
  const [loadedVersion, setLoadedVersion] = useState<number | null>(null);
  const versionRef = useRef(1);
  const loadData = useCallback(async (option: CascaderOption, signal: AbortSignal) => {
    const requestVersion = versionRef.current;
    await waitForChildren(signal);
    setLoadedVersion(requestVersion);
    return [{ value: `${option.value}-child`, label: `已加载项 v${requestVersion}`, isLeaf: true }];
  }, []);

  return (
    <Form layout="vertical">
      <FormField label="远程分类">
        <Cascader options={options} loadData={loadData} cacheKey={version} placeholder="展开分类" />
      </FormField>
      <Flex align="start">
        <Button
          onClick={() => {
            versionRef.current += 1;
            setVersion(versionRef.current);
            setLoadedVersion(null);
          }}
        >
          刷新数据
        </Button>
      </Flex>
      <Text role="status" tone="muted">
        缓存版本：v{version}; 加载版本：{loadedVersion === null ? '未加载' : `v${loadedVersion}`}
      </Text>
    </Form>
  );
}

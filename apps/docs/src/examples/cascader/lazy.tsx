import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

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

async function loadData(option: CascaderOption, signal: AbortSignal): Promise<CascaderOption[]> {
  await waitForChildren(signal);
  return [{ value: `${option.value}-child`, label: '已加载项', isLeaf: true }];
}

export function CascaderLazy() {
  return (
    <Form layout="vertical">
      <FormField label="远程分类">
        <Cascader options={options} loadData={loadData} placeholder="展开分类" />
      </FormField>
    </Form>
  );
}

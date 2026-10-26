import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const options: CascaderOption[] = [{ value: 'remote', label: 'Remote categories', isLeaf: false }];

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
  return [{ value: `${option.value}-child`, label: 'Loaded item', isLeaf: true }];
}

export function CascaderLazy() {
  return (
    <Form layout="vertical">
      <FormField label="Remote categories">
        <Cascader options={options} loadData={loadData} placeholder="Expand a category" />
      </FormField>
    </Form>
  );
}

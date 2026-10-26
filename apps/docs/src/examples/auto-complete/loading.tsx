import {
  AutoComplete,
  type AutoCompleteOption,
  Button,
  Flex,
  Form,
  FormField,
  Text,
} from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function AutoCompleteLoading() {
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('error');
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const retry = async () => {
    setState('loading');
    setOpen(true);
    input.current?.focus();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOptions([{ value: 'Leaf Garden' }, { value: 'Leaf Studio' }]);
    setState('ready');
  };

  return (
    <Form layout="vertical">
      <FormField label="远程项目">
        <AutoComplete
          ref={input}
          aria-label="远程项目"
          options={options}
          filterOption={false}
          open={open}
          onOpenChange={setOpen}
          loading={state === 'loading'}
          errorContent={
            state === 'error' ? (
              <Flex direction="column" align="start" gap={8}>
                <Text>建议加载失败</Text>
                <Button onClick={retry} size="sm">
                  重试
                </Button>
              </Flex>
            ) : undefined
          }
        />
      </FormField>
      <Text tone="muted" role="status">
        {state === 'loading' ? '正在加载' : state === 'error' ? '加载失败' : '已加载 2 条建议'}
      </Text>
      <Flex>
        <Button
          disabled={state === 'loading'}
          onClick={() => {
            setOptions([]);
            setState('error');
            setOpen(true);
          }}
        >
          模拟失败
        </Button>
      </Flex>
    </Form>
  );
}

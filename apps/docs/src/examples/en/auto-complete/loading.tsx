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
      <FormField label="Remote project">
        <AutoComplete
          ref={input}
          aria-label="Remote project"
          options={options}
          filterOption={false}
          open={open}
          onOpenChange={setOpen}
          loading={state === 'loading'}
          errorContent={
            state === 'error' ? (
              <Flex direction="column" align="start" gap={8}>
                <Text>Suggestions failed to load</Text>
                <Button onClick={retry} size="sm">
                  Retry
                </Button>
              </Flex>
            ) : undefined
          }
        />
      </FormField>
      <Text tone="muted" role="status">
        {state === 'loading'
          ? 'Loading'
          : state === 'error'
            ? 'Load failed'
            : 'Loaded 2 suggestions'}
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
          Simulate failure
        </Button>
      </Flex>
    </Form>
  );
}

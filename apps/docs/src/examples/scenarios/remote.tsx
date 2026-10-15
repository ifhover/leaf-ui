import { Flex, Select, type SelectOption, Text } from '@ifhover/leaf-ui';
import { useEffect, useRef, useState } from 'react';

const teams = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'support', label: 'Support' },
  { value: 'research', label: 'Research' },
];
export function RemoteSelection({ english = false }: { english?: boolean }) {
  const [query, setQuery] = useState(''),
    [options, setOptions] = useState<SelectOption[]>(teams),
    [loading, setLoading] = useState(false),
    [value, setValue] = useState('design');
  const generation = useRef(0);
  useEffect(() => {
    const request = ++generation.current;
    const abort = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      if (abort.signal.aborted || request !== generation.current) return;
      setOptions(
        teams.filter((option) => String(option.label).toLowerCase().includes(query.toLowerCase())),
      );
      setLoading(false);
    }, 300);
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [query]);
  return (
    <Flex direction="column" gap="sm">
      <Select
        aria-label={english ? 'Remote team' : '远程团队'}
        showSearch
        filterOption={false}
        loading={loading}
        options={options}
        onSearch={setQuery}
        value={value}
        onChange={setValue}
        allowClear
      />
      <Text tone="muted">
        {english
          ? 'Selected labels remain visible when search results are replaced. Superseded requests cannot overwrite a later result.'
          : '搜索结果替换后仍保留选中项名称，过期请求不会覆盖较新的结果。'}
      </Text>
    </Flex>
  );
}

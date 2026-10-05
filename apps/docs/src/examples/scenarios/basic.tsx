import {
  Button,
  CheckboxGroup,
  Form,
  FormField,
  FormList,
  Input,
  Select,
  type SelectOption,
  Space,
  Upload,
  useFormValidation,
} from '@sudden3/leaf-ui';
import { useEffect, useRef, useState } from 'react';
export function CompositeForm({ english = false }: { english?: boolean }) {
  const validation = useFormValidation({
    validate: async (data, signal): Promise<Record<string, string>> => {
      const name = String(data.get('name') ?? '').trim();
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 250);
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
      if (signal.aborted) return {};
      return name.length < 2
        ? { name: english ? 'Use at least two characters.' : '名称至少两个字符。' }
        : {};
    },
    onSubmit: async (data) => {
      setSummary(
        JSON.stringify(
          [...data.entries()].map(([key, value]) => [
            key,
            value instanceof File ? value.name : value,
          ]),
          null,
          2,
        ),
      );
    },
  });
  const [summary, setSummary] = useState('');
  return (
    <Form
      onSubmit={validation.handleSubmit}
      onReset={validation.handleReset}
      disabled={validation.pending}
    >
      <FormField label={english ? 'Project' : '项目名称'} required error={validation.errors.name}>
        <Input name="name" placeholder={english ? 'Project name' : '项目名称'} />
      </FormField>
      <FormField label={english ? 'Teams' : '参与团队'} required>
        <CheckboxGroup name="teams" options={['Design', 'Engineering', 'Support']} />
      </FormField>
      <FormField label={english ? 'Files' : '相关文件'}>
        <Upload
          name="files"
          autoUpload={false}
          multiple
          hint={
            english ? 'Files are included in native FormData.' : '文件会包含在原生 FormData 中。'
          }
        />
      </FormField>
      <FormList name="members" defaultValue={[{ email: '' }]}>
        {(fields, operations) => (
          <div style={{ display: 'grid', gap: 12 }}>
            {fields.map((field) => (
              <FormField
                key={field.key}
                label={`${english ? 'Member' : '成员'} ${field.index + 1}`}
              >
                <Space>
                  <Input
                    name={`${field.name}.email`}
                    type="email"
                    placeholder="name@example.com"
                    aria-label={english ? 'Member email' : '成员邮箱'}
                  />
                  <Button variant="ghost" danger onClick={() => operations.remove(field.index)}>
                    {english ? 'Remove' : '移除'}
                  </Button>
                </Space>
              </FormField>
            ))}
            <Button variant="outline" onClick={() => operations.add({ email: '' })}>
              {english ? 'Add member' : '添加成员'}
            </Button>
          </div>
        )}
      </FormList>
      <Space>
        <Button type="submit" loading={validation.pending}>
          {english ? 'Save' : '保存'}
        </Button>
        <Button variant="outline" type="reset">
          {english ? 'Reset' : '重置'}
        </Button>
      </Space>
      {summary && <pre style={{ whiteSpace: 'pre-wrap' }}>{summary}</pre>}
    </Form>
  );
}
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
    <div style={{ maxWidth: 360 }}>
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
      <p>
        {english
          ? 'Selected labels remain visible when search results are replaced. Superseded requests cannot overwrite a later result.'
          : '搜索结果替换后仍保留选中项名称，过期请求不会覆盖较新的结果。'}
      </p>
    </div>
  );
}
